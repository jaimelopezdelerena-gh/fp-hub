const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const token = jwt.sign({ user: { id: 'test' } }, process.env.JWT_SECRET || 'secret123');

async function test() {
    try {
        const fetch = (await import('node-fetch')).default;
        const FormData = (await import('form-data')).default;

        const form = new FormData();
        form.append('title', 'Test Preview Image');
        form.append('description', 'Test Description');
        form.append('category', 'ASIR');

        // Create a dummy image
        const imgPath = path.join(__dirname, 'uploads', 'dummy.png');
        if (!fs.existsSync(imgPath)) {
            fs.writeFileSync(imgPath, 'dummy data');
        }
        form.append('previewImage', fs.createReadStream(imgPath));

        const res = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'x-auth-token': token
            },
            body: form
        });

        console.log('Status:', res.status);
        console.log('Body:', await res.text());
    } catch (err) {
        console.error('Error:', err);
    }
}
test();
