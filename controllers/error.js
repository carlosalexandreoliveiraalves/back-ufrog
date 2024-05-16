exports.get404 = (req, res, next) => {
    const error = new Error('Não encontrado...');
    error.statusCode = 404;
    next(error);
}

exports.get500 = (error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;

    res.status(status).json({
        error: {
            message: message,
            data: data || null
        }
    });
};