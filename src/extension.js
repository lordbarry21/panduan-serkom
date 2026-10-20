'use strict';
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const steps = require('../data/steps.json');
const notes = require('../data/notes.json');
const { boundedIndex, advance, planEdit, methodBounds } = require('./engine');

class Guide {
  constructor(context) {
    this.context = context;
    this.root = context.workspaceState.get('projectRoot') || vscode.workspace.workspaceFolders?.[0]?.uri.toString();
    this.previews = new Map();
    this.emitter = new vscode.EventEmitter();
    this.onDidChange = this.emitter.event;
    this.pending = null;
    this.busy = false;
    context.subscriptions.push(this.emitter);
  }
  get key() { return 'progress:' + (this.root || 'no-project'); }
  get state() {
    const saved = this.context.workspaceState.get(this.key, { index: 0, completed: [] });
    return { index: boundedIndex(saved.index, steps.length), completed: Array.isArray(saved.completed) ? saved.completed.filter(x => Number.isInteger(x) && x >= 0 && x < steps.length) : [] };
  }
  get step() { return steps[this.state.index]; }
  provideTextDocumentContent(uri) { return this.previews.get(uri.toString()) || ''; }
  previewUri(name, content) {
    const uri = vscode.Uri.parse('serkom-code:/' + crypto.randomUUID() + '/' + encodeURIComponent(name));
    this.previews.set(uri.toString(), content);
    // Open preview documents retain their contents until this extension host exits.
    return uri;
  }
  async save(state) {
    await this.context.workspaceState.update(this.key, state);
    this.pending = null;
    await this.render();
  }
  async render() {
    if (!this.view) return;
    await this.view.webview.postMessage({ type: 'state', step: this.step, notes: notes[this.step.id] || [], steps: steps.map(x => ({ id: x.id, title: x.title, module: x.module, step: x.step, part: x.part })), state: this.state, project: this.root ? vscode.Uri.parse(this.root).fsPath : '', pending: !!this.pending, busy: this.busy });
  }
  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')] };
    const nonce = crypto.randomBytes(20).toString('hex');
    let html = fs.readFileSync(path.join(this.context.extensionPath, 'media/view.html'), 'utf8');
    const media = name => view.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', name)).toString();
    html = html.replaceAll('{{nonce}}', nonce).replaceAll('{{csp}}', view.webview.cspSource).replace('{{css}}', media('view.css')).replace('{{js}}', media('view.js'));
    view.webview.html = html;
    this.context.subscriptions.push(view.webview.onDidReceiveMessage(message => this.receive(message)));
    this.context.subscriptions.push(view.onDidChangeVisibility(() => this.render()));
  }
  async receive(message) {
    if (!message || typeof message.type !== 'string') return;
    if (message.type === 'ready') return this.render();
    if (this.busy) return;
    this.busy = true; await this.render();
    try {
      switch (message.type) {
        case 'project': await this.chooseProject(); break;
        case 'jump':
          if (Number.isInteger(message.index) && message.index >= 0 && message.index < steps.length) await this.save({ ...this.state, index: message.index });
          break;
        case 'next': await this.next(); break;
        case 'previous': await this.previous(); break;
        case 'uncomplete': await this.save({ ...this.state, completed: this.state.completed.filter(x => x !== this.state.index) }); break;
        case 'copy': await vscode.env.clipboard.writeText(this.step.code); await this.notice('Kode asli disalin.'); break;
        case 'code': await this.showCode(message.line); break;
        case 'open': await this.openTarget(); break;
        case 'preview': await this.prepareEdit(); break;
        case 'apply': await this.applyEdit(); break;
        case 'cancel': this.pending = null; break;
        case 'terminal': await this.openTerminal(); break;
        case 'source': await vscode.window.showTextDocument(vscode.Uri.joinPath(this.context.extensionUri, 'data/pesanmakan.md'), { preview: true, viewColumn: vscode.ViewColumn.One }); break;
        case 'reset': {
          const answer = await vscode.window.showWarningMessage('Ulangi progres panduan proyek ini? File proyek tidak diubah.', { modal: true }, 'Ulangi progres');
          if (answer) await this.save({ index: 0, completed: [] });
          break;
        }
      }
    } catch (error) { await this.notice(error.message || String(error), true); }
    finally { this.busy = false; await this.render(); }
  }
  async notice(text, error = false) {
    if (this.view) await this.view.webview.postMessage({ type: 'notice', text, error });
    if (error) vscode.window.showErrorMessage('Serkom: ' + text);
  }
  async next() {
    await this.save(advance(this.state, steps.length));
    if (this.state.completed.length === steps.length) await this.notice('Semua langkah sudah kamu tandai selesai. Jalankan aplikasi dan uji alur pelanggan serta admin.');
  }
  async previous() { await this.save({ ...this.state, index: boundedIndex(this.state.index - 1, steps.length) }); }
  async chooseProject() {
    const picked = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: 'Pilih folder proyek Laravel (yang berisi artisan)' });
    if (!picked?.length) return;
    this.root = picked[0].toString();
    await this.context.workspaceState.update('projectRoot', this.root);
    this.pending = null;
  }
  async requireRoot() {
    if (!this.root) await this.chooseProject();
    if (!this.root) throw new Error('Pilih folder proyek dulu.');
    const uri = vscode.Uri.parse(this.root);
    await vscode.workspace.fs.stat(uri);
    return uri;
  }
  async targetUri() {
    const step = this.step;
    if (step.mode === 'terminal') throw new Error('Langkah ini dikerjakan di terminal. Gunakan Salin command.');
    const root = await this.requireRoot();
    if (step.target.includes('xxxx_xx_xx_xxxxxx')) {
      const suffix = step.target.split('xxxx_xx_xx_xxxxxx')[1];
      let entries;
      try { entries = await vscode.workspace.fs.readDirectory(vscode.Uri.joinPath(root, 'database/migrations')); }
      catch { throw new Error('Folder migration belum ada. Jalankan langkah Artisan sebelumnya dulu.'); }
      const matches = entries.filter(([name, type]) => type === vscode.FileType.File && name.endsWith(suffix));
      if (!matches.length) throw new Error('File migration belum ada. Jalankan command make:model pada langkah sebelumnya.');
      const selected = matches.length === 1 ? matches[0][0] : await vscode.window.showQuickPick(matches.map(x => x[0]), { title: 'Ada beberapa migration. Pilih yang sesuai.' });
      if (!selected) return;
      return vscode.Uri.joinPath(root, 'database/migrations', selected);
    }
    if (step.target.split('/').some(x => x === '..')) throw new Error('Lokasi file tidak valid.');
    return vscode.Uri.joinPath(root, step.target);
  }
  async openTarget() {
    const uri = await this.targetUri();
    if (!uri) return;
    try { await vscode.workspace.fs.stat(uri); }
    catch (error) {
      if (error.code !== 'FileNotFound') throw error;
      if (this.step.mode !== 'file') throw new Error('File tujuan belum ada. Jalankan langkah pembuatan file/Artisan sebelumnya dulu.');
      if (!vscode.workspace.isTrusted) throw new Error('Percayai folder proyek lewat Workspace Trust sebelum membuat file.');
      const choice = await vscode.window.showInformationMessage('Buat file view kosong: ' + this.step.target + '?', 'Buat file');
      if (!choice) return;
      await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(uri, '..'));
      await vscode.workspace.fs.writeFile(uri, new Uint8Array());
    }
    const doc = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preview: false, preserveFocus: false });
    let offset = 0;
    if (this.step.method) { try { offset = methodBounds(doc.getText(), this.step.method).open + 1; } catch { /* The preview action explains missing methods. */ } }
    else if (this.step.mode === 'migration') offset = Math.max(0, doc.getText().indexOf('$table->timestamps()'));
    const pos = doc.positionAt(offset);
    editor.selection = new vscode.Selection(pos, pos);
    editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
    this.targetEditor = editor;
    return editor;
  }
  async showCode(line) {
    const language = this.step.mode === 'terminal' ? 'shellscript' : this.step.target.endsWith('.php') && !this.step.target.includes('/views/') ? 'php' : this.step.target === '.env' ? 'dotenv' : 'html';
    const uri = this.previewUri(this.step.id + (language === 'php' ? '.php' : '.txt'), this.step.code);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.languages.setTextDocumentLanguage(doc, language);
    const editor = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preview: true });
    if (Number.isInteger(line) && line > 0 && line <= doc.lineCount) {
      const range = doc.lineAt(line - 1).range;
      editor.selection = new vscode.Selection(range.start, range.end);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
  }
  async prepareEdit() {
    if (!vscode.workspace.isTrusted) throw new Error('Percayai folder proyek lewat Workspace Trust sebelum mengubah file.');
    const step = this.step;
    const uri = await this.targetUri();
    if (!uri) return;
    let editor = vscode.window.visibleTextEditors.find(e => e.document.uri.toString() === uri.toString());
    if (!editor) editor = await this.openTarget();
    if (!editor) return;
    const doc = editor.document;
    const base = doc.getText();
    const selection = { start: doc.offsetAt(editor.selection.start), end: doc.offsetAt(editor.selection.end) };
    const plan = planEdit(step, base, selection);
    if (!plan.changed) { this.pending = null; await this.notice('Kode sudah sesuai: ' + plan.reason); return; }
    this.pending = { uri, version: doc.version, base, text: plan.text, stepId: step.id, root: this.root };
    const before = this.previewUri('sebelum-' + path.basename(step.target), base);
    const after = this.previewUri('sesudah-' + path.basename(step.target), plan.text);
    await vscode.commands.executeCommand('vscode.diff', before, after, 'Serkom · ' + step.title, { viewColumn: vscode.ViewColumn.One, preview: true });
    await this.notice(plan.reason + ' Periksa perbandingan, lalu klik Terapkan perubahan di panel.');
  }
  async applyEdit() {
    if (!vscode.workspace.isTrusted) throw new Error('Workspace belum dipercaya.');
    const pending = this.pending;
    if (!pending || pending.stepId !== this.step.id || pending.root !== this.root) throw new Error('Buka pratinjau perubahan untuk langkah ini dulu.');
    const doc = await vscode.workspace.openTextDocument(pending.uri);
    if (doc.version !== pending.version || doc.getText() !== pending.base) {
      this.pending = null;
      throw new Error('File berubah sejak pratinjau. Buat pratinjau baru agar edit terbaru tidak tertimpa.');
    }
    const edit = new vscode.WorkspaceEdit();
    edit.replace(pending.uri, new vscode.Range(doc.positionAt(0), doc.positionAt(pending.base.length)), pending.text);
    if (!await vscode.workspace.applyEdit(edit)) throw new Error('VS Code tidak berhasil menerapkan perubahan.');
    this.pending = null;
    await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preview: false });
    await this.notice('Perubahan diterapkan. Tekan Ctrl+S untuk menyimpan; Ctrl+Z untuk membatalkan.');
  }
  async openTerminal() {
    const root = await this.requireRoot();
    let terminal = vscode.window.terminals.find(x => x.name === 'Serkom · ' + root.fsPath);
    if (!terminal) terminal = vscode.window.createTerminal({ name: 'Serkom · ' + root.fsPath, cwd: root.fsPath });
    terminal.show();
    await this.notice('Terminal dibuka di folder proyek. Command belum dijalankan; salin dan jalankan sendiri.');
  }
}

function activate(context) {
  const guide = new Guide(context);
  context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('serkom-code', guide));
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('serkom.guide', guide, { webviewOptions: { retainContextWhenHidden: true } }));
  const open = async () => { await vscode.commands.executeCommand('workbench.view.extension.serkom'); await vscode.commands.executeCommand('serkom.guide.focus'); };
  context.subscriptions.push(vscode.commands.registerCommand('serkom.open', open));
  context.subscriptions.push(vscode.commands.registerCommand('serkom.next', () => guide.receive({ type: 'next' })));
  context.subscriptions.push(vscode.commands.registerCommand('serkom.previous', () => guide.receive({ type: 'previous' })));
  context.subscriptions.push(vscode.window.registerUriHandler({ handleUri: () => open() }));
  return { guide, steps };
}

module.exports = { activate, Guide };
