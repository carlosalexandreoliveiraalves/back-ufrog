
const authTipoUsuario = (req, res, next) => {
            const tipo = req.user.fk_tipo_usuario;

            if (tipoUsuarios.length && !tipoUsuarios.includes(tipo)) {
                // user's role is not authorized
                return res.status(401).json({ message: 'Não autorizado' });
            }

            // authentication and authorization successful
            next();
        }


module.exports = authTipoUsuario;
