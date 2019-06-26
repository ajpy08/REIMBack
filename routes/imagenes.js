// Requires
var express = require('express');

// Inicializar variables
var app = express();

var path = require('path');
var fs = require('fs');

// Rutas
app.get('/:tipo/:img', (req, res, netx) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImagen);
    }
});

// export
module.exports = app;