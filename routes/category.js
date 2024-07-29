// routes/product.js
const express = require('express');
const categoryController = require('../controllers/categoria');
const authorize = require('../middlewares/verifyUserType');
const authJWT = require('../middlewares/authjwt');

const router = express.Router();

// Rotas para funcionários (admin)
router.post('/create', categoryController.createCategory);
router.put('/update/:id', categoryController.updateCategory);
router.delete('/delete/:id', categoryController.deleteCategory);

// Rotas acessíveis para todos os usuários
router.get('/list', categoryController.listCategories);

module.exports = router;