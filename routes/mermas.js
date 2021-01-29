var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Merma = require('../models/merma');
var app = express();

// ==========================================
//  Obtener todas las Mermas
// ==========================================

app.get('/', mdAutenticacion.verificaToken, (req, res) => {
    // var noFactura = req.query.noFactura || '';
    // var proveedor = req.query.proveedor || '';
    // var material = req.query.material || '';
    var filtro = '{';
    // if (noFactura != 'undefined' && noFactura != '')
    //     filtro += '\"noFactura\":' + '\"' + noFactura + '\",';
    // if (proveedor != 'undefined' && proveedor != '')
    //     filtro += '\"proveedor\":' + '\"' + proveedor + '\",';
    // if (material != 'undefined' && material != '')
    //     filtro += '\"materiales.material\":' + '\"' + material + '\",';
    // if (filtro != '{')
    //     filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse(filtro);
    Merma.find(json)
        .populate('usuarioAprobacion', 'nombre email')
        .populate('usuarioAlta', 'nombre email')
        .populate('usuarioMod', 'nombre email')
        .populate('materiales.material', 'descripcion')
        .sort({ fAlta: -1 })
        .exec(
            (err, mermas) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando mermas',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    mermas: mermas,
                    totalRegistros: mermas.length
                });
            });
});

// ==========================================
//  Obtener Merma por ID
// ==========================================
app.get('/merma/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Merma.findById(id)
        .populate('materiales.material', 'descripcion')
        .exec((err, merma) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar merma',
                    errors: err
                });
            }
            if (!merma) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El merma con el id ' + id + ' no existe',
                    errors: { message: 'No existe una merma con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                merma: merma
            });
        });
});

// ==========================================
// Crear una nueva merma
// ==========================================
app.post('/merma/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var merma = new Merma({
        motivo: body.motivo,
        materiales: body.materiales,
        usuarioAlta: req.usuario._id
    });

    merma.save((err, mermaGuardada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear merma',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Merma creada con éxito.',
            merma: mermaGuardada
        });
    });
});

// ==========================================
// Actualizar merma
// ==========================================

app.put('/merma/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Merma.findById(id, (err, merma) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar merma',
                errors: err
            });
        }
        if (!merma) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La merma con el id ' + id + ' no existe',
                errors: { message: 'No existe una merma con ese ID' }
            });
        }
        merma.motivo = body.motivo;
        merma.materiales = body.materiales;
        merma.usuarioMod = req.usuario._id;
        merma.fMod = new Date();
        merma.save((err, mermaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar merma',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                merma: mermaGuardada
            });
        });
    });
});

// ============================================
//  Borrar un Merma por el id
// ============================================
app.delete('/merma/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Merma.findById(id, (err, mermaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar merma',
                errors: err
            });
        }
        if (!mermaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe una merma con ese id',
                errors: { message: 'No existe una merma con ese id' }
            });
        }
        mermaBorrada.remove();
        res.status(200).json({
            ok: true,
            merma: mermaBorrada
        });
    });
});
module.exports = app;