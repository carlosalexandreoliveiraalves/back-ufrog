const db = require('../util/database');

module.exports = class User {
    constructor(id, fk_tipo_usuario, nome, cpf, email, celular, senha) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.celular = celular;
        this.senha = senha;
        this.fk_tipo_usuario = fk_tipo_usuario;
    };

    static async checkLoginEmail(email) {
        const [rows, fields] = await db.promise().query('SELECT * FROM tb_usuario WHERE email = ?', [email]);
        if (rows.length > 0) {
            return rows[0];  // Retorne o usuário encontrado
        }
        return null;  // Retorne null se o usuário não for encontrado
    };

    static async findByEmail(email) {
        const [rows, fields] = await db.promise().query('SELECT * FROM tb_usuario WHERE email = ?', [email]);
        if (rows.length > 0) {
            return rows[0]; 
        }
        return null;
    };

    static async findById(id) {
        const [rows, fields] = await db.promise().query('SELECT * FROM tb_usuario WHERE id_usuario = ?', [id]);
        if (rows.length > 0) {
            return rows[0]; 
        }
        return null;
    };

    static async findByCpf(cpf) {
        const [rows] = await db.promise().query('SELECT * FROM tb_usuario WHERE cpf = ?', [cpf]);
        return rows.length > 0;  // Retorna `true` se o CPF já estiver cadastrado, `false` caso contrário
    }

    static async save(user) {
        const sql = 'INSERT INTO tb_usuario (nome, cpf, email, celular, senha) VALUES (?, ?, ?, ?, ?)';
        const values = [user.nome, user.cpf, user.email, user.celular, user.senha];
        const [result, fields] = await db.promise().query(sql, values);
        return result;
    }

    static async updatePassword(userId, hashedSenha) {
        const sql = 'UPDATE tb_usuario SET senha = ? WHERE id_usuario = ?';
        const values = [hashedSenha, userId];
        const [result, fields] = await db.promise().query(sql, values);
        return result;
    }
};