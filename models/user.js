const db = require('../util/database');

module.exports = class User {
    constructor(id, nome, cpf, email, celular, senha) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.celular = celular;
        this.senha = senha;
    }

    static async findByEmail(email) {
        const [rows, fields] = await db.promise().query('SELECT * FROM tb_usuario WHERE email = ?', [email]);
        return rows;
    }

    static async findByCpf(cpf) {
        const [rows, fields] = await db.promise().query('SELECT * FROM tb_usuario WHERE cpf = ?', [cpf]);
        return rows;
    }

    static async save(user) {
        const sql = 'INSERT INTO tb_usuario (nome, cpf, email, celular, senha) VALUES (?, ?, ?, ?, ?)';
        const values = [user.nome, user.cpf, user.email, user.celular, user.senha];
        const [result, fields] = await db.promise().query(sql, values);
        return result;
    }
};