import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const webDir = path.resolve(process.cwd(), 'www');

fs.rmSync(webDir, { recursive: true, force: true });

const skip = new Set(['.git', '.github', 'mobile']);

fs.cpSync(repoRoot, webDir, {
  recursive: true,
  filter(source) {
    const rel = path.relative(repoRoot, source);
    if (!rel) return true;
    const first = rel.split(path.sep)[0];
    return !skip.has(first);
  }
});

const indexPath = path.join(webDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const marker = '<!-- MOY MARKET MOBILE RUNTIME -->';
if (!html.includes(marker)) {
  const injection = [
    '',
    marker,
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="mobile-web-app-capable" content="yes">',
    '<meta name="theme-color" content="#05090d">',
    ''
  ].join('\n');

  html = html.replace('</head>', injection + '</head>');
  fs.writeFileSync(indexPath, html, 'utf8');
}

console.log('Web assets copied to mobile/www');
