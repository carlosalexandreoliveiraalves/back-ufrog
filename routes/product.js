const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const productController = require('../controllers/product');
const authorize = require('../middlewares/verifyUser');
const authJWT = require('../middlewares/authjwt');

// Rotas para funcionários (admin)
router.post('/create', [authJWT, authorize(1)], productController.createProduct);
router.put('/update/:id', [authJWT, authorize(1)], productController.updateProduct);
router.delete('/delete/:id', [authJWT, authorize(1)], productController.deleteProduct);

// Rotas acessíveis para todos os usuários
router.get('/list', authJWT, productController.listProducts);

module.exports = router;