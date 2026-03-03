const http = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const token = jwt.sign({ user: { id: 'test' } }, process.env.JWT_SECRET || 'secret123');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let body = '';

// title
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="title"\r\n\r\n';
body += 'Test\r\n';

// description
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="description"\r\n\r\n';
body += 'Test\r\n';

// category
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="category"\r\n\r\n';
body += 'ASIR\r\n';

// previewImage
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="previewImage"; filename="preview.jpg"\r\n';
body += 'Content-Type: image/jpeg\r\n\r\n';
body += 'fake-image-data\r\n';

// files
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="files"; filename="file.pdf"\r\n';
body += 'Content-Type: application/pdf\r\n\r\n';
body += 'fake-pdf-data\r\n';

body += '--' + boundary + '--\r\n';

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/posts',
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary.slice(2),
        'Content-Length': Buffer.byteLength(body),
        'x-auth-token': token
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(body);
req.end();
