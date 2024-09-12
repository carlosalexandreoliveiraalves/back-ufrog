// routes/product.js
const express = require('express');
const productController = require('../controllers/product');
const authorize = require('../middlewares/verifyUserType');
const authJWT = require('../middlewares/authjwt');
const {uploadSingle, uploadMultiple} = require('../middlewares/multer');

const router = express.Router();

// Rotas para funcionários (admin)
router.post('/create', [authJWT, authorize, uploadSingle], productController.createProduct);
router.put('/update/:id', [authJWT, authorize, uploadSingle], productController.updateProduct);
router.delete('/delete/:id', [authJWT, authorize], productController.deleteProduct);

// Rotas acessíveis para todos os usuários
router.get('/list', productController.listProducts);
router.get('/list/:categoriaId', productController.listProductsByCategory);
router.post('/list-multiple-categories', productController.listProductsByMultipleCategories);
router.get('/product/:id', productController.getProductById);

module.exports = router;

/*

com o authJWT e authorize


// Rotas para funcionários (admin)
router.post('/create', [authJWT, authorize, upload.single('foto_produto')], productController.createProduct);
router.put('/update/:id', [authJWT, authorize, upload.single('foto_produto')], productController.updateProduct);
router.delete('/delete/:id', [authJWT, authorize], productController.deleteProduct);

// Rotas acessíveis para todos os usuários
router.get('/list', productController.listProducts);

module.exports = router;

*/