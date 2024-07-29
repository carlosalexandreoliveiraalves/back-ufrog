const Categoria = require('../models/categoria');
const db = require('../util/database');

// Cria uma nova categoria
exports.createCategory = async (req, res) => {
    console.log('Request Body:', req.body); // Log do corpo da requisição

    const { nome_cat } = req.body;

    if (!nome_cat) {
        return res.status(400).json({ message: "O nome da categoria é obrigatório" });
    }

    try {
        const result = await db.query(
            'INSERT INTO tb_categoria (nome_cat) VALUES (?)',
            [nome_cat]
        );

        res.status(201).json({ message: "Categoria criada com sucesso", categoryId: result.insertId });
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        res.status(500).json({ message: "Erro ao criar categoria" });
    }
};

// Atualiza uma categoria existente
exports.updateCategory = async (req, res) => {
    console.log('Request Body:', req.body); // Log do corpo da requisição

    const { id } = req.params;
    const { nome_cat } = req.body;

    if (!nome_cat) {
        return res.status(400).json({ message: "O nome da categoria é obrigatório" });
    }

    try {
        const result = await db.query(
            'UPDATE tb_categoria SET nome_cat = ? WHERE id = ?',
            [nome_cat, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Categoria não encontrada" });
        }

        res.status(200).json({ message: "Categoria atualizada com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
};

// Deleta uma categoria existente
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            'DELETE FROM tb_categoria WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Categoria não encontrada" });
        }

        res.status(200).json({ message: "Categoria deletada com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        res.status(500).json({ message: "Erro ao deletar categoria" });
    }
};

// Lista todas as categorias
exports.listCategories = async (req, res) => {
    try {
        const [rows, fields] = await db.promise().query('SELECT id, nome_cat FROM tb_categoria');

        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        res.status(500).json({ message: "Erro ao listar categorias" });
    }
};