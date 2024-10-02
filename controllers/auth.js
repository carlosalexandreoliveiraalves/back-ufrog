const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/user");

const transporter = nodemailer.createTransport({
  service: "Gmail", // ou outro serviço de e-mail como Yahoo, Outlook, etc.
  auth: {
    user: "ufrognaoresponder@gmail.com", // seu e-mail
    pass: "iijk jgpr kkdi hant", // sua senha de e-mail ou uma senha de app gerada
  },
});

exports.cadastro = async (req, res, next) => {
  const erros = validationResult(req);

  if (!erros.isEmpty()) {
    return res.status(422).json({ erros: erros.array() });
  }

  const {
    nome,
    cpf,
    email,
    celular,
    senha,
    latitude,
    longitude,
    data, // Data de nascimento
    enderecoTipo, // Tipo de endereço
    destinatario, // Destinatário
    endereco, // Endereço completo
    referencia, // Referência
  } = req.body;

  try {
    //Verifica se usuário já existe
    const exists = await User.existsByCpfAndEmail(cpf, email);
    if (exists) {
      return res.status(409).json({ message: "CPF ou e-mail já cadastrados!" });
    }

    const hashedSenha = await bcrypt.hash(senha, 12);

    const userDetails = {
      nome: nome,
      cpf: cpf,
      email: email,
      celular: celular,
      senha: hashedSenha,
      latitude: latitude,
      longitude: longitude,
      data: data, // Salvando data de nascimento
      enderecoTipo: enderecoTipo, // Salvando tipo do endereço
      destinatario: destinatario, // Salvando destinatário
      endereco: endereco, // Salvando endereço completo
      referencia: referencia, // Salvando referência
    };

    const result = await User.saveProvisorio(userDetails);

    // Gera token de verificação
    const verificationToken = jwt.sign(
      { userId: result.insertId, email: email }, // userId gerado ao salvar
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    
    const mailOptions = {
      from: "ufrognaoresponder@gmail.com",
      to: email,
      subject: "Verifique seu e-mail para finalizar o cadastro",
      html: `
          <h2>Por favor, clique no link abaixo para verificar seu e-mail e finalizar o cadastro</h2>
          <p>${process.env.CLIENT_URL}/verificacao/${verificationToken}</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    console.log(verificationToken);

    res
      .status(201)
      .json({ message: "Verifique seu e-mail para concluir o cadastro." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
    // Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, email } = decoded;

    // Verifique se o usuário existe
    const user = await User.findByIdProvisory(userId);
    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    // Verifique se o e-mail corresponde
    if (user.email !== email) {
      return res
        .status(401)
        .json({ message: "Usuário não corresponde ao token." });
    }

    // Mova o usuário para a tabela principal e remova da provisória
    await User.moveToMainTable(userId);

    res
      .status(200)
      .json({ message: "E-mail verificado com sucesso! Cadastro concluído." });
  } catch (err) {
    console.error("Erro ao verificar e-mail:", err);
    res.status(500).json({ error: "Erro ao processar verificação de e-mail." });
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
      console.log("Usuário não encontrado.");
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Verifique seu e-mail antes de fazer login." });
    }

    console.log("Usuário encontrado:", user);

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      console.log("Senha incorreta.");
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const token = jwt.sign(
      {
        userId: user.id_usuario,
        email: user.email,
        fk_tipo_usuario: user.fk_tipo_usuario,
        nome: user.nome,
        cpf: user.cpf,
        celular: user.celular,
        latitude: user.latitude,
        longitude: user.longitude,
        enderecoTipo: user.enderecoTipo,
        destinatario: user.destinatario,
        endereco: user.endereco,
        referencia: user.referencia,
      },
      process.env.JWT_SECRET, //Aqui estava a senha antiga
      { expiresIn: "1h" }
    );

    console.log("Dados para o token:", {
      userId: user.id_usuario,
      email: user.email,
      fk_tipo_usuario: user.fk_tipo_usuario,
      nome: user.nome,
      cpf: user.cpf,
      celular: user.celular,
      latitude: user.latitude,
      longitude: user.longitude,
      enderecoTipo: user.enderecoTipo,
      destinatario: user.destinatario,
      endereco: user.endereco,
      referencia: user.referencia,
    });

    console.log(`Login bem-sucedido para o email: ${email}`);
    res.status(200).json({
      token: token,
      userId: user.id_usuario,
      role: user.fk_tipo_usuario,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log("Erro no login:", err);
    next(err);
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    const userId = req.userId; // O userId será atribuído pelo middleware isAuth
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json({
      id: user.id_usuario,
      nome: user.nome,
      email: user.email,
      celular: user.celular,
      cpf: user.cpf,
      latitude: user.latitude, // Adicionado
      longitude: user.longitude, // Adicionado
      enderecoTipo: user.enderecoTipo, // Adicionado
      destinatario: user.destinatario, // Adicionado
      endereco: user.endereco, // Adicionado
      referencia: user.referencia, // Adicionado
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // Erro interno do servidor
    }
    next(err); // Passa o erro para o próximo middleware de tratamento de erros
  }
};

exports.updateUserInfo = async (req, res, next) => {
  const userId = req.userId;
  const {
    nome,
    celular,
    latitude,
    longitude,
    enderecoTipo,
    destinatario,
    endereco,
    referencia,
  } = req.body;

  try {
    // Verifique se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Crie um objeto com os campos que foram enviados para a atualização
    const updateFields = {};
    if (nome) updateFields.nome = nome;
    if (celular) updateFields.celular = celular;
    if (latitude) updateFields.latitude = latitude;
    if (longitude) updateFields.longitude = longitude;
    if (enderecoTipo) updateFields.enderecoTipo = enderecoTipo;
    if (destinatario) updateFields.destinatario = destinatario;
    if (endereco) updateFields.endereco = endereco;
    if (referencia) updateFields.referencia = referencia;

    // Chame o método updateUser para atualizar os dados
    await User.updateUser(userId, updateFields);

    res.status(200).json({ message: "Perfil atualizado com sucesso!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.esqueciSenha = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.checkLoginEmail(email);

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    //Token para o link de geração de senha, expira em 15 min
    const resetToken = jwt.sign(
      { userId: user.id_usuario, email: user.email }, // Certifique-se de incluir userId aqui
      process.env.MUDAR_SENHA,
      { expiresIn: "15m" }
    );

    console.log(user.id_usuario);

    console.log(`Token de redefinição de senha gerado para o email: ${email}`);

    const data = {
      from: "ufrogesquecisenha@gmail.com",
      to: email,
      subject: "Enlace para cambiar contraseña",
      html: `
                <h2>Por favor, hacé clic en el enlace abajo para cambiar tu contraseña</h2>  
                <p>${process.env.CLIENT_URL}/redefinirSenha/${resetToken}</p>
            `,
    };

    await transporter.sendMail(data);

    res
      .status(200)
      .json({ message: "E-mail enviado com sucesso. Confira ser e-mail." });
  } catch (err) {
    console.error("Erro ao gerar token ou enviar e-mail:", err);
    res.status(500).json({ error: "Erro ao processar solicitação." });
    next(err);
  }
};

exports.resetarSenha = async (req, res, next) => {
  const { resetLink, newPass } = req.body;

  if (resetLink) {
    try {
      // Verifica se o token é válido
      jwt.verify(
        resetLink,
        process.env.MUDAR_SENHA,
        async (err, decodedData) => {
          if (err) {
            return res.status(401).json({
              error: "Token incorreto ou expirado!",
            });
          }

          console.log(decodedData);

          // Encontra o usuário pelo ID decodificado no token
          console.log(decodedData.userId);
          const user = await User.findById(decodedData.userId);

          if (!user) {
            return res.status(400).json({
              error: "Usuário com este token não encontrado.",
            });
          }

          // Verifica se o e-mail no token é o mesmo do usuário
          if (user.email !== decodedData.email) {
            return res.status(401).json({
              error: "O usuário não corresponde ao token.",
            });
          }

          // Hashear a nova senha
          const hashedSenha = await bcrypt.hash(newPass, 12);

          // Atualiza a senha do usuário
          await User.updatePassword(user.id_usuario, hashedSenha);

          res.status(200).json({
            message: "Senha alterada com sucesso!",
          });
        }
      );
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      res.status(500).json({ error: "Erro ao processar solicitação." });
      next(error);
    }
  } else {
    return res.status(401).json({ message: "Erro de autenticação" });
  }
};
