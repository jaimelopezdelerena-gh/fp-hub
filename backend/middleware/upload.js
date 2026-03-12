const multer = require('multer');

// Usamos memory storage para guardar el archivo en buffer temporalmente hasta ser subido a MongoDB
const storage = multer.memoryStorage();

module.exports = multer({ storage: storage });
