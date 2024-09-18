const Produto = require("../models/produto");
const db = require("../util/database");

// Cria um novo produto
exports.createProduct = async (req, res) => {
  console.log("Request Body:", req.body); // Log do corpo da requisição
  console.log("Request File:", req.file); // Log do arquivo da requisição

  const {
    nome_produto,
    desc_produto,
    val_venda,
    categorias,
    marca: id_marca,
  } = req.body;
  const foto_produto = req.file ? req.file.buffer : null;

  if (
    !nome_produto ||
    !desc_produto ||
    !val_venda ||
    !foto_produto ||
    !id_marca
  ) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios" });
  }

  // Converta categorias de string para array de IDs
  const categoriasArray = categorias
    ? categorias.split(",").map((id) => parseInt(id.trim(), 10))
    : [];

  // Adicione a categoria padrão "9" se nenhuma categoria foi fornecida
  if (categoriasArray.length === 0) {
    categoriasArray.push(9);
  }

  // Verifique se val_venda é um número válido
  if (isNaN(parseFloat(val_venda))) {
    return res.status(400).json({ message: "Valor de venda inválido" });
  }

  try {
    // Cria uma nova instância do produto
    const novoProduto = new Produto(
      null,
      desc_produto,
      nome_produto,
      val_venda,
      foto_produto,
      id_marca
    );

    // Salva o produto e obtém o ID
    const result = await novoProduto.save(); // Agora deve retornar { insertId: ... }
    const produtoId = result.insertId;

    // Verifica se produtoId foi definido
    if (!produtoId) {
      throw new Error("Produto ID não retornado após salvar o produto.");
    }

    console.log("Produto ID:", produtoId); // Log para verificar o produtoId

    // Insere registros na tabela produto_categoria para cada categoria fornecida
    for (const categoriaId of categoriasArray) {
      await db.query(
        "INSERT INTO tb_produto_categoria (id_produto, id_categoria) VALUES (?, ?)",
        [produtoId, categoriaId]
      );
    }

    res
      .status(201)
      .json({ message: "Produto criado com sucesso", productId: produtoId });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ message: "Erro ao criar produto" });
  }
};

// Atualiza um produto existente
exports.updateProduct = async (req, res) => {
  console.log("Request Body:", req.body); // Log do corpo da requisição
  console.log("Request File:", req.file); // Log do arquivo da requisição
  const { id } = req.params;

  const {
    nome_produto,
    desc_produto,
    val_venda,
    categorias,
    marca: id_marca,
  } = req.body;
  const foto_produto = req.file ? req.file.buffer : null;

  if (!nome_produto || !desc_produto || val_venda == null) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios" });
  }

  // Converta categorias de string para array de IDs
  const categoriasArray = categorias
    ? categorias
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id))
    : [];

  // Adicione a categoria padrão "9" se nenhuma categoria foi fornecida
  if (categoriasArray.length === 0) {
    categoriasArray.push(9);
  }

  // Verifique se val_venda é um número válido
  if (isNaN(parseFloat(val_venda))) {
    return res.status(400).json({ message: "Valor de venda inválido" });
  }

  try {
    //Primeiro é feito uma verificação se foi enviado uma imagem, caso não tenha sido,
    //ele pegará a imagem do produto atual no banco e jogará para ele mesmo...
    //Não consegui fazer uma solução no front... Deve ser refatorado...
    const [existingProduct] = await db.query(
      "SELECT foto_produto FROM tb_produto WHERE id_produto = ?",
      [id]
    );

    if (!existingProduct) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    // Se nenhuma nova imagem for enviada, mantém a imagem existente
    const fotoToUpdate = foto_produto
      ? foto_produto
      : existingProduct.foto_produto;

    // Atualiza o produto
    const result = await Produto.update(
      id,
      desc_produto,
      nome_produto,
      val_venda,
      fotoToUpdate,
      id_marca
    );

    // Verifica se a atualização foi bem-sucedida
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    // Remove categorias antigas e insere as novas
    await db.query("DELETE FROM tb_produto_categoria WHERE id_produto = ?", [
      id,
    ]);

    for (const categoriaId of categoriasArray) {
      // Verifica se categoriaId é um número válido
      if (!isNaN(categoriaId)) {
        await db.query(
          "INSERT INTO tb_produto_categoria (id_produto, id_categoria) VALUES (?, ?)",
          [id, categoriaId]
        );
      } else {
        console.error("ID de categoria inválido:", categoriaId);
      }
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
    await db.query("DELETE FROM tb_produto_categoria WHERE id_produto = ?", [
      id,
    ]);

    await db.query("DELETE FROM tb_imagem_produto WHERE fk_id_produto = ?", [
      id,
    ]);

    const result = await db.query(
      "DELETE FROM tb_produto WHERE id_produto = ?",
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
    const [rows, fields] = await db
      .promise()
      .query(
        "SELECT tp.*, tm.nome_marca FROM tb_produto tp INNER JOIN tb_marcas tm ON tp.fk_id_marca = tm.id_marca"
      );

    // Converte o BLOB em Base64
    const products = rows.map((product) => ({
      ...product,
      foto_produto: product.foto_produto
        ? `data:image/jpeg;base64,${product.foto_produto.toString("base64")}`
        : null,
    }));

    res.status(200).json(products);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ message: "Erro ao listar produtos" });
  }
};

// Lista produtos por categoria
exports.listProductsByCategory = async (req, res) => {
  const { categoriaId } = req.params;

  try {
    const [rows] = await db.promise().query(
      `
          SELECT p.id_produto, p.nome_produto, p.desc_produto, p.val_venda, p.foto_produto, 
                   GROUP_CONCAT(c.nome_cat) AS categorias
            FROM tb_produto p
            LEFT JOIN tb_produto_categoria pc ON p.id_produto = pc.id_produto
            LEFT JOIN tb_categoria c ON pc.id_categoria = c.id
            WHERE pc.id_categoria = ?
            GROUP BY p.id_produto
      `,
      [categoriaId]
    );

    // Converte o BLOB em Base64
    const products = rows.map((product) => ({
      ...product,
      foto_produto: product.foto_produto
        ? `data:image/jpeg;base64,${product.foto_produto.toString("base64")}`
        : null,
      categorias: product.categorias ? product.categorias.split(",") : [],
    }));

    res.status(200).json(products);
  } catch (error) {
    console.error("Erro ao listar produtos por categoria:", error);
    res.status(500).json({ message: "Erro ao listar produtos por categoria" });
  }
};

// Lista produtos por múltiplas categorias
exports.listProductsByMultipleCategories = async (req, res) => {
  const { categoriaIds } = req.body;

  // Caso nenhum ID de categoria seja fornecido, listar todos os produtos
  if (
    !categoriaIds ||
    !Array.isArray(categoriaIds) ||
    categoriaIds.length === 0
  ) {
    try {
      const [rows] = await db.promise().query(`
              SELECT p.id_produto, p.nome_produto, p.desc_produto, p.val_venda, p.foto_produto,
                     GROUP_CONCAT(c.nome_cat) AS categorias
                FROM tb_produto p
                LEFT JOIN tb_produto_categoria pc ON p.id_produto = pc.id_produto
                LEFT JOIN tb_categoria c ON pc.id_categoria = c.id
                GROUP BY p.id_produto
          `);

      // Converte o BLOB em Base64
      const products = rows.map((product) => ({
        ...product,
        foto_produto: product.foto_produto
          ? `data:image/jpeg;base64,${product.foto_produto.toString("base64")}`
          : null,
        categorias: product.categorias ? product.categorias.split(",") : [],
      }));

      return res.status(200).json(products);
    } catch (error) {
      console.error("Erro ao listar todos os produtos:", error);
      return res
        .status(500)
        .json({ message: "Erro ao listar todos os produtos" });
    }
  }

  // Caso um ou mais IDs de categoria sejam fornecidos
  try {
    const placeholders = categoriaIds.map(() => "?").join(",");
    const query = `
          SELECT p.id_produto, p.nome_produto, p.desc_produto, p.val_venda, p.foto_produto,
                 GROUP_CONCAT(c.nome_cat) AS categorias
            FROM tb_produto p
            INNER JOIN tb_produto_categoria pc ON p.id_produto = pc.id_produto
            INNER JOIN tb_categoria c ON pc.id_categoria = c.id
            WHERE pc.id_categoria IN (${placeholders})
            GROUP BY p.id_produto
            HAVING COUNT(DISTINCT pc.id_categoria) = ?
      `;

    const [rows] = await db
      .promise()
      .query(query, [...categoriaIds, categoriaIds.length]);

    // Converte o BLOB em Base64
    const products = rows.map((product) => ({
      ...product,
      foto_produto: product.foto_produto
        ? `data:image/jpeg;base64,${product.foto_produto.toString("base64")}`
        : null,
      categorias: product.categorias ? product.categorias.split(",") : [],
    }));

    res.status(200).json(products);
  } catch (error) {
    console.error("Erro ao listar produtos por múltiplas categorias:", error);
    res
      .status(500)
      .json({ message: "Erro ao listar produtos por múltiplas categorias" });
  }
};

// backend/controllers/product.js
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  console.log("ID recebido:", id); // Log para verificar o ID recebido

  try {
    const [rows] = await db
      .promise()
      .query(
        "SELECT id_produto, desc_produto, val_venda, foto_produto, nome_produto FROM tb_produto WHERE id_produto = ?",
        [id]
      );

    console.log("Resultado da consulta:", rows); // Log para verificar o resultado da consulta

    if (rows.length === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const product = rows[0];
    product.foto_produto = product.foto_produto
      ? `data:image/jpeg;base64,${product.foto_produto.toString("base64")}`
      : null;

    res.status(200).json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ message: "Erro ao buscar produto" });
  }
};

exports.listProductsByBrandAndCategory = async (req, res) => {
  const { marcaId } = req.query; // Marca ainda é passada como query
  const { categoriaIds } = req.body; // Categorias são passadas pelo corpo da requisição

  // Validação: Verifica se marcaId ou categoriaIds foram fornecidos
  if (!marcaId && (!categoriaIds || categoriaIds.length === 0)) {
    return res.status(400).json({ message: "Marca ou categorias devem ser fornecidos" });
  }

  try {
    // Inicia a query base
    let query = `
      SELECT tp.id_produto, tp.nome_produto, tp.desc_produto, tp.val_venda, tp.foto_produto, tm.nome_marca,
             GROUP_CONCAT(DISTINCT tc.nome_cat) AS categorias
        FROM tb_produto tp
        INNER JOIN tb_marcas tm ON tp.fk_id_marca = tm.id_marca
        LEFT JOIN tb_produto_categoria tpc ON tp.id_produto = tpc.id_produto
        LEFT JOIN tb_categoria tc ON tpc.id_categoria = tc.id
    `;

    // Filtros opcionais
    const conditions = [];
    const params = [];

    // Filtra por marca, se fornecida
    if (marcaId) {
      conditions.push("tp.fk_id_marca = ?");
      params.push(marcaId);
    }

    // Filtra por múltiplas categorias, se fornecidas
    if (categoriaIds && Array.isArray(categoriaIds) && categoriaIds.length > 0) {
      const placeholders = categoriaIds.map(() => "?").join(",");
      conditions.push(`
        tp.id_produto IN (
          SELECT id_produto 
          FROM tb_produto_categoria 
          WHERE id_categoria IN (${placeholders})
          GROUP BY id_produto 
          HAVING COUNT(DISTINCT id_categoria) = ?
        )
      `);
      params.push(...categoriaIds, categoriaIds.length);
    }

    // Se houver filtros, adicione-os à query
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY tp.id_produto";

    // Executa a query
    const [rows] = await db.promise().query(query, params);

    // Converte o BLOB em Base64 para exibir a imagem
    const products = rows.map((product) => ({
      ...product,
      foto_produto: product.foto_produto
        ? `data:image/jpeg;base64,${product.foto_produto.toString("base64")}`
        : null,
      categorias: product.categorias ? product.categorias.split(",") : [],
    }));

    res.status(200).json(products);
  } catch (error) {
    console.error("Erro ao listar produtos por marca e categorias:", error);
    res.status(500).json({ message: "Erro ao listar produtos por marca e categorias" });
  }
};
