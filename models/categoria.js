const db = require('../util/database');


class Categoria {
    constructor(id, nome_cat) {
        this.id = id;
        this.nome_cat = nome_cat;
    };
};

module.exports = Categoria;