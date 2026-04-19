const crypto = require('crypto');
const https = require('https');

const APP_KEY = '531148';
const APP_SECRET = 'PMGo9kWoUpx7PPu7qn4GwVGIze95O2JE';

const code = process.argv[2];
if (!code) {
  console.log("❌ ERREUR: Veuillez fournir le code d'autorisation AliExpress.");
  console.log("Usage: node get-token.js <TON_CODE_ALIEXPRESS>");
  process.exit(1);
}

// L'API d'authentification accepte un timestamp epoch en millisecondes
const TIMESTAMP = Date.now().toString();

const params = {
  app_key: APP_KEY,
  code: code,
  grant_type: 'authorization_code',
  sign_method: 'md5',
  timestamp: TIMESTAMP,
};

const keys = Object.keys(params).sort();
let signStr = APP_SECRET;
keys.forEach(k => signStr += k + params[k]);
signStr += APP_SECRET;

const sign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
params.sign = sign;

const query = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
const url = `https://api-sg.aliexpress.com/rest/auth/token/create?${query}`;

console.log('⏳ Récupération des tokens en cours...');

https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.access_token) {
      console.log('\n✅ SUCCÈS ! Copie ces lignes dans ton fichier backend/.env :');
      console.log('----------------------------------------------------');
      console.log(`ALIEXPRESS_TOKEN=${result.access_token}`);
      console.log(`ALIEXPRESS_REFRESH_TOKEN=${result.refresh_token}`);
      console.log('----------------------------------------------------\n');
    } else {
      console.log('\n❌ ERREUR :', result);
      console.log("Assure-toi que ton code n'a pas expiré (il est valable environ 3 à 5 minutes).");
    }
  });
}).on('error', err => {
  console.log('❌ Erreur réseau:', err.message);
});