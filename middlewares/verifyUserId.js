const jwt = require('jsonwebtoken');

const verifyId = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error("Erro na verificação do token:", err);
                return res.sendStatus(401); // Forbidden
            }

            console.log("Token verificado com sucesso:", user);
            req.userId = user.userId;


            console.log("userId do token: ", user.userId);

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

module.exports = verifyId;