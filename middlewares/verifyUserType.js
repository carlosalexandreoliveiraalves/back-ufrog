const authTipoUsuario = (req, res, next) => {
    if (!req.user) {
        console.log("Usuário não encontrado no request");
        return res.status(403).json({ message: "Não autorizado" }); // Forbidden
    }

    console.log("Tipo de usuário no token:", req.user.fk_tipo_usuario);
    const tipo = req.user.fk_tipo_usuario;
    const tipoUsuarios = [1]; // Defina os tipos de usuário permitidos aqui

    if (!tipoUsuarios.includes(tipo)) {
        console.log("Tipo de usuário não autorizado:", tipo);
        return res.status(403).json({ message: "Não autorizado" }); // Forbidden
    }

    // Autenticação e autorização bem-sucedidas
    console.log("Autenticação e autorização bem-sucedidas para tipo de usuário:", tipo);
    next();
};

module.exports = authTipoUsuario;
