const Produto = require('../models/produto');
const db = require('../util/database');

// Cria um novo produto
exports.createProduct = async (req, res) => {
  console.log('Request Body:', req.body); // Log do corpo da requisição
  console.log('Request File:', req.file); // Log do arquivo da requisição

  const { nome_produto, desc_produto, val_venda, categorias } = req.body;
  const foto_produto = req.file ? req.file.buffer : null;

  if (!nome_produto || !desc_produto || !val_venda || !foto_produto) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  // Converta categorias de string para array de IDs
  const categoriasArray = categorias ? categorias.split(',').map(id => parseInt(id.trim(), 10)) : [];

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
      const novoProduto = new Produto(null, desc_produto, nome_produto, val_venda, foto_produto);
      
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
          await db.query('INSERT INTO tb_produto_categoria (id_produto, id_categoria) VALUES (?, ?)', [produtoId, categoriaId]);
      }

      res.status(201).json({ message: "Produto criado com sucesso", productId: produtoId });
  
  } catch (error) {
      console.error("Erro ao criar produto:", error);
      res.status(500).json({ message: "Erro ao criar produto" });
  }
};


// Atualiza um produto existente
exports.updateProduct = async (req, res) => {
  console.log('Request Body:', req.body); // Log do corpo da requisição
  console.log('Request File:', req.file); // Log do arquivo da requisição

  const { id } = req.params;
  const { nome_produto, desc_produto, val_venda, categorias } = req.body;
  const foto_produto = req.file ? req.file.buffer : null;

  if (!nome_produto || !desc_produto || val_venda == null || (!foto_produto && !req.body.foto_produto)) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  // Converta categorias de string para array de IDs
  const categoriasArray = categorias ? categorias.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [];

  // Adicione a categoria padrão "9" se nenhuma categoria foi fornecida
  if (categoriasArray.length === 0) {
    categoriasArray.push(9);
  }

  // Verifique se val_venda é um número válido
  if (isNaN(parseFloat(val_venda))) {
      return res.status(400).json({ message: "Valor de venda inválido" });
  }

  try {
      // Atualiza o produto
      const result = await db.query(
          'UPDATE tb_produto SET desc_produto = ?, nome_produto = ?, val_venda = ?, foto_produto = ? WHERE id_produto = ?',
          [desc_produto, nome_produto, val_venda, foto_produto ? foto_produto : req.body.foto_produto, id]
      );

      // Verifica se a atualização foi bem-sucedida
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Produto não encontrado" });
      }

      // Remove categorias antigas e insere as novas
      await db.query('DELETE FROM tb_produto_categoria WHERE id_produto = ?', [id]);

      for (const categoriaId of categoriasArray) {
          // Verifica se categoriaId é um número válido
          if (!isNaN(categoriaId)) {
              await db.query('INSERT INTO tb_produto_categoria (id_produto, id_categoria) VALUES (?, ?)', [id, categoriaId]);
          } else {
              console.error('ID de categoria inválido:', categoriaId);
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
        await db.query('DELETE FROM tb_produto_categoria WHERE id_produto = ?', [id]);

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

        // Converte o BLOB em Base64
        const products = rows.map(product => ({
            ...product,
            foto_produto: product.foto_produto ? `data:image/jpeg;base64,${product.foto_produto.toString('base64')}` : null
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
      const [rows] = await db.promise().query(`
          SELECT p.id_produto, p.nome_produto, p.desc_produto, p.val_venda, p.foto_produto, 
                   GROUP_CONCAT(c.nome_cat) AS categorias
            FROM tb_produto p
            LEFT JOIN tb_produto_categoria pc ON p.id_produto = pc.id_produto
            LEFT JOIN tb_categoria c ON pc.id_categoria = c.id
            WHERE pc.id_categoria = ?
            GROUP BY p.id_produto
      `, [categoriaId]);

      // Converte o BLOB em Base64
      const products = rows.map(product => ({
          ...product,
          foto_produto: product.foto_produto ? `data:image/jpeg;base64,${product.foto_produto.toString('base64')}` : null,
          categorias: product.categorias ? product.categorias.split(',') : []
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
  if (!categoriaIds || !Array.isArray(categoriaIds) || categoriaIds.length === 0) {
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
          const products = rows.map(product => ({
              ...product,
              foto_produto: product.foto_produto ? `data:image/jpeg;base64,${product.foto_produto.toString('base64')}` : null,
              categorias: product.categorias ? product.categorias.split(',') : []
          }));

          return res.status(200).json(products);
      } catch (error) {
          console.error("Erro ao listar todos os produtos:", error);
          return res.status(500).json({ message: "Erro ao listar todos os produtos" });
      }
  }

  // Caso um ou mais IDs de categoria sejam fornecidos
  try {
      const placeholders = categoriaIds.map(() => '?').join(',');
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

      const [rows] = await db.promise().query(query, [...categoriaIds, categoriaIds.length]);

      // Converte o BLOB em Base64
      const products = rows.map(product => ({
          ...product,
          foto_produto: product.foto_produto ? `data:image/jpeg;base64,${product.foto_produto.toString('base64')}` : null,
          categorias: product.categorias ? product.categorias.split(',') : []
      }));

      res.status(200).json(products);
  } catch (error) {
      console.error("Erro ao listar produtos por múltiplas categorias:", error);
      res.status(500).json({ message: "Erro ao listar produtos por múltiplas categorias" });
  }
};


// backend/controllers/product.js
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    console.log('ID recebido:', id); // Log para verificar o ID recebido

    try {
        const [rows] = await db.promise().query(
            'SELECT id_produto, desc_produto, val_venda, foto_produto, nome_produto FROM tb_produto WHERE id_produto = ?',
            [id]
        );

        console.log('Resultado da consulta:', rows); // Log para verificar o resultado da consulta

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        const product = rows[0];
        product.foto_produto = product.foto_produto ? `data:image/jpeg;base64,${product.foto_produto.toString('base64')}` : null;

        res.status(200).json(product);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ message: 'Erro ao buscar produto' });
    }
};


/*
import { Component, NgModule, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crud-produto',
  standalone: true,
  imports: [NgFor, CommonModule, FormsModule],
  templateUrl: './crud-produto.component.html',
  styleUrl: './crud-produto.component.scss'
})
export class CrudProdutoComponent implements OnInit {
  products: any[] = [];
  newProduct = {
    nome_produto: '', 
    desc_produto: '', 
    val_venda: '', 
    foto_produto: ''
  };
  editingProduct: any = null;
  selectedFile: File | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      console.log(products); // Adicione esta linha para depuração
      this.products = products;
    });
  }

  get currentProduct() {
    return this.editingProduct || this.newProduct;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.currentProduct.foto_produto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('nome_produto', this.currentProduct.nome_produto);
    formData.append('desc_produto', this.currentProduct.desc_produto);
    formData.append('val_venda', this.currentProduct.val_venda);
    if (this.selectedFile) {
        formData.append('foto_produto', this.selectedFile, this.selectedFile.name);
    }

    if (this.editingProduct) {
        this.productService.updateProduct(this.editingProduct.id_produto, formData).subscribe(() => {
            this.loadProducts();
            this.editingProduct = null;
        });
    } else {
        this.productService.createProduct(formData).subscribe(() => {
            this.loadProducts();
            this.newProduct = {
                nome_produto: '', 
                desc_produto: '', 
                val_venda: '', 
                foto_produto: ''
            };
            this.selectedFile = null;
        });
    }
}

  editProduct(product: any): void {
    this.editingProduct = { ...product };
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  deleteProduct(id: string): void {
    this.productService.deleteProduct(id).subscribe(() => {
      this.loadProducts();
    });
  }
}
*/
