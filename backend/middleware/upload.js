const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        // preserve spaces by replacing them or just allow them
        cb(null, Date.now() + '-' + (file.originalname || 'upload').replace(/\s+/g, '-'));
    }
});

module.exports = multer({ storage: storage });
