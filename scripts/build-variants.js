'use strict';
const fs = require('fs');
const path = require('path');
const { definitions, getVariant, sourceText } = require('../src/variants');
for (const definition of definitions.slice(1)) {
  const variant = getVariant(definition.id);
  for (const [target, text] of [[variant.source, sourceText(definition.id)], [variant.bonusSource, sourceText(definition.id, true)]]) {
    const filename = path.join(__dirname, '..', target);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, text);
  }
}
console.log('Tiga variasi materi utama dan bonus dibuat dari sumber pesanmakan.');
