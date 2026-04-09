const fs = require('fs');
const src = __dirname + '/_redirects';
const dst = __dirname + '/dist/_redirects';
if (fs.existsSync(src)) {
  fs.copyFileSync(src, dst);
  console.log('OK: _redirects copie dans dist/');
} else {
  console.log('Pas de _redirects a copier');
}
console.log('dist/ pret pour deploiement');
