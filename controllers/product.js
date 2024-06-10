const Produto = require('../models/produto');
const db = require('../util/database');

// Cria um novo produto
exports.createProduct = async (req, res) => {
    console.log('Request Body:', req.body); // Log do corpo da requisição
    console.log('Request File:', req.file); // Log do arquivo da requisição

    const { nome_produto, desc_produto, val_venda } = req.body;
    const foto_produto = req.file ? req.file.buffer : null;

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
    console.log('Request Body:', req.body); // Log do corpo da requisição
    console.log('Request File:', req.file); // Log do arquivo da requisição

    const { id } = req.params;
    const { nome_produto, desc_produto, val_venda } = req.body;
    const foto_produto = req.file ? req.file.buffer : null;

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
