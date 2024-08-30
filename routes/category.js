// routes/product.js
const express = require('express');
const categoryController = require('../controllers/categoria');
const authorize = require('../middlewares/verifyUserType');
const authJWT = require('../middlewares/authjwt');
const upload = require('../middlewares/multer');

const router = express.Router();

// Rotas para funcionários (admin)
router.post('/create', upload.none(), categoryController.createCategory); 
router.put('/update/:id', upload.none(), categoryController.updateCategory);
router.delete('/delete/:id', categoryController.deleteCategory);

// Rotas acessíveis para todos os usuários
router.get('/list', categoryController.listCategories);


/*
IMPORTANTE!!!

Devido a eu ter me baseado no CRUD de produtos no front, utilizando o FormData para enviar dados que incluem imagem 
o corpo da requisição não é convertido para JSON, mas enviado como " multipart/form-data".
resultando que o express não entenda (ele só entende JSON...)
por isso a utilizando do middleware 'multer', que converte o corpo da requisão com imagem para enviar em JSON
e a fim de seguir o DRY (na medida do possível) reaproveitei o código do produto e em vez de colocar "[upload.single('foto_produto')]"
coloquei como "upload.none()", assim permiti que o corpo da requisão seja processado corretamente 
sem criar uma maneira que leia o JSON diretamente...
*/

// É 1 hora e meia da manhã... então pedi para o chat deixar meu texto coerente:

/*
IMPORTANTE!!!

No front-end, ao usar FormData para enviar dados (por exemplo, produtos que incluem imagens),
o corpo da requisição é enviado como multipart/form-data, não como JSON.
O Express, por padrão, não entende multipart/form-data como JSON.
Portanto, para garantir que os dados textuais sejam processados corretamente,
usamos o middleware `upload.none()` do Multer. Isso permite que os dados textuais
enviados com FormData sejam acessíveis no `req.body`, evitando problemas na manipulação dos dados.
*/


module.exports = router;