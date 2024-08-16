const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('Warning: TLS verification is disabled for development environment');
} else {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
}

const dev = process.env.NODE_ENV !== 'production';
console.log(`Server.js: NODE_ENV=${process.env.NODE_ENV}`);
const app = next({ dev });
const handle = app.getRequestHandler();

// Paths to your certificate and key files
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../localhost+2-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../localhost+2.pem')),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
