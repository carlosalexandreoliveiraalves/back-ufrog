const express = require('express');
 const { body } = require('express-validator');

const router = express.Router();

const User = require('../models/user');
const authController = require('../controllers/auth');

router.post(
    '/cadastro',
    [
        body('nome').trim().not().isEmpty().withMessage('Nome é obrigatório.'),
        body('cpf')
            .trim()
            .not()
            .isEmpty()
            .withMessage('CPF é obrigatório.')
            .custom(async (cpf) => {
                const [user] = await User.findByCpf(cpf);
                if (user.length > 0) {
                    return Promise.reject('CPF já cadastrado!');
                }
            }),
        body('email')
            .isEmail()
            .withMessage('Por favor, insira um e-mail válido.')
            .custom(async (email) => {
                const [user] = await User.findByEmail(email);
                if (user.length > 0) {
                    return Promise.reject('Endereço de e-mail já cadastrado!');
                }
            })
            .normalizeEmail(),
        body('celular')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Celular é obrigatório.'),
        body('senha')
            .trim()
            .isLength({ min: 7 })
            .withMessage('A senha deve ter no mínimo 7 caracteres.')
    ],
    authController.cadastro
);


module.exports = router;