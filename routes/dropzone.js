// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var paths = require('path');

// Inicializar variables
var app = express();

// Models
var Maniobra = require('../models/maniobra');

// default options
app.use(fileUpload());

app.put('/:id', (req, res, next) => {

    var id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    for (var key in req.files) {

        // Obtener nombre del archivo
        var archivo = req.files[key];
        // console.log(req.files[key].name);
        var nombreCortado = req.files[key].name.split('.');
        var extensionArchivo = nombreCortado[nombreCortado.length - 1];

        // Sólo estas extensiones aceptamos
        var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

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

        // Nombre de carpeta personalizado
        // 12312312312
        var nombreCarpeta = `./uploads/maniobras/${ id }`;

        if (!fs.existsSync(nombreCarpeta)) {
            try {
                fs.mkdirSync(nombreCarpeta);
            } catch (e) {
                mkdirpath(path.dirname(nombreCarpeta));
                mkdirpath(nombreCarpeta);
            }
        }

        // Mover el archivo del temporal a un path
        var path = `./uploads/maniobras/${ id }/ ${ nombreArchivo }`;

        archivo.mv(path, err => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al mover archivo',
                    errors: err
                });
            }


            subirPorTipo(nombreCarpeta, id, nombreArchivo, res);

            // res.status(200).json({
            //     ok: true,
            //     mensaje: 'Archivo movido',
            //     extensionArchivo: extensionArchivo
            // });


        });
    }
});

function subirPorTipo(nombreCarpeta, id, nombreArchivo, res) {

    Maniobra.findById(id, (err, maniobra) => {

        if (!maniobra) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Maniobra no existe',
                errors: { message: 'Maniobra no existe' }
            });
        }

        // var pathViejo = './uploads/maniobras/' + maniobra.img;

        // Si existe, elimina la imagen anterior
        /* if (fs.existsSync(pathViejo)) {
             fs.unlinkSync(pathViejo);
         }*/

        maniobra.imgfolder = nombreCarpeta;

        maniobra.save((err, maniobraActualizado) => {

            return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de maniobra actualizada',
                maniobra: maniobraActualizado
            });

        });


    });

}

module.exports = app;