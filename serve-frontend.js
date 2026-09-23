const fs = require('fs');
const path = require('path');

const root = __dirname;

const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

module.exports = function serveFrontend(req, res) {
    let pathname;

    try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

    } catch {
        res.writeHead(400);
        return res.end('Bad request');
    }

    const folder = pathname.split('/')[1];
    const allowed = ['src', 'styles', 'images', 'node_modules'];
    const isAsset = allowed.includes(folder) && path.extname(pathname);
    const filename = isAsset 
        ? path.resolve(root, '.' + pathname) 
        : path.join(root, 'index.html');

    if (isAsset && !filename.startsWith(root + path.sep)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    try {
        if (!fs.statSync(filename).isFile()) {
            throw new Error('Not a file');
        }

        res.writeHead(200, {
            'Content-Type': types[path.extname(filename)] || 'application/octet-stream'
        });

        fs.createReadStream(filename).pipe(res);

    } catch {
        res.writeHead(404);
        res.end('Not found');
    }
};