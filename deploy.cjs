const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, 'dist');
const redirectsSrc = path.join(__dirname, '_redirects');
const redirectsDst = path.join(distDir, '_redirects');

// Copier _redirects dans dist
if (fs.existsSync(redirectsSrc) && !fs.existsSync(redirectsDst)) {
  fs.copyFileSync(redirectsSrc, redirectsDst);
  console.log('✓ _redirects copié dans dist/');
}

// Créer le ZIP
const zipPath = path.join(__dirname, 'LuxeSensuel-deploy.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

try {
  execSync(
    `powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipPath}' -Force"`,
    { stdio: 'inherit' }
  );
  console.log('✓ ZIP créé :', zipPath);
} catch (e) {
  console.error('Erreur ZIP :', e.message);
}

console.log('\n=== DÉPLOIEMENT ===');
console.log('Le build est prêt dans : C:\\Users\\HP\\Downloads\\dist\\');
console.log('ZIP créé : C:\\Users\\HP\\Downloads\\LuxeSensuel-deploy.zip');
console.log('\nPour déployer sur Netlify, 2 options :');
console.log('1. Glisser le dossier "dist" sur : https://app.netlify.com/drop');
console.log('2. Ou ouvrir un terminal et lancer :');
console.log('   cd C:\\Users\\HP\\Downloads');
console.log('   npx netlify-cli deploy --prod --dir=dist');
