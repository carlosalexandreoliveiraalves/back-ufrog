// routes/imagens.js
const express = require('express');
const imageController = require('../controllers/imagens');
const authorize = require('../middlewares/verifyUserType');
const authJWT = require('../middlewares/authjwt');
const { uploadMultiple, uploadSingle } = require('../middlewares/multer'); // Middleware para upload de várias imagens

const router = express.Router();

// Rotas para adicionar, atualizar e deletar imagens (somente para funcionários/admin)
router.post('/create/:id', [authJWT, authorize, uploadMultiple], imageController.addImage);
router.put('/update/:id', [authJWT, authorize, uploadSingle], imageController.updateImage);
router.delete('/delete/:id', [authJWT, authorize], imageController.deleteImage);

// Rota acessível a todos os usuários para listar as imagens de um produto específico
router.get('/list/:id', imageController.getImageByProduct);

module.exports = router;

/* Com os authJWT e authorize
// Rotas para adicionar, atualizar e deletar imagens (somente para funcionários/admin)
router.post('/create', [authJWT, authorize, uploadMultiple], imageController.addImage);
router.put('/update/:id', [authJWT, authorize, uploadMultiple], imageController.updateImage);
router.delete('/delete/:id', [authJWT, authorize], imageController.deleteImage);


*/




