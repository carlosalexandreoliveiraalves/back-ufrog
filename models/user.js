const db = require("../util/database");

module.exports = class User {
  constructor(
    id,
    fk_tipo_usuario,
    nome,
    cpf,
    email,
    celular,
    senha,
    data, // Data de nascimento
    enderecoTipo, // Tipo de endereço
    destinatario, // Destinatário
    endereco, // Endereço completo
    referencia, // Referência
    latitude, // Latitude
    longitude, // Longitude
    isVerified // Novo campo para verificar se o usuário está verificado
  ) {
    this.id = id;
    this.fk_tipo_usuario = fk_tipo_usuario;
    this.nome = nome;
    this.cpf = cpf;
    this.email = email;
    this.celular = celular;
    this.senha = senha;
    this.data = data; // Data de nascimento
    this.enderecoTipo = enderecoTipo; // Tipo de endereço
    this.destinatario = destinatario; // Destinatário
    this.endereco = endereco; // Endereço completo
    this.referencia = referencia; // Referência
    this.latitude = latitude; // Latitude
    this.longitude = longitude; // Longitude
    this.isVerified = isVerified; // Novo campo
  };

  static async checkLoginEmail(email) {
    const [rows, fields] = await db
      .promise()
      .query("SELECT * FROM tb_usuario WHERE email = ?", [email]);
    if (rows.length > 0) {
      return rows[0]; // Retorne o usuário encontrado
    }
    return null; // Retorne null se o usuário não for encontrado
  };

  static async findByEmail(email) {
    const [rows, fields] = await db
      .promise()
      .query("SELECT * FROM tb_usuario WHERE email = ?", [email]);
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  }

  static async findById(id) {
    const [rows, fields] = await db
      .promise()
      .query("SELECT * FROM tb_usuario WHERE id_usuario = ?", [id]);
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  }

  static async findByIdProvisory(id) {
    const [rows, fields] = await db
      .promise()
      .query("SELECT * FROM tb_usuario_provisorio WHERE id_usuario = ?", [id]);
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  }

  static async findByCpf(cpf) {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM tb_usuario WHERE cpf = ?", [cpf]);
    return rows.length > 0; // Retorna `true` se o CPF já estiver cadastrado, `false` caso contrário
  }

  static async existsByCpfAndEmail(cpf, email) {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM tb_usuario WHERE cpf = ? OR email = ?", [
        cpf,
        email,
      ]);
    return rows.length > 0; // Retorna `true` se CPF ou e-mail já estiverem cadastrados
  }

  static async save(user) {
    const sql =
      "INSERT INTO tb_usuario (nome, cpf, email, celular, senha, data, enderecoTipo, destinatario, endereco, referencia, latitude, longitude, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      user.nome,
      user.cpf,
      user.email,
      user.celular,
      user.senha,
      user.data, // Data de nascimento
      user.enderecoTipo, // Tipo de endereço
      user.destinatario, // Destinatário
      user.endereco, // Endereço completo
      user.referencia, // Referência
      user.latitude, // Latitude
      user.longitude, // Longitude
      user.isVerified || 0, // Verificação do usuário com valor padrão 0
    ];
    const [result] = await db.promise().query(sql, values);
    return result;
  }

  static async saveProvisorio(user) {
    const sql =
      "INSERT INTO tb_usuario_provisorio (nome, cpf, email, celular, senha, data, enderecoTipo, destinatario, endereco, referencia, latitude, longitude, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      user.nome,
      user.cpf,
      user.email,
      user.celular,
      user.senha,
      user.data, // Data de nascimento
      user.enderecoTipo, // Tipo de endereço
      user.destinatario, // Destinatário
      user.endereco, // Endereço completo
      user.referencia, // Referência
      user.latitude, // Latitude
      user.longitude, // Longitude
      user.isVerified || 0, // Verificação do usuário com valor padrão 0
    ];
    const [result] = await db.promise().query(sql, values);
    return result;
  }

  static async updateUser(userId, updateFields) {
    const updates = [];
    const values = [];

    // Construa a query dinamicamente com base nos campos fornecidos
    Object.keys(updateFields).forEach((key) => {
      updates.push(`${key} = ?`);
      values.push(updateFields[key]);
    });

    // Se nenhum campo foi enviado, retorne erro
    if (updates.length === 0) {
      throw new Error("Nenhum campo fornecido para atualizar.");
    }

    // Adicione o ID do usuário no final dos valores
    values.push(userId);

    // Execute a query de atualização dinamicamente
    const query = `UPDATE tb_usuario SET ${updates.join(
      ", "
    )} WHERE id_usuario = ?`;
    await db.execute(query, values);
  }

  static async moveToMainTable(userId) {
    // Primeiro, encontre o usuário provisório
    const [rows] = await db
      .promise()
      .query("SELECT * FROM tb_usuario_provisorio WHERE id_usuario = ?", [userId]);
  
    if (rows.length === 0) {
      throw new Error("Usuário provisório não encontrado.");
    }
  
    const user = rows[0];
  
    // Insira o usuário na tabela principal
    const sql =
      "INSERT INTO tb_usuario (nome, cpf, email, celular, senha, data, enderecoTipo, destinatario, endereco, referencia, latitude, longitude, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      user.nome,
      user.cpf,
      user.email,
      user.celular,
      user.senha,
      user.data,
      user.enderecoTipo,
      user.destinatario,
      user.endereco,
      user.referencia,
      user.latitude,
      user.longitude,
      1 // Marca como verificado
    ];
    await db.promise().query(sql, values);
  
    // Remover o usuário da tabela provisória
    await db.promise().query("DELETE FROM tb_usuario_provisorio WHERE id_usuario = ?", [userId]);
  }

  static async updatePassword(userId, hashedSenha) {
    const sql = "UPDATE tb_usuario SET senha = ? WHERE id_usuario = ?";
    const values = [hashedSenha, userId];
    const [result, fields] = await db.promise().query(sql, values);
    return result;
  }
};
