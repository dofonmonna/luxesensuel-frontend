/**
 * Génère des icônes PWA PNG minimalistes sans dépendance externe
 * Crée un PNG valide avec un fond rouge et le texte "LS" en blanc
 * Usage: node scripts/generate-pwa-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');

// Couleur LuxeSensuel
const BG_R = 204, BG_G = 0, BG_B = 0; // #CC0000

function createPNG(size) {
  // Données brutes RGBA
  const raw = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const cornerRadius = size * 0.18;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Vérifier si le pixel est dans le rectangle arrondi
      let inside = true;
      // Coins
      if (x < cornerRadius && y < cornerRadius) {
        inside = Math.hypot(x - cornerRadius, y - cornerRadius) <= cornerRadius;
      } else if (x >= size - cornerRadius && y < cornerRadius) {
        inside = Math.hypot(x - (size - cornerRadius), y - cornerRadius) <= cornerRadius;
      } else if (x < cornerRadius && y >= size - cornerRadius) {
        inside = Math.hypot(x - cornerRadius, y - (size - cornerRadius)) <= cornerRadius;
      } else if (x >= size - cornerRadius && y >= size - cornerRadius) {
        inside = Math.hypot(x - (size - cornerRadius), y - (size - cornerRadius)) <= cornerRadius;
      }

      if (inside) {
        // Dégradé subtil
        const gradientFactor = 1 - (x + y) / (size * 2) * 0.2;
        raw[idx] = Math.min(255, Math.round(BG_R * gradientFactor));
        raw[idx + 1] = Math.min(255, Math.round(BG_G * gradientFactor));
        raw[idx + 2] = Math.min(255, Math.round(BG_B * gradientFactor));
        raw[idx + 3] = 255;
      } else {
        raw[idx] = 0;
        raw[idx + 1] = 0;
        raw[idx + 2] = 0;
        raw[idx + 3] = 0;
      }
    }
  }

  // Dessiner un "L" simple en blanc au centre
  const letterSize = Math.floor(size * 0.4);
  const thickness = Math.max(3, Math.floor(size * 0.08));
  const startX = Math.floor(center - letterSize * 0.3);
  const startY = Math.floor(center - letterSize * 0.45);

  // Barre verticale du L
  for (let dy = 0; dy < letterSize; dy++) {
    for (let dx = 0; dx < thickness; dx++) {
      const px = startX + dx;
      const py = startY + dy;
      if (px >= 0 && px < size && py >= 0 && py < size) {
        const idx = (py * size + px) * 4;
        raw[idx] = 255; raw[idx + 1] = 255; raw[idx + 2] = 255; raw[idx + 3] = 255;
      }
    }
  }

  // Barre horizontale du L
  const hBarLen = Math.floor(letterSize * 0.65);
  for (let dy = 0; dy < thickness; dy++) {
    for (let dx = 0; dx < hBarLen; dx++) {
      const px = startX + dx;
      const py = startY + letterSize - thickness + dy;
      if (px >= 0 && px < size && py >= 0 && py < size) {
        const idx = (py * size + px) * 4;
        raw[idx] = 255; raw[idx + 1] = 255; raw[idx + 2] = 255; raw[idx + 3] = 255;
      }
    }
  }

  // Dessiner un petit "S" stylisé (barre ondulée) sous le L
  const sY = startY + letterSize + Math.floor(size * 0.05);
  const sThick = Math.max(2, Math.floor(thickness * 0.6));
  const sWidth = Math.floor(letterSize * 0.4);
  const sCenterX = Math.floor(center - sWidth * 0.15);

  // Ligne décorative simple
  for (let dx = -sWidth / 2; dx < sWidth / 2; dx++) {
    for (let dy = 0; dy < sThick; dy++) {
      const px = Math.floor(sCenterX + dx);
      const py = sY + dy;
      if (px >= 0 && px < size && py >= 0 && py < size) {
        const idx = (py * size + px) * 4;
        raw[idx] = 255; raw[idx + 1] = 255; raw[idx + 2] = 255; raw[idx + 3] = 180;
      }
    }
  }

  // Convertir en PNG
  // Ajouter le byte filtre (0 = None) au début de chaque ligne
  const filtered = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    filtered[y * (size * 4 + 1)] = 0; // filtre None
    raw.copy(filtered, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const compressed = zlib.deflateSync(filtered);

  // Construire le fichier PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT
  const idat = makeChunk('IDAT', compressed);

  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return ~crc;
}

// Créer le dossier
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Générer
SIZES.forEach((size) => {
  const png = createPNG(size);
  const filePath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`OK ${size}x${size} -> ${filePath} (${png.length} bytes)`);
});

console.log('\nToutes les icones PWA generees !');
