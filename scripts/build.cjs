const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
if (path.dirname(output) !== root) throw new Error('Invalid build destination');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
for (const name of ['index.html', 'site-config.js', 'assets']) {
  fs.cpSync(path.join(root, name), path.join(output, name), { recursive: true });
}
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log('Built dist/ with only public website files.');
