const crypto = require('crypto');
const https = require('https');

const APP_KEY = '531148';
const APP_SECRET = 'PMGo9kWoUpx7PPu7qn4GwVGIze95O2JE';
const CODE = '3_531148_8IWoulejK6BDW3ZZTQBd74CL3886';
const TIMESTAMP = Date.now().toString();

const params = {
  app_key: APP_KEY,
  code: CODE,
  grant_type: 'authorization_code',
  sign_method: 'md5',
  timestamp: TIMESTAMP,
};

// Signature AliExpress
const keys = Object.keys(params).sort();
let signStr = APP_SECRET;
keys.forEach(k => signStr += k + params[k]);
signStr += APP_SECRET;

const sign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
params.sign = sign;

console.log('Sign string:', signStr);
console.log('Sign:', sign);

const query = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
const url = `https://api-sg.aliexpress.com/rest/auth/token/create?${query}`;

console.log('URL:', url);

https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('RESULT:', JSON.parse(data)));
});