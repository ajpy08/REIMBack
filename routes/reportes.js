var express = require('express')
var app = express();
var moment = require('moment');
var mongoose = require('mongoose');
var Maniobra = require('../models/maniobra');


app.get('/lavado/', (req, res, next) => {
    var tipos = req.query.tipo
    var finillegada = req.query.finillegada || '';
    var ffinllegada = req.query.ffinllegada || '';
    fIni = moment(finillegada, 'DD-MM-YYYY', true).utc().startOf('day').format();
    fFin = moment(ffinllegada, 'DD-MM-YYYY', true).utc().endOf('day').format();

    var filtro = '{';

    if (tipos != undefined && tipos != '') {
        filtro += '\"tipo\":{\"$regex\":' + '\"' + tipos + '\",\"$options\":\"i\"},';
    }


    if (finillegada != '' && ffinllegada) {
        fIni = moment(finillegada, 'DD-MM-YYYY', true).utc().startOf('day').format();
        fFin = moment(ffinllegada, 'DD-MM-YYYY', true).utc().endOf('day').format();
        filtro += '\"fIniLavado\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
    }

    filtro += '\"hIniLavado\"' + ':{\"$exists\"' + ': true} ';

    if (filtro != '{')
        filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse((filtro));


    Maniobra.find(json)
        .sort({ fIniLavado: -1 })
        .exec((err, maniobras) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Fallo al hacer la consulta',
                    errors: err
                });
            }
            return res.status(200).json({
                ok: true,
                consulta: maniobras,
                total: maniobras.length
            });
        });
});

app.get('/reparacion/', (req, res, next) => {
    var tipos = req.query.tipo
    var finillegada = req.query.finillegada || '';
    var ffinllegada = req.query.ffinllegada || '';
    fIni = moment(finillegada, 'DD-MM-YYYY', true).utc().startOf('day').format();
    fFin = moment(ffinllegada, 'DD-MM-YYYY', true).utc().endOf('day').format();

    var filtro = '{';

    if (tipos != undefined && tipos != '') {
        filtro += '\"tipo\":{\"$regex\":' + '\"' + tipos + '\",\"$options\":\"i\"},';
    }


    if (finillegada != '' && ffinllegada) {
        fIni = moment(finillegada, 'DD-MM-YYYY', true).utc().startOf('day').format();
        fFin = moment(ffinllegada, 'DD-MM-YYYY', true).utc().endOf('day').format();
        filtro += '\"fIniReparacion\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
    }

    filtro += '\"hIniReparacion\"' + ':{\"$exists\"' + ': true} ';

    if (filtro != '{')
        filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse((filtro));


    Maniobra.find(json)
        .populate({
            path: "viaje",
            select: 'viaje',

            populate: {
                path: "buque",
                select: 'nombre'
            }
        })
        .sort({ fIniReparacion: -1 })
        .exec((err, maniobras) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Fallo al hacer la consulta',
                    errors: err
                });
            }
            return res.status(200).json({
                ok: true,
                consulta: maniobras,
                total: maniobras.length
            });
        });
});

app.get('/', (req, res, next) => {
    var filtro = '{'
    filtro += '\"lavado\":' + '{\"$in\": [\"E\", \"B\"]},';
    filtro += '\"fIniLavado\":' + '{\"$exists\"' + ':false},' + '\"hIniLavado\":' +
        '{\"$exists\":' + 'false}}';

    var json = JSON.parse(filtro);


    Maniobra.find(json).sort({ fAlta: -1 }).exec((err, maniobras) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al realizar la Busqueda de Pendientes por Lavar',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            consulta: maniobras,
            total: maniobras.length
        });
    });
});

app.get('/reparacionesPen/', (req, res, next) => {
    var filtro = '{'
    filtro += '\"reparaciones.0.reparacion\":' + '{\"$exists\"' + ':true},' + '\"fIniReparacion\":' +
        '{\"$exists\":' + 'false}}';
    var json = JSON.parse(filtro);

    Maniobra.find(json)
        .populate({
            path: "viaje",
            select: 'viaje',

            populate: {
                path: "buque",
                select: 'nombre'
            }
        }).sort({ fAlta: -1 }).exec((err, maniobras) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al Realizar la consulta de Pendientes por Reparar',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                consulta: maniobras,
                total: maniobras.length
            });
        });
});


module.exports = app;