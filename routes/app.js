// Requires
var express = require('express');

// Inicializar variables
var app = express();

// Rutas
app.get('/', (req, res, netx) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// export
module.exports = app;