const ImagemProduto = require('../models/imagens');
const db = require('../util/database');
const multer = require('../middlewares/multer');

exports.addImage = async (req, res) => {
    const produtoId = req.params.id;
    const imagens = req.files;  // Suporta múltiplos arquivos

    if (!produtoId) {
        return res.status(400).json({ message: "Produto ID é obrigatório" });
    }

    if (!imagens || imagens.length === 0) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
    }

    try {
        // Itera sobre os arquivos recebidos e os salva no banco de dados
        for (const file of imagens) {
            const query = 'INSERT INTO tb_imagem_produto (imagem, fk_id_produto) VALUES (?, ?)';
            await db.query(query, [file.buffer, produtoId]);  // Insere a imagem e o ID do produto
        }


        res.status(201).json({ message: "Imagens adicionadas com sucesso" });
    } catch (error) {
        console.error("Erro ao adicionar imagens:", error);
        res.status(500).json({ message: "Erro ao adicionar imagens" });
    }
};

exports.updateImage = async (req, res) => {
    const { id } = req.params;  // ID do produto associado à imagem
    const foto_produto = req.file; // Nova imagem enviada no corpo da requisição

    try {
        // Verifica se o produto existe e obtém a imagem existente
        const [existingProduct] = await db.query(
            "SELECT imagem FROM tb_imagem_produto WHERE id_imagem = ?",
            [id]
        );
    
        if (!existingProduct) {
            return res.status(404).json({ message: "Imagem não encontrada" });
        }

        // Se nenhuma nova imagem for enviada, mantém a imagem existente
        const imagemToUpdate = foto_produto ? foto_produto.buffer : existingProduct.imagem;

        // Atualiza a imagem no banco de dados (usando a imagem nova ou a existente)
        const result = await db.query(
            'UPDATE tb_imagem_produto SET imagem = ? WHERE id_imagem = ?',
            [imagemToUpdate, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Imagem não encontrada" });
        }

        res.status(200).json({ message: "Imagem atualizada com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar imagem:", error);
        res.status(500).json({ message: "Erro ao atualizar imagem" });
    }
};


exports.getImageByProduct = async (req, res) => {
    const { id } = req.params;  // ID do produto

    try {
        const result = await db.query('SELECT * FROM tb_imagem_produto WHERE fk_id_produto = ?', [id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Imagens não encontradas" });
        }

        // Mapeia todas as imagens e converte para base64
        const imagens = result.map(image => {
            return {
                id_imagem: image.id_imagem,
                fk_id_produto: image.fk_id_produto,
                url: `data:image/jpeg;base64,${Buffer.from(image.imagem).toString('base64')}`  // Converte para base64
            };
        });

        // Retorna todas as imagens
        res.status(200).json(imagens);
    } catch (error) {
        console.error("Erro ao buscar imagem:", error);
        res.status(500).json({ message: "Erro ao buscar imagem" });
    }
};

exports.deleteImage = async (req, res) => {
    const { id } = req.params;  // ID da imagem a ser deletada

    try {
        const result = await db.query('DELETE FROM tb_imagem_produto WHERE id_imagem = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Imagem não encontrada" });
        }

        res.status(200).json({ message: "Imagem deletada com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar imagem:", error);
        res.status(500).json({ message: "Erro ao deletar imagem" });
    }
};