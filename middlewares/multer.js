const multer = require('multer');

const storage = multer.memoryStorage();

const uploadSingle = multer({ storage: storage }).single('foto_produto');

const uploadMultiple = multer({storage: storage}).array('imagens', 10);


module.exports = {
    uploadMultiple,
    uploadSingle
  };