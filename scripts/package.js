'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const manifest = require('../package.json');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
const filename = `${manifest.name}-${manifest.version}.vsix`;
execFileSync(process.execPath, [path.join(root, 'node_modules/@vscode/vsce/vsce'), 'package', '--no-dependencies', '--out', path.join(dist, filename)], { cwd: root, stdio: 'inherit' });
const installer = `@echo off\r
setlocal\r
title Pasang Panduan Serkom\r
echo Memasang Panduan Serkom ke VS Code...\r
where code.cmd >nul 2>nul\r
if not errorlevel 1 goto frompath\r
if exist "%LOCALAPPDATA%\\Programs\\Microsoft VS Code\\bin\\code.cmd" goto fromlocal\r
if exist "%ProgramFiles%\\Microsoft VS Code\\bin\\code.cmd" goto fromsystem\r
echo Buka VS Code, Ctrl+Shift+P, Extensions: Install from VSIX.\r
echo Pilih ${filename}.\r
pause\r
exit /b 1\r
:frompath\r
call code.cmd --install-extension "%~dp0${filename}" --force\r
goto check\r
:fromlocal\r
call "%LOCALAPPDATA%\\Programs\\Microsoft VS Code\\bin\\code.cmd" --install-extension "%~dp0${filename}" --force\r
goto check\r
:fromsystem\r
call "%ProgramFiles%\\Microsoft VS Code\\bin\\code.cmd" --install-extension "%~dp0${filename}" --force\r
:check\r
if errorlevel 1 goto failed\r
echo Berhasil. Tekan Ctrl+Alt+Shift+S di VS Code.\r
echo Atau Ctrl+Shift+P lalu Serkom: Buka Panduan.\r
pause\r
exit /b 0\r
:failed\r
echo Pemasangan belum berhasil. Gunakan Install from VSIX di VS Code.\r
pause\r
exit /b 1\r
`;
fs.writeFileSync(path.join(dist, 'PASANG-PANDUAN.cmd'), installer);
fs.copyFileSync(path.join(root, 'README.md'), path.join(dist, 'CARA-INSTALASI.md'));
