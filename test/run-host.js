'use strict';
const { runTests } = require('@vscode/test-electron');
const fs = require('fs');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const output = process.env.SERKOM_TEST_OUTPUT || path.join(root, '.test-output');
  process.env.SERKOM_TEST_PROJECT = path.join(output, 'host-fixture');
  process.env.SERKOM_HOST_REPORT = path.join(output, 'host-report.json');
  fs.mkdirSync(process.env.SERKOM_TEST_PROJECT, { recursive: true });
  await runTests({
    extensionDevelopmentPath: root,
    extensionTestsPath: path.join(__dirname, 'extension-host.js'),
    vscodeExecutablePath: process.env.VSCODE_EXECUTABLE || undefined,
    launchArgs: [process.env.SERKOM_TEST_PROJECT, '--disable-extensions', '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes', '--user-data-dir=' + path.join(output, 'host-user'), '--extensions-dir=' + path.join(output, 'host-extensions')]
  });
})().catch(error => { console.error(error); process.exitCode = 1; });
