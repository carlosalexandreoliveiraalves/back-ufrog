const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');

const User = require('../models/user')

exports.cadastro = async (req, res, next) => {
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
        return res.status(422).json({ erros: erros.array() });
    }
        

    const nome = req.body.nome;
    const cpf = req.body.cpf;
    const email = req.body.email;
    const celular = req.body.celular;
    const senha = req.body.senha;

    try {
        const hashedSenha = await bcrypt.hash(senha, 12)

        const userDetails = {
            nome: nome,
            cpf: cpf,
            email: email,
            celular: celular,
            senha: hashedSenha,
        }

        const result = await User.save(userDetails);

        res.status(201).json({ message: 'Usuário cadastrado! '})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        } 
        next(err);
    }
}