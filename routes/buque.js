var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Buque = require('../models/buque');

// ==========================================
// Obtener todos los buques
// ==========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Buque.find({})
        .skip(desde)
        .limit(10)
        .populate('naviera', 'razonSocial')
        .populate('usuarioAlta', 'nombre email')
        .exec(
            (err, buques) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar clientes',
                        errors: err
                    });
                }
                Buque.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        buques: buques,
                        total: conteo
                    });
                });
            });
});

// ==========================================
// Obtener todos los buques por naviera
// ==========================================
app.get('/naviera/:id', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;
    Buque.find({ naviera: id })
        .skip(desde)
        .limit(5)
        .populate('naviera', 'naviera')
        .populate('usuario', 'nombre email')
        .exec(
            (err, buques) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar clientes',
                        errors: err
                    });
                }
                Buque.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        buques,
                        total: conteo
                    });
                });
            });
});

// ==========================================
//  Obtener Buques por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Buque.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, buque) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar el buque',
                    errors: err
                });
            }
            if (!buque) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El buque con el id ' + id + 'no existe',
                    errors: { message: 'No existe un buque con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                buque: buque
            });
        });
});

// ==========================================
// Crear nuevo buque
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var buque = new Buque({
        nombre: body.nombre,
        naviera: body.naviera,
        usuarioAlta: req.usuario._id
    });
    buque.save((err, buqueGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear buque',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            buque: buqueGuardado
        });
    });
});

// ==========================================
// Actualizar Buque
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Buque.findById(id, (err, buque) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar buque',
                errors: err
            });
        }
        if (!buque) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El buque con el id ' + id + ' no existe',
                errors: { message: 'No existe buque con ese ID' }
            });
        }

        buque.nombre = body.nombre;
        buque.naviera = body.naviera;
        buque.usuarioMod = req.usuario._id;
        buque.fMod = new Date();
        buque.save((err, buqueGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar buque',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                buque: buqueGuardado
            });
        });
    });
});

// ============================================
//   Borrar buques por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Buque.findByIdAndRemove(id, (err, buqueBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar buque',
                errors: err
            });
        }
        if (!buqueBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe buque con ese id',
                errors: { message: 'No existe buque con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            buque: buqueBorrado
        });
    });
});

module.exports = app;