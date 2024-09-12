const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const produtoRoutes = require('./routes/product');
const categoriasRoutes = require('./routes/category');
const imagensRoutes = require('./routes/imagens');
const errorController = require('./controllers/error');
const authJWT = require('./middlewares/authjwt');

const app = express();
const ports = process.env.PORT || 3000;

// Configurar CORS para permitir requisições do frontend
//origin: 'https://ufrog.com.py',
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware CORS adicional para garantir que todas as solicitações OPTIONS sejam tratadas corretamente
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite todas as origens
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Adicionando um middleware para lidar com solicitações OPTIONS
app.options('*', cors());

// Servir arquivos estáticos do diretório 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para bodyParser
app.use(bodyParser.json());

// Rotas de autenticação
app.use('/auth', authRoutes); 

// Rotas de produto
app.use('/produto', produtoRoutes);

app.use('/categoria', categoriasRoutes);

app.use('/imagem', imagensRoutes);

// Exemplo de rota protegida
app.get('/protected', authJWT, (req, res) => {
    res.json({ message: 'Você acessou uma rota protegida!', user: req.user });
});

// Controladores de erro
app.use(errorController.get404);
app.use(errorController.get500);

// Iniciar o servidor na porta especificada
app.listen(ports, function check(error) {
    if (error) {
        console.log("Não está escutando server na porta 3000");
    } else {
        console.log(`Servidor escutado na porta ${ports}`);
    } 
});

//Estabelecendo a conexão com o banco de dados
/*
var db = mysql.createConnection({
    host : 'localhost',
    database : 'db_ufrog',
    user : 'root',
    password : 'root',
  });
*/
  
//Solução de um erro foi o comando: 
//ALTER USER 'nome_usuario'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nova_senha';






 




