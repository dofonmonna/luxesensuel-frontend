const https = require('https');
const querystring = require('querystring');

const body = querystring.stringify({
  grant_type: 'authorization_code',
  code: '3_531148_aPO3PesRadZ3TrlfH2iQBxm03735',
  client_id: '531148',
  client_secret: 'PMGo9kWoUpx7PPu7qn4GwVGIze95O2JE',
});

const options = {
  hostname: 'oauth.aliexpress.com',
  path: '/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('RESULT:', data));
});

req.write(body);
req.end();