const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error("Erro na verificação do token:", err);
                return res.sendStatus(403); // Forbidden
            }

            console.log("Token verificado com sucesso:", user);
            req.user = user;

            // Decodificação para depuração
            const decodedToken = jwt.decode(token);
            console.log("Token decodificado:", decodedToken);

            next();
        });
    } else {
        console.warn("Cabeçalho de autorização ausente");
        res.sendStatus(401); // Unauthorized
    }
};

module.exports = authenticateJWT;

/*

const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'senhadaufrogparaseguranca', (err, user) => { // Certifique-se de usar uma chave secreta segura
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = authenticateJWT; */