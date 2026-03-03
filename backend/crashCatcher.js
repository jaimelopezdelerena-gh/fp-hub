const fs = require('fs');

// Fetching with dummy token
fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'byelecprol@gmail.com', password: 'password123' }) // assuming password is password123 or adjust later to create a dummy user
}).then(r => r.json()).then(data => {
    fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test', email: 'test12345@test.com', password: 'password123' })
    }).then(r => r.json()).then(data => {
        const token = data.token;
        console.log("Using token:", token);
        const formData = new FormData();
        formData.append('title', 'Test');
        formData.append('description', 'Test');
        formData.append('category', 'ASIR');

        // Let's add multiple files
        formData.append('files', new Blob(['123'], { type: 'text/plain' }), 'test1.txt');

        fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: { 'x-auth-token': token },
            body: formData
        }).then(res => res.text()).then(html => {
            console.log("Crash HTML:", html);
            process.exit(0);
        });
    });
});
