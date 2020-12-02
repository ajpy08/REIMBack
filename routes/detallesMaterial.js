var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var Entrada = require('../models/entrada');
var DetalleMaterial = require('../models/detalleMaterial');
var app = express();

// ==========================================
//  Obtener todos los Detalles
// ==========================================

app.get('/', mdAutenticacion.verificaToken, (req, res) => {
    var material = req.query.material || '';

    var filtro = '{';
    if (material != 'undefined' && material != '')
        filtro += '\"material\":' + '\"' + material + '\",';

    if (filtro != '{')
        filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse(filtro);
    DetalleMaterial.find(json)
        .populate('usuarioAlta', 'nombre email')
        .populate('usuarioMod', 'nombre email')
        .populate('material', 'descripcion')
        .sort({ fAlta: -1 })
        .exec(
            (err, detalles) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando detalles',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    detalles: detalles,
                    totalRegistros: detalles.length
                });
            });
});

// ==========================================
//  Obtener detalle por ID
// ==========================================
app.get('/detalle/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    DetalleMaterial.findById(id)
        .exec((err, detalle) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar detalle',
                    errors: err
                });
            }
            if (!detalle) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El detalle con el id ' + id + 'no existe',
                    errors: { message: 'No existe un detalle con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                detalle: detalle
            });
        });
});

// ==========================================
// Crear un nuevo detalle
// ==========================================
app.post('/detalle/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var detalle = new DetalleMaterial({
        material: body.material,
        cantidad: body.cantidad,
        costo: body.costo,
        entrada: body.entrada,
        usuarioAlta: req.usuario._id
    });

    detalle.save((err, detalleGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear detalle',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'detalle creado con éxito.',
            detalle: detalleGuardado
        });
    });
});

// ==========================================
// Actualizar detalle
// ==========================================

app.put('/detalle/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    DetalleMaterial.findById(id, (err, detalle) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar al detalle',
                errors: err
            });
        }
        if (!detalle) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El detalle con el id ' + id + ' no existe',
                errors: { message: 'No existe un detalle con ese ID' }
            });
        }
        detalle.material = body.material;
        detalle.cantidad = body.cantidad;
        detalle.costo = body.costo;
        detalle.usuarioMod = req.usuario._id;
        detalle.fMod = new Date();

        detalle.save((err, detalleGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar al detalle',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                detalle: detalleGuardado
            });
        });
    });
});


// ============================================
//  Borrar un detalle por el id
// ============================================
app.delete('/detalle/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    // Entrada.find({
    //     $or: [
    //         { 'entrada': id }
    //     ]
    // })
    //     .exec(
    //         (err, entrada) => {
    //             if (err) {
    //                 return res.status(500).json({
    //                     ok: false,
    //                     mensaje: 'Error al intentar validar la eliminacion del detalle',
    //                     errors: err
    //                 });
    //             }
    //             if (entrada && entrada.length > 0) {
    //                 res.status(400).json({
    //                     ok: false,
    //                     mensaje: 'El detalle ya se encuentra en alguna Entrada, por lo tanto no puede eliminarse.',
    //                     errors: { message: 'El detalle ya se encuentra en alguna Entrada, por lo tanto no puede eliminarse.' },
    //                     resultadoError: entrada
    //                 });
    //             }
    DetalleMaterial.findById(id, (err, detalleBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar detalle',
                errors: err
            });
        }
        if (!detalleBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un detalle con ese id',
                errors: { message: 'No existe un detalle con ese id' }
            });
        }

        detalleBorrado.remove();

        res.status(200).json({
            ok: true,
            detalle: detalleBorrado
        });
    });

    // });
});
module.exports = app;