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
            .isString()
            .isLength({min: 11, max: 11}).withMessage('CPF inválido')
            .trim()
            .not()
            .isEmpty()
            .withMessage('CPF é obrigatório.')
            .custom(async (cpf) => {
                const quantidade = await User.findByCpf(cpf);
                if (quantidade > 0) {
                    return Promise.reject('CPF já cadastrado!');
                }
            }),
        body('email')
            .isEmail()
            .withMessage('Por favor, insira um e-mail válido.')
            .custom(async (email) => {
                const quantidade = await User.findByEmail(email);
                if (quantidade > 0) {
                    return Promise.reject('Endereço de e-mail já cadastrado!');
                }
            })
            .normalizeEmail(),
        body('celular')
            .isNumeric(). withMessage('Digite apenas números')
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


router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Por favor, insira um e-mail válido.')
        .normalizeEmail(),
    body('senha')
        .trim()
        .isLength({ min: 7 })
        .withMessage('A senha deve ter no mínimo 7 caracteres.')
],
authController.login);

router.put('/esqueci-senha', authController.esqueciSenha);

router.put('/trocar-senha', authController.resetarSenha);

module.exports = router;