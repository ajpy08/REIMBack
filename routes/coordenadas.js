var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Coordenada = require('../models/coordenada');

// ==========================================
// Obtener todas las coordenadas
// ==========================================
app.get('/', (req, res, next) => {
    var bahia = req.query.bahia || '';
    var tipo = req.query.tipo || '';
    var activo = req.query.activo || true;
    var conManiobra = req.query.conManiobra || false;

    var filtro = '{';
    if (bahia != 'undefined' && bahia != '')
        filtro += '\"bahia\":' + '\"' + bahia + '\",';
    if (tipo != 'undefined' && tipo != '')
        filtro += '\"tipo\":' + '\"' + tipo + '\",';
    if (activo != 'undefined' && activo != '')
        filtro += '\"activo\":' + activo + ',';
    if (conManiobra != 'undefined' && conManiobra != '')
        filtro += '\"maniobra\"' + ': {\"$exists\"' + ': true},';

    if (filtro != '{')
        filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse(filtro);

    Coordenada.find(json)
        .populate('maniobra', '_id contenedor tipo grado')
        // .populate('usuarioAlta', 'nombre email')
        .sort({ bahia: 1 })
        .exec((err, coordenadas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar coordenadas',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                coordenadas: coordenadas,
                total: coordenadas.length
            });
        });
});

module.exports = app;