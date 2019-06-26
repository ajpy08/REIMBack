var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Camion = require('../models/camion');

// ==========================================
// Obtener todos los camiones
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Camion.find({})
        .skip(desde)
        .limit(5)
        .populate('usuarioAlta', 'nombre email')
        .populate('transportista', 'rfc razonSocial')
        .exec(
            (err, camion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar camion',
                        errors: err
                    });
                }
                Camion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        camiones: camion,
                        total: conteo
                    });
                });

            });
});

// ==========================================
//  Obtener Camiones por ID
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Camion.findById(id)
        .populate('usuarioAlta', 'nombre email')
        .exec((err, camion) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar el camion',
                    errors: err
                });
            }

            if (!camion) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'el camion con el id ' + id + 'no existe',
                    errors: { message: 'No existe un camion con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                camion: camion
            });
        });
});


// ==========================================
// Crear nuevo Camión
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var camion = new Camion({
        transportista: body.transportista,
        placa: body.placa,
        noEconomico: body.noEconomico,
        vigenciaSeguro: body.vigenciaSeguro,
        pdfSeguro: body.pdfSeguro,
        usuarioAlta: req.usuario._id
    });

    camion.save((err, camionGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear camion',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            camion: camionGuardado
        });


    });

});



// ==========================================
// Actualizar Camión
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Camion.findById(id, (err, camion) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar camion',
                errors: err
            });
        }

        if (!camion) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Las camion con el id ' + id + ' no existe',
                errors: { message: 'No existe camion con ese ID' }
            });
        }

        camion.transportista = body.transportista,
        camion.placa = body.placa;
        camion.noEconomico = body.noEconomico;
        camion.vigenciaSeguro = body.vigenciaSeguro;
        camion.pdfSeguro = body.pdfSeguro;
        camion.usuarioMod = req.usuario._id;
        camion.fMod = new Date();

        camion.save((err, camionGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar camion',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                camion: camionGuardado
            });

        });

    });

});





// ============================================
//   Borrar camion por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Camion.findByIdAndRemove(id, (err, camionBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar camion',
                errors: err
            });
        }

        if (!camionBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe camion con ese id',
                errors: { message: 'No existe camion con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            camion: camionBorrado
        });

    });

});


module.exports = app;