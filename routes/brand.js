// routes/product.js
const express = require('express');
const brandController = require('../controllers/marca');

const authorize = require('../middlewares/verifyUserType');
const authJWT = require('../middlewares/authjwt');

const {uploadSingle, uploadMultiple} = require('../middlewares/multer');

const router = express.Router();

// Rotas para funcionários (admin)
router.post('/create', [authJWT, authorize, uploadSingle], brandController.createMarca);
router.put('/update/:id', [authJWT, authorize, uploadSingle], brandController.updateMarca);
router.delete('/delete/:id', [authJWT, authorize], brandController.deleteMarca);

// Rotas acessíveis para todos os usuários
router.get('/list', brandController.listMarcas);


module.exports = router;