const db = require('../util/database');

class Produto {
    constructor(id, desc_produto, nome_produto, val_venda, foto_produto) {
        this.id = id;
        this.desc_produto = desc_produto;
        this.nome_produto = nome_produto;
        this.val_venda = val_venda;
        this.foto_produto = foto_produto;
    }

    save() {
        return db.promise().execute(
            'INSERT INTO tb_produto (desc_produto, nome_produto, val_venda, foto_produto) VALUES (?, ?, ?, ?)',
            [this.desc_produto, this.nome_produto, this.val_venda, this.foto_produto]
        ).then(([result]) => {
            // Retorna o ID inserido
            return { insertId: result.insertId };
        });;
    }

    static update(id, desc_produto, nome_produto, val_venda, foto_produto) {
        return db.promise().execute(
            'UPDATE tb_produto SET desc_produto = ?, nome_produto = ?, val_venda = ?, foto_produto = ? WHERE id_produto = ?',
            [desc_produto, nome_produto, val_venda, foto_produto, id]
        );
    }
}

module.exports = Produto;