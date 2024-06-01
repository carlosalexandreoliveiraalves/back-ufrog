const express = require('express');
const bodyParser = require('body-parser');
const ports = process.env.PORT || 3000;

const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const authJWT = require('./middlewares/authjwt')


const app = express();

app.use(bodyParser.json());

//Cabeçalho CORS

 app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
 });

 app.use('/auth', authRoutes); 

 app.get('/protected', authJWT, (req, res) => {
    res.json({ message: 'Você acessou uma rota protegida!', user: req.user });
});

 //controladores de erro
 app.use(errorController.get404);
 app.use(errorController.get500);


//Estabelecendo a porta de saída (port)

app.listen(ports, function check(error){
    if (error) {
        console.log("Não está escutando server na porta 3000");
    }
    else {
        console.log("Servidor escutado na porta 3000");
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






 




