// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

// Inicializar variables
var app = express();

// Models
var Usuario = require('../models/usuario');
var Operador = require('../models/operador');
var Maniobra = require('../models/maniobra');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['usuarios', 'operadores', 'fotos_lavado', 'fotos_reparacion'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'PDF'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    // 12312312312-123.png
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });


    });



});



function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }


            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });


        });

    }

    if (tipo === 'operadores') {

        Operador.findById(id, (err, operador) => {

            if (!operador) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Operador no existe',
                    errors: { message: 'Operador no existe' }
                });
            }

            var pathViejo = './uploads/operadores/' + operador.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            operador.img = nombreArchivo;

            operador.save((err, operadorActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de operador actualizada',
                    operador: operadorActualizado
                });

            });

        });
    }

    if (tipo === 'fotos_lavado') {
        var img = { "img": nombreArchivo };
        Maniobra.findByIdAndUpdate(id, { $push: { imgl: img } }, (err, maniobra) => {
            {

                if (!maniobra) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Maniobra no existe',
                        errors: { message: 'Maniobra no existe' }
                    });
                }

                res.status(201).json({
                    ok: true,
                    maniobra: maniobra
                });
            }

        });

    }

    if (tipo === 'fotos_reparacion') {
        var img = { "img": nombreArchivo };
        Maniobra.findByIdAndUpdate(id, { $push: { imgr: img } }, (err, maniobra) => {
            {

                if (!maniobra) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Maniobra no existe',
                        errors: { message: 'Maniobra no existe' }
                    });
                }

                res.status(201).json({
                    ok: true,
                    maniobra: maniobra
                });
            }

        });

    }


}



module.exports = app;