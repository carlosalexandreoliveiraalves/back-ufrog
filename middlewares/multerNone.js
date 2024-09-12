const multer = require('multer');

const storage = multer.memoryStorage();

const uploadNone = multer({storage: storage});

module.exports = uploadNone
