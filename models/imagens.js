const db = require('../util/database');

class ImagemProduto {
    constructor(id_imagem, imagem, fk_id_produto) {
        this.id_imagem = id_imagem;
        this.imagem = imagem;
        this.fk_id_produto = fk_id_produto;
    }

    save(fk_id_produto, imagem) {
        return db.query('INSERT INTO tb_imagem_produto (imagem, fk_id_produto) VALUES (?, ?)', [this.imagem, this.fk_id_produto]);
    }

    static deleteById(id_imagem) {
        return db.query('DELETE FROM tb_imagem_produto WHERE id_imagem = ?', [id_imagem]);
    }

    static findByProductId(produtoId) {
        return db.query('SELECT * FROM tb_imagem_produto WHERE fk_id_produto = ?', [produtoId]);
    }
}

module.exports = ImagemProduto;