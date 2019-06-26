// Requires
var express = require('express');
const uuidv4 = require("uuid/v4");

var mdAutentication = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

var Prealta = require('../models/prealtamaniobra');

// =======================================
// Obtener todas las prealtas
// =======================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Prealta.find({}, 'viaje transportista facturarA contenedor tipo estado destinatario')
        .skip(desde)
        .limit(5)
        .populate('viaje', 'viaje buque fechaArrivo fechaVigenciaTemporal anio')
        .exec(
            (err, prealtas) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar datos',
                        errors: err
                    });
                }

                Prealta.countDocuments((err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        prealtas,
                        total: conteo
                    });
                });
            });
});

// ==========================================
//  Obtener prealta por id
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Prealta.findById(id)
        .exec((err, prealta) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar datos',
                    errors: err
                });
            }

            if (!prealta) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La Prealta con el id' + id + ' no existe',
                    errors: { message: 'No existe una prealta con ese ID' }

                });
            }
            res.status(200).json({
                ok: true,
                prealta: prealta
            });
        });
});

// ==========================================
// Actualizar prealtas
// ==========================================
let folio = uuidv4();
app.put('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Prealta.findById(id, (err, prealta) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar datos',
                errors: err
            });
        }
        if (!prealta) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La prealta con el id' + id + ' no existe',
                errors: { message: 'No existe prealta con ese ID' }
            });
        }
        prealta.folio = folio;
        prealta.agencia = body.agencia;
        prealta.naviera = body.naviera;
        prealta.transportista = body.transportista;
        prealta.facturarA = body.facturarA;
        prealta.credito = body.credito;
        prealta.contenedor = body.contenedor;
        prealta.tipoContenedor = body.tipoContenedor;
        prealta.estado = body.estado;
        prealta.reparacion = body.reparacion;
        prealta.lavado = body.lavado;
        prealta.servicio = body.servicio;
        prealta.observaciones = body.observaciones;
        prealta.usuario = req.usuario._id;

        prealta.save((err, prealtaGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actulizar prealta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                prealta: prealtaGuardado
            });
        });


    });
});

// ==========================================
// Actualizar estado de aprobacion prealta
// ==========================================
app.put('/aprobacion/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Prealta.findById(id, (err, prealta) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar datos',
                errors: err
            });
        }
        if (!prealta) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La prealta con el id' + id + ' no existe',
                errors: { message: 'No existe prealta con ese ID' }
            });
        }
        prealta.folioAprobacion = body.folioAprobacion;

        prealta.save((err, prealtaGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actulizar prealta',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                prealta: prealtaGuardado
            });
        });


    });
});

// ==========================================
// Crear nuevos prealtas
// ==========================================
app.post('/', mdAutentication.verificaToken, (req, res) => {
    var body = req.body;
    let folio = uuidv4();

    var prealta = new Prealta({
        viaje: body.viaje,
        transportista: body.transportista,
        facturarA: body.facturarA,
        correoFac: body.correoFac,
        contenedor: body.contenedor,
        tipo: body.tipo,
        estado: body.estado,
        destinatario: body.destinatario,
        usuario: req.usuario._id
    });

    prealta.save((err, prealtaGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear prealta',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            prealta: prealtaGuardado
        });
    });
});

// ============================================
// Borrar prealta por el id
// ============================================
app.delete('/id:', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Prealta.findByIdAndRemove(id, (err, prealtaBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar la prealta',
                errors: err
            });
        }

        if (!prealta) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe prealta con ese id',
                errors: { message: 'No existe prealta con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            prealta: prealtaBorrado
        });
    });
});

module.exports = app;