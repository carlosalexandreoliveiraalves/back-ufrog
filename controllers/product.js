const Produto = require('../models/produto');
const db = require('../util/database');

// Cria um novo produto
exports.createProduct = async (req, res) => {
    const { nome_produto, desc_produto, val_venda, foto_produto } = req.body;

    if (!nome_produto || !desc_produto || val_venda == null || !foto_produto) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    try {
        const novoProduto = new Produto(null, desc_produto, nome_produto, val_venda, foto_produto);
        const result = await novoProduto.save();

        res.status(201).json({ message: "Produto criado com sucesso", productId: result.insertId });
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        res.status(500).json({ message: "Erro ao criar produto" });
    }
};

// Atualiza um produto existente
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nome_produto, desc_produto, val_venda, foto_produto } = req.body;

    if (!nome_produto || !desc_produto || val_venda == null || !foto_produto) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    try {
        const result = await db.query(
            'UPDATE tb_produto SET nome_produto = ?, desc_produto = ?, val_venda = ?, foto_produto = ? WHERE id_produto = ?',
            [nome_produto, desc_produto, val_venda, foto_produto, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.status(200).json({ message: "Produto atualizado com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ message: "Erro ao atualizar produto" });
    }
};

// Deleta um produto existente
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            'DELETE FROM tb_produto WHERE id_produto = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.status(200).json({ message: "Produto deletado com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        res.status(500).json({ message: "Erro ao deletar produto" });
    }
};

// Lista todos os produtos
exports.listProducts = async (req, res) => {
    try {
        const [rows, fields] = await db.promise().query('SELECT id_produto, desc_produto, val_venda, foto_produto, nome_produto FROM tb_produto');

        if (Array.isArray(rows)) {
            res.status(200).json(rows);
        } else {
            res.status(200).json([rows]);
        }
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ message: "Erro ao listar produtos" });
    }
};