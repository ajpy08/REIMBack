var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();
var Operador = require('../models/operador');

// ==========================================
// Obtener todos los Operador
// ==========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Operador.find({})
        .skip(desde)
        .limit(5)
        .populate('usuarioAlta', 'nombre email')
        .populate('usuarioMod', 'nombre email')
        .populate('transportista', 'rfc,razonSocial')
        .exec(
            (err, operadores) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando operador',
                        errors: err
                    });
                }
                Operador.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        operadores: operadores,
                        total: conteo
                    });
                });
            });
});

// ==========================================
//  Obtener Operador por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Operador.findById(id)
        .populate('usuarioAlta', 'nombre img email')
        .exec((err, operadores) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar al operador',
                    errors: err
                });
            }
            if (!operadores) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El operador con el id ' + id + 'no existe',
                    errors: { message: 'No existe un operador con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                operadores: operadores
            });
        });
});

// ==========================================
// Crear un nuevo operador
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var operador = new Operador({
        transportista: body.transportista,
        operador: body.operador,
        img : body.img,
        licencia : body.licencia,
        vigenciaLicencia: body.vigenciaLicencia,
        usuarioAlta: req.usuario._id
    });

        // console.log(viaje);
     //if (fs.exists('./uploads/temp/' + operador.img,) {
         fs.rename('./uploads/temp/' + operador.img, './uploads/operadores/' + operador.img, (err) => {
             if (err) { console.log(err); }
         });
//     }
    



    operador.save((err, operadorGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear operador',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            operador: operadorGuardado
        });
    });
});

// ==========================================
// Actualizar Operador
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Operador.findById(id, (err, operador) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar al operador',
                errors: err
            });
        }
        if (!operador) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El operador con el id ' + id + ' no existe',
                errors: { message: 'No existe un operador con ese ID' }
            });
        }
        operador.transportista =  body.transportista;
        operador.operador = body.operador;
        operador.usuario = req.usuario._id;
        operador.img = body.img;
        operador.licencia = body.licencia;
        operador.vigenciaLicencia =  body.vigenciaLicencia;
        operador.usuarioMod = req.usuario._id;
        operador.fMod = new Date();
        operador.save((err, operadorGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar al operador',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                operador: operadorGuardado
            });
        });
    });
});


// ============================================
//  Borrar un operador por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Operador.findByIdAndRemove(id, (err, operadorBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el operador',
                errors: err
            });
        }
        if (!operadorBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un operador con ese id',
                errors: { message: 'No existe un operador con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            operador: operadorBorrado
        });
    });
});


module.exports = app;