const db = require('../util/database');

module.exports = class Produto {
    constructor(id_produto, desc_produto, nome_produto, val_venda, foto_produto) {
        this.id_produto = id_produto;
        this.desc_produto = desc_produto;
        this.nome_produto = nome_produto;
        this.val_venda = val_venda;
        this.foto_produto = foto_produto;
    }

    // Método para salvar o produto no banco de dados
    save() {
        return db.query(
            'INSERT INTO tb_produto (nome_produto, desc_produto, val_venda, foto_produto) VALUES (?, ?, ?, ?)',
            [this.nome_produto, this.desc_produto, this.val_venda, this.foto_produto]
        );
    }
};