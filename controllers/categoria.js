const Categoria = require('../models/categoria');
const db = require('../util/database');
const multer = require('multer');
const upload = multer(); // Configuração básica do multer

// Middleware para processar multipart/form-data
exports.createCategory = async (req, res) => {
    console.log('Request Body:', req.body); // Log do corpo da requisição
    console.log('Dados recebidos:', req.body);
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
        await db.query('DELETE FROM tb_produto_categoria WHERE id_categoria = ?', [id]);
        
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

// Lista todas as categorias do produto 
exports.listCategoriesByProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows, fields] = await db.promise().query('select tc.id, tc.nome_cat from db_ufrog.tb_categoria tc inner join db_ufrog.tb_produto_categoria tpc on tc.id = tpc.id_categoria inner join db_ufrog.tb_produto tp on tpc.id_produto = tp.id_produto where tp.id_produto = ?', 
        [id]);
        res.status(200).json(rows);
        
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        res.status(500).json({ message: "Erro ao listar categorias" });
    }
};
