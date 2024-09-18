const db = require('../util/database');

class Marca {
    constructor(id_marca, nome_marca) {
        this.id_marca = id_marca;
        this.nome_marca = nome_marca;
    };

    save() {
        return db.query('INSERT INTO tb_marcas (nome_marca) VALUES (?)', [this.nome_marca]);
    };

    update() {
        return db.query('UPDATE tb_marcas SET nome_marca = ? WHERE id_marca = ?', [this.nome_marca, this.id_marca]);
    };

    static delete(id_marca) {
        return db.query('DELETE FROM tb_marcas WHERE id_marca = ?', [id_marca])
    };

    //STATIC = não precisa instanciar a class para chamar o método
    static read() { 
        return db.query('SELECT * FROM tb_marcas');
    };

    static findById(id_marca) {
        return db.query('SELECT * FROM tb_marcas WHERE id_marca = ?', [id_marca]);
    };

};

module.exports = Marca;