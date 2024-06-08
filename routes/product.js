const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const productController = require('../controllers/product');
const authorize = require('../middlewares/verifyUserType');
const authJWT = require('../middlewares/authjwt');

// Rotas para funcionários (admin)
router.post('/create', [authJWT, authorize], productController.createProduct);
router.put('/update/:id', [authJWT, authorize], productController.updateProduct);
router.delete('/delete/:id', [authJWT, authorize], productController.deleteProduct);

// Rotas acessíveis para todos os usuários
router.get('/list', productController.listProducts);

module.exports = router;

/*
const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const productController = require('../controllers/product');
const authTipoUsuario  = require('../middlewares/verifyUserType');
const authJWT = require('../middlewares/authjwt');

// Rotas para funcionários (admin)
router.post('/create', [authTipoUsuario], productController.createProduct);


router.put('/update/:id', [authJWT, authTipoUsuario], productController.updateProduct);


router.delete('/delete/:id', [authJWT, authTipoUsuario], productController.deleteProduct);

// Rotas acessíveis para todos os usuários
router.get('/list', productController.listProducts);

module.exports = router;
*/