/**
 * Génère les icônes PWA en PNG pour toutes les tailles requises
 * Utilise le module 'canvas' (npm install canvas)
 * Usage: node scripts/generate-icons.js
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');

// Couleurs LuxeSensuel
const BG_COLOR = '#CC0000';
const TEXT_COLOR = '#FFFFFF';

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fond arrondi
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = BG_COLOR;
  ctx.fill();

  // Dégradé subtil
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Texte "L" principal
  const mainFontSize = size * 0.5;
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `bold ${mainFontSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', size / 2, size * 0.42);

  // Texte "S" plus petit en dessous
  const subFontSize = size * 0.2;
  ctx.font = `italic ${subFontSize}px serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('S', size / 2, size * 0.72);

  // Ligne décorative
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = Math.max(1, size * 0.01);
  ctx.beginPath();
  ctx.moveTo(size * 0.25, size * 0.58);
  ctx.lineTo(size * 0.75, size * 0.58);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

// Créer le dossier si nécessaire
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Générer toutes les tailles
SIZES.forEach((size) => {
  const buffer = generateIcon(size);
  const filePath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ ${filePath} (${buffer.length} bytes)`);
});

console.log('\n🎉 Toutes les icônes PWA ont été générées !');
