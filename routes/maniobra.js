// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Maniobra = require('../models/maniobra');

// ==========================================
//  Obtener Maniobra por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Maniobra.findById(id)
        .exec((err, maniobra) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar la maniobra',
                    errors: err
                });
            }
            if (!maniobra) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La maniobra con el id ' + id + 'no existe',
                    errors: { message: 'No existe maniobra con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                maniobra: maniobra
            });
        });
});


// ==========================================
//  Obtener Maniobra por ID CON INCLUDES
// ==========================================
app.get('/:id/includes', (req, res) => {
    var id = req.params.id;
    Maniobra.findById(id)
        .populate('operador', 'nombre foto')
        .populate('camion', 'placa')
        .populate('cliente', 'razonSocial')
        .populate('agencia', 'razonSocial')
        .populate('transportista', 'razonSocial')
        .populate('viaje', 'viaje')

    .exec((err, maniobra) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar la maniobra',
                errors: err
            });
        }
        if (!maniobra) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La maniobra con el id ' + id + 'no existe',
                errors: { message: 'No existe maniobra con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            maniobra: maniobra
        });
    });
});


// =======================================
// Crear Maniobra
// =======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var maniobra = new Maniobra({
        entrada: body.entrada,
        salida: body.salida,
        inicio: body.inicio,
        fin: body.fin,
        transporte: body.transporte,
        lavado: body.lavado,
        rep: body.rep,
        grado: body.grado,
        operador: body.operador,
        camiones: body.camion,
        contenedor: body.contenedor,
        cliente: body.cliente,
        agencia: body.agencia,
        viaje: body.viaje,
        usuario: req.usuario._id

    });

    maniobra.save((err, maniobraGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear maniobra',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            maniobra: maniobraGuardado
        });

    });

});
// =======================================
// Registra LLegada Contendor
// =======================================
app.put('/registra_llegada/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Maniobra.findById(id, (err, maniobra) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar maniobra',
                errors: err
            });
        }
        if (!maniobra) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La maniobra con el id ' + id + ' no existe',
                errors: { message: 'No existe una maniobra con ese ID' }
            });
        }
        maniobra.transportista = body.transportista;
        maniobra.camion = body.camion;
        maniobra.operador = body.operador;
        maniobra.fLlegada = body.fLlegada;
        maniobra.hLlegada = body.hLlegada;
        maniobra.estatus = "ESPERA";
        if (body.hEntrada) {
            maniobra.hEntrada = body.hEntrada;
            maniobra.estatus = "REVISION";
        }


        maniobra.save((err, maniobraGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la maniobra',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                maniobra: maniobraGuardado
            });
        });
    });
});

// =======================================
// Registra Lavado, reparaciones y descarga
// =======================================
app.put('/registra_descarga/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Maniobra.findById(id, (err, maniobra) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar maniobra',
                errors: err
            });
        }
        if (!maniobra) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La maniobra con el id ' + id + ' no existe',
                errors: { message: 'No existe una maniobra con ese ID' }
            });
        }
        maniobra.lavado = body.lavado;
        maniobra.lavadoObservacion = body.lavadoObservacion;
        maniobra.reparacionesObservacion = body.reparacionesObservacion;
        maniobra.reparaciones = body.reparaciones;
        maniobra.grado = body.grado;
        if (body.hSalida) {
            maniobra.hSalida = body.hSalida;
            maniobra.estatus = "LAVADO_REPARACION";
        }
        console.log(body.lavado);
        console.log(maniobra);

        maniobra.save((err, maniobraGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la maniobra',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                maniobra: maniobraGuardado
            });
        });
    });
});

// =======================================
// Actualizar Maniobra
// =======================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Maniobra.findById(id, (err, maniobra) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar maniobra',
                errors: err
            });
        }

        if (!maniobra) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La maniobra con el id ' + id + ' no existe',
                errors: { message: 'No existe una maniobra con ese ID' }
            });
        }

        maniobra.entrada = body.entrada,
            maniobra.salida = body.salida,
            maniobra.inicio = body.inicio,
            maniobra.fin = body.fin,
            maniobra.transporte = body.transporte,
            maniobra.lavado = body.lavado,
            maniobra.rep = body.rep,
            maniobra.grado = body.grado,
            maniobra.fechaModificado = Date.now(),
            maniobra.operador = body.operador,
            maniobra.placas = body.placas,
            maniobra.contenedor = body.contenedor,
            maniobra.cliente = body.cliente,
            maniobra.agencia = body.agencia,
            maniobra.viaje = body.viaje,
            maniobra.usuario = req.usuario._id;


        maniobra.save((err, maniobraGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la maniobra',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                maniobra: maniobraGuardado
            });
        });

    });

});

// =======================================
// Borrar Maniobra por id
// =======================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    Maniobra.findByIdAndRemove(id, (err, maniobraBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar maniobra',
                errors: err
            });
        }

        if (!maniobraBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe una maniobra con ese id',
                errors: { message: 'No existe una maniobra con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            maniobra: maniobraBorrado
        });
    });
});

// ==========================================
// Remover fotos lavado de la maniobra
// ==========================================
app.put('/removeimgl/:id&:img', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    var img = { "img": req.params.img };

    Maniobra.findByIdAndUpdate(id, { $pull: { imgl: img } }, (err, maniobra) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar maniobra',
                errors: err
            });
        }

        if (!maniobra) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La maniobra con el id ' + id + ' no existe',
                errors: { message: 'No existe maniobra con ese ID' }
            });
        } else {
            res.status(201).json({
                ok: true,
                maniobra: maniobra
            });
        }
    });

});


// ==========================================
// Remover fotos lavado de la maniobra
// ==========================================
app.put('/removeimgr/:id&:img', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    var img = { "img": req.params.img };

    Maniobra.findByIdAndUpdate(id, { $pull: { imgr: img } }, (err, maniobra) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar maniobra',
                errors: err
            });
        }

        if (!maniobra) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La maniobra con el id ' + id + ' no existe',
                errors: { message: 'No existe maniobra con ese ID' }
            });
        } else {
            res.status(201).json({
                ok: true,
                maniobra: maniobra
            });
        }
    });

});

// export
module.exports = app;