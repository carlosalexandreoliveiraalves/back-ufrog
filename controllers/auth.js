const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
};

exports.login = async (req, res, next) => {
    const erros = validationResult(req);
    

    if (!erros.isEmpty()) {
        return res.status(422).json({ erros: erros.array() });
    }

    const email = req.body.email;
    const senha = req.body.senha;

    try {
        console.log(`Tentativa de login para o email: ${email}`);
        const user = await User.checkLoginEmail(email);


        if (!user) {
            console.log('Usuário não encontrado.');
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        console.log('Usuário encontrado:', user);

        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            console.log('Senha incorreta.');
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, fk_tipo_usuario: user.fk_tipo_usuario },
            'senhadaufrogparaseguranca',
            { expiresIn: '1h' }
        );

        console.log(`Login bem-sucedido para o email: ${email}`);
        res.status(200).json({ token: token, userId: user.id, role: user.fk_tipo_usuario });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        console.log('Erro no login:', err);
        next(err);
    }
};

