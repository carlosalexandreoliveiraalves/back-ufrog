const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const verifyId = require("../middlewares/verifyUserId");
const User = require("../models/user");
const authController = require("../controllers/auth");

router.post(
  "/cadastro",
  [
    body("nome").trim().not().isEmpty().withMessage("Nome é obrigatório."),
    body("cpf")
      .isString()
      .withMessage("CPF inválido")
      .trim()
      .not()
      .isEmpty()
      .withMessage("CPF é obrigatório.")
      .custom(async (cpf) => {
        const cpfExiste = await User.findByCpf(cpf);
        if (cpfExiste) {
          return Promise.reject("CPF já cadastrado!");
        }
      }),
    body("email")
      .isEmail()
      .withMessage("Por favor, insira um e-mail válido.")
      .custom(async (email) => {
        const quantidade = await User.findByEmail(email);
        if (quantidade > 0) {
          return Promise.reject("Endereço de e-mail já cadastrado!");
        }
      })
      .normalizeEmail(),
    body("celular")
      .isNumeric()
      .withMessage("Digite apenas números")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Celular é obrigatório."),
    body("senha")
      .trim()
      .isLength({ min: 7 })
      .withMessage("A senha deve ter no mínimo 7 caracteres."),

    // Validação para o campo 'data' (Data de nascimento)
    body("data")
      .isDate()
      .withMessage("Por favor, insira uma data de nascimento válida.")
      .not()
      .isEmpty()
      .withMessage("Data de nascimento é obrigatória."),

    // Validação para o campo 'enderecoTipo' (Tipo de endereço)
    body("enderecoTipo")
      .isString()
      .withMessage("Por favor, insira um tipo de endereço válido.")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Tipo de endereço é obrigatório."),

    // Validação para o campo 'destinatario'
    body("destinatario")
      .isString()
      .withMessage("Por favor, insira um nome de destinatário válido.")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Destinatário é obrigatório."),

    // Validação para o campo 'endereco'
    body("endereco")
      .isString()
      .withMessage("Por favor, insira um endereço válido.")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Endereço é obrigatório."),

    // Validação para o campo 'referencia' (opcional, mas você pode validar se quiser)
    body("referencia")
      .optional()
      .isString()
      .withMessage("Por favor, insira uma referência válida."),

    // Validação para o campo 'latitude'
    body("latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude deve ser um valor numérico válido entre -90 e 90.")
      .not()
      .isEmpty()
      .withMessage("Latitude é obrigatória."),

    // Validação para o campo 'longitude'
    body("longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage(
        "Longitude deve ser um valor numérico válido entre -180 e 180."
      )
      .not()
      .isEmpty()
      .withMessage("Longitude é obrigatória."),
  ],
  authController.cadastro
);

router.post("/verify-email/:token", authController.verifyEmail);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Por favor, insira um e-mail válido.")
      .normalizeEmail(),
    body("senha")
      .trim()
      .isLength({ min: 7 })
      .withMessage("A senha deve ter no mínimo 7 caracteres."),
  ],
  authController.login
);

router.put('/update', verifyId, authController.updateUserInfo);

router.put("/esqueci-senha", authController.esqueciSenha);

router.put("/trocar-senha", authController.resetarSenha);

router.get("/minha-conta", verifyId, authController.getUserInfo);

module.exports = router;
