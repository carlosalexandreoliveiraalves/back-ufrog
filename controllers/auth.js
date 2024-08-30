const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
            process.env.JWT_SECRET, //Aqui estava a senha antiga
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

const transporter = nodemailer.createTransport({
    service: 'Gmail', // ou outro serviço de e-mail como Yahoo, Outlook, etc.
    auth: {
        user: 'ufrognaoresponder@gmail.com', // seu e-mail
        pass: 'iijk jgpr kkdi hant' // sua senha de e-mail ou uma senha de app gerada
    }
});



exports.esqueciSenha = async (req, res, next) => {
    const {email} = req.body;

    try {
        const user = await User.checkLoginEmail(email);

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado.' });
        }

        //Token para o link de geração de senha, expira em 15 min
        const resetToken = jwt.sign(
            { userId: user.id_usuario, email: user.email },  // Certifique-se de incluir userId aqui
            process.env.MUDAR_SENHA,
            { expiresIn: '15m' }
        );

        console.log(user.id_usuario);


        console.log(`Token de redefinição de senha gerado para o email: ${email}`);

        const data = {
            from: 'ufrogesquecisenha@gmail.com',
            to: email,
            subject: 'Link para mudar senha',
            html: `
                <h2>Por favor, clique no link abaixo para mudar a sua senha</h2>  
                <p>${process.env.CLIENT_URL}/redefinirSenha/${resetToken}</p>
            `
        };

        await transporter.sendMail(data);

        res.status(200).json({ message: 'E-mail enviado com sucesso. Confira ser e-mail.' });


    } catch (err) {
        console.error('Erro ao gerar token ou enviar e-mail:', err);
        res.status(500).json({ error: 'Erro ao processar solicitação.' });
        next(err);
    }
    
}

exports.resetarSenha = async (req, res, next) => {
    const { resetLink, newPass } = req.body;

    if (resetLink) {
        try {
            // Verifica se o token é válido
            jwt.verify(resetLink, process.env.MUDAR_SENHA, async (err, decodedData) => {
                if (err) {
                    return res.status(401).json({
                        error: "Token incorreto ou expirado!"
                    });
                }

                console.log(decodedData); 

                // Encontra o usuário pelo ID decodificado no token
                console.log(decodedData.userId); 
                const user = await User.findById(decodedData.userId);


                if (!user) {
                    return res.status(400).json({
                        error: "Usuário com este token não encontrado."
                    });
                }

                // Verifica se o e-mail no token é o mesmo do usuário
                if (user.email !== decodedData.email) {
                    return res.status(401).json({
                        error: "O usuário não corresponde ao token."
                    });
                }

                // Hashear a nova senha
                const hashedSenha = await bcrypt.hash(newPass, 12);

                // Atualiza a senha do usuário
                await User.updatePassword(user.id_usuario, hashedSenha);

                res.status(200).json({
                    message: "Senha alterada com sucesso!"
                });
            });
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            res.status(500).json({ error: 'Erro ao processar solicitação.' });
            next(error);
        }
    } else {
        return res.status(401).json({ message: 'Erro de autenticação' });
    }
};