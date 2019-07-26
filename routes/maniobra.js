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


// ============================================
// Obtener Maniobras por contenedor buque viaje
// ============================================
app.get('/buscaxcontenedorviaje', (req, res, netx) => {
    var contenedor = req.query.contenedor.trim();
    var viaje = req.query.viaje.trim();
    var buque = req.query.buque.trim();
    Maniobra.aggregate([{
                $lookup: {
                    from: "viajes",
                    localField: "viaje",
                    foreignField: "_id",
                    as: "match"
                }
            },
            {
                $match: { "contenedor": contenedor, "match.viaje": viaje, "match.buque": new mongoose.Types.ObjectId(buque) }
            },
            {
                $project: {
                    _id: 1,
                    contenedor: 1
                }
            }
        ])
        .exec(
            (err, maniobra) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando maniobras',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    maniobra: maniobra
                });

            });
});



// =======================================
// Obtener Maniobras
// =======================================
app.get('/', (req, res, netx) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Maniobra.find({})
        .skip(desde)
        .limit(5)
        .populate('operador', 'operador')
        .populate({
            path: "camiones",
            select: 'placa numbereconomico',
            populate: {
                path: "transportista",
                select: 'nombre'
            }
        })
        .populate('contenedor', 'contenedor tipo')
        .populate('cliente', 'cliente')
        .populate('agencia', 'nombre')
        .populate('transportista', 'nombre')
        .populate('viaje', 'viaje')
        .populate('usuario', 'nombre email')
        .exec(
            (err, maniobras) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando maniobras',
                        errors: err
                    });
                }
                Maniobra.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        maniobras,
                        total: conteo
                    });

                });

            });
});

app.get('/transito', (req, res, netx) => {
    var desde = req.query.desde || 0;
    var contenedor = new RegExp(req.query.contenedor, 'i');
    desde = Number(desde);
    //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
    Maniobra.find({ "estatus": "APROBADO" })
        .skip(desde)
        .limit(100)
        .populate('cliente', 'rfc razonSocial')
        .populate('agencia', 'rfc razonSocial')
        .populate('transportista', 'rfc razonSocial')
        .populate({
            path: "viaje",
            select: 'viaje fechaArribo',
            populate: {
                path: "buque",
                select: 'nombre'
            }
        })
        .populate('usuarioAlta', 'nombre email')
        .exec((err, maniobras) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando maniobras',
                    errors: err
                });
            }
            Maniobra.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    maniobras: maniobras,
                    total: conteo
                });
            });
        });
});





// =======================================
// Obtener Maniobra de hoy
// =======================================
app.get('/hoy', (req, res, netx) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var fechaInicio = string;
    var myDate = new Date(fechaInicio).now();
    var y = myDate.getFullYear();
    var m = myDate.getMonth();
    m += 1;
    var d = myDate.getUTCDate();
    var newdate = (y + "-" + m + "-" + d);
    //fechaaInicio = new Date(fechaInicio).toISOString();
    // var inicioDate = fechaInicio + "T00:00:00.000Z";
    // fechaaFin = new Date(fechaFin).toISOString();
    var inicioDate = newdate + "T00:00:00.000Z";
    // fechaaFin = new Date(inicioDate);
    //    .find({"fecha" : {"$gt" : ISODate("2014-10-18T00:00:00")}})
    Maniobra.find({ "fechaCreado": { "$gt": inicioDate } })
        .populate('operador', 'operador')
        .populate({
            path: "camiones",
            select: 'placa numbereconomico',
            populate: {
                path: "transportista",
                select: 'nombre'
            }
        })
        .populate('contenedor', 'contenedor tipo')
        .populate('cliente', 'cliente')
        .populate('agencia', 'nombre')
        .populate('transportista', 'nombre')
        .populate('viaje', 'viaje')
        .populate('usuario', 'nombre email')
        .exec(
            (err, maniobras) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando maniobras',
                        errors: err
                    });
                }
                Maniobra.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        maniobras,
                        total: conteo
                    });

                });

            });
});


// =======================================
// Obtener Maniobra por rango de fechas
// =======================================
app.get('/rangofecha', (req, res, netx) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var fechaInicio = req.query.fechaInicio;
    var fechaFin = req.query.fechaFin;
    fechaaInicio = new Date(fechaInicio).toISOString();
    // var inicioDate = fechaInicio + "T00:00:00.000Z";
    // fechaaFin = new Date(fechaFin).toISOString();
    var finDate = fechaFin + "T23:59:59.999Z";
    fechaaFin = new Date(finDate);

    Maniobra.find({ "fechaCreado": { "$gte": fechaaInicio, "$lte": fechaaFin } })
        .populate('operador', 'operador')
        .populate({
            path: "camiones",
            select: 'placa numbereconomico',
            populate: {
                path: "transportista",
                select: 'nombre'
            }
        })
        .populate('contenedor', 'contenedor tipo')
        .populate('cliente', 'cliente')
        .populate('agencia', 'nombre')
        .populate('transportista', 'nombre')
        .populate('viaje', 'viaje')
        .populate('usuario', 'nombre email')
        .exec(
            (err, maniobras) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando maniobras',
                        errors: err
                    });
                }
                Maniobra.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        maniobras,
                        total: conteo
                    });

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