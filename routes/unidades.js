var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Unidad = require('../models/unidad');
var app = express();

// ==========================================
//  Obtener todos los Materiales
// ==========================================

app.get('/', mdAutenticacion.verificaToken, (req, res) => {
    Unidad.find({})
        // .populate('usuarioAlta', 'nombre email')
        // .populate('usuarioMod', 'nombre email')
        .sort({ descripcion: -1 })
        .exec(
            (err, unidades) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando unidades',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    unidades: unidades,
                    totalRegistros: unidades.length
                });
            });
});

module.exports = app;