var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();


var Solicitud = require('../models/solicitud');
var Maniobra = require('../models/maniobra');

// =======================================
// Obtener solicitudes TODAS
// =======================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Solicitud.find({})
        .skip(desde)
        .populate('agencia', 'razonSocial')
        .populate('naviera', 'razonSocial')
        .populate('transportista', 'razonSocial')
        .populate('cliente', 'razonSocial')
        .populate('buque', 'buque')
        .populate('usuarioAlta', 'nombre email')
        .limit(10)
        .exec(
            (err, solicitudes) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando solicitudes',
                        errors: err
                    });
                }
                Solicitud.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        solicitudes: solicitudes,
                        total: conteo
                    });

                });

            });
});

// ==========================================
//  Obtener solicitudes por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Solicitud.findById(id)
        .exec((err, solicitud) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar solicitud',
                    errors: err
                });
            }
            if (!solicitud) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La solicitud con el id ' + id + 'no existe',
                    errors: { message: 'No existe una solicitud con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                solicitud: solicitud
            });
        });
});

app.get('/:id/includes', (req, res) => {
    var id = req.params.id;
    Solicitud.findById(id)
    .populate('agencia', 'razonSocial')
    .populate('naviera', 'razonSocial')
    .populate('transportista', 'razonSocial')
    .populate('cliente', 'razonSocial')
    .populate('buque', 'nombre _id')
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioAprobo', 'nombre email')
    .exec((err, solicitud) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar solicitud',
                errors: err
            });
        }
        if (!solicitud) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La solicitud con el id ' + id + 'no existe',
                errors: { message: 'No existe una solicitud con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            solicitud: solicitud
        });
    });
});
// =======================================
// Crear Solicitudes
// =======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var solicitud = new Solicitud({
        agencia: body.agencia,
        naviera: body.naviera,
        transportista: body.transportista,
        cliente: body.cliente,
        facturarA: body.facturarA,
        buque: body.buque,
        viaje: body.viaje,
        observaciones: body.observaciones,
        rutaBL: body.rutaBL,
        credito: body.credito,
        rutaComprobante: body.rutaComprobante,
        correo: body.correo,
        correoFac: body.correoFac,
        contenedores: body.contenedores,
        tipo: 'D',
        estatus: body.estatus,
        usuarioAlta: req.usuario._id
    });

    if (solicitud.rutaBL != '' && fs.existsSync('./uploads/temp/' + solicitud.rutaBL)) {
        fs.rename('./uploads/temp/' + solicitud.rutaBL, './uploads/solicitudes/' + solicitud.rutaBL, (err) => {
            if (err) { console.log(err); }
        });
    }
    if (solicitud.rutaComprobante != '' && fs.existsSync('./uploads/temp/' + solicitud.rutaComprobante)) {
        fs.rename('./uploads/temp/' + solicitud.rutaComprobante, './uploads/solicitudes/' + solicitud.rutaComprobante, (err) => {
            if (err) { console.log(err); }
        });
    }
    solicitud.save((err, solicitudGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear solicitud',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            solicitud: solicitudGuardado
        });

    });
});


// ==========================================
// Actualizar Solicitud
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Solicitud.findById(id, (err, solicitud) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar viaje',
                errors: err
            });
        }
        if (!solicitud) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La solicitud con el id ' + id + ' no existe',
                errors: { message: 'No existe solicitud con ese ID' }
            });
        }
        solicitud.agencia = body.agencia;
        solicitud.naviera = body.naviera;
        solicitud.transportista = body.transportista;
        solicitud.cliente = body.cliente;
        solicitud.facturarA = body.facturarA;
        solicitud.buque = body.buque;
        solicitud.viaje = body.viaje;
        solicitud.observaciones = body.observaciones;
        solicitud.credito = body.credito;
        solicitud.correo = body.correo;
        solicitud.correoFac = body.correoFac;
        solicitud.contenedores = body.contenedores;
        solicitud.fMod = Date.now();
        solicitud.usuarioMod = req.usuario._id;
        
        
        if (solicitud.rutaBL != body.rutaBL) {
            if (fs.existsSync('./uploads/temp/' + body.rutaBL)) {
                if (solicitud.rutaBL != undefined || solicitud.rutaBL != '' && solicitud.rutaBL != null && fs.existsSync('./uploads/solicitudes/' + solicitud.rutaBL)) {
                    fs.unlink('./uploads/solicitudes/' + solicitud.rutaBL, (err) => {
                        if (err) console.log(err);
                        else
                            console.log('Imagen anterior fue borrada con éxito');
                    });
                }
                fs.rename('./uploads/temp/' + body.rutaBL, './uploads/solicitudes/' + body.rutaBL, (err) => {
                    if (err) { console.log(err); }
                });
                solicitud.rutaBL = body.rutaBL;
            }
        }
        
        if (solicitud.rutaComprobante != body.rutaBL) {
            if (fs.existsSync('./uploads/temp/' + body.rutaComprobante)) {
                if (solicitud.rutaComprobante != undefined || solicitud.rutaComprobante != '' && solicitud.rutaComprobante != null && fs.existsSync('./uploads/solicitudes/' + solicitud.rutaComprobante)) {
                    fs.unlink('./uploads/solicitudes/' + solicitud.rutaComprobante, (err) => {
                        if (err) console.log(err);
                        else
                            console.log('Imagen anterior fue borrada con éxito');
                    });
                }
                fs.rename('./uploads/temp/' + body.rutaComprobante, './uploads/solicitudes/' + body.rutaComprobante, (err) => {
                    if (err) { console.log(err); }
                });
                solicitud.rutaComprobante = body.rutaComprobante;
            }
        }
        solicitud.save((err, solicitudGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar viaje',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                solicitud: solicitudGuardado
            });

        });
    });
});



// =======================================
// Obtener solicitudes NO ASIGNADAS
// =======================================
app.get('/NA', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var estatus = 'NA';

    SolicitudD.find({ 'estatus': estatus })
        .skip(desde)
        .populate('agencia', 'razonSocial')
        .populate('naviera', 'razonSocial')
        .populate('transportista', 'razonSocial')
        .populate('cliente', 'razonSocial')
        .populate('buque', 'buque')
        .populate('usuario', 'nombre email')
        .limit(5)
        .exec(
            (err, solicitudesD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando solicitudes',
                        errors: err
                    });
                }
                SolicitudD.countDocuments({ 'estatus': estatus }, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        solicitudesD,
                        total: conteo
                    });

                });

            });
});


// =======================================
// Obtener solicitudes id de agencia
// =======================================
app.get('/agencia/:agencias', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var agencias = req.params.agencias;
    var a = ['5bfecd483965fc0b7058ceae', '5c1ad1bf5657c12c4c4bfc6b'];

    SolicitudD.find({ agencia: { "$in": a } })
        .skip(desde)
        .populate('agencia', 'razonSocial')
        .populate('naviera', 'razonSocial')
        .populate('transportista', 'razonSocial')
        .populate('cliente', 'razonSocial')
        .populate('buque', 'buque')
        .populate('usuario', 'nombre email')
        .limit(5)
        .exec(
            (err, solicitudesD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando solicitudes',
                        errors: err
                    });
                }
                SolicitudD.countDocuments({ agencia: { "$in": a } }, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        solicitudesD,
                        total: conteo
                    });

                });

            });
});












// ==========================================
// Actualizar Solicitud con maniobra
// ==========================================
app.put('/solicitudmaniobra/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    SolicitudD.findById(id, (err, solicitud) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar viaje',
                errors: err
            });
        }
        if (!solicitud) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La solicitud con el id ' + id + ' no existe',
                errors: { message: 'No existe solicitud con ese ID' }
            });
        }
        solicitud.contenedores = body.contenedores;
        solicitud.estatus = "AS";
        solicitud.fAprobacion = Date.now();
        solicitud.usuarioAprobo = req.usuario._id;
        solicitud.fMod = Date.now();
        solicitud.usuarioMod = req.usuario._id;
        solicitud.save((err, solicitudGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar viaje',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                solicitud: solicitudGuardado
            });
             solicitud.contenedores.forEach((element) => {
                 Maniobra.findById(element.Maniobra, (err, maniobra) => {
                     maniobra.estatus = "APROBADO";
                     maniobra.solicitudD = id;
                     maniobra.agencia = solicitud.agencia;
                     maniobra.transportista = solicitud.transportista;
                     maniobra.cliente = solicitud.cliente;
                     maniobra.save((err, maniobraGuardado) => {
                     });
                 });
             });
        });
    });
});


// =======================================
// Borrar Solicitud
// =======================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    SolicitudD.findByIdAndRemove(id, (err, solicitudBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!solicitudBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            solicitud: solicitudBorrado
        });
    });
});

// export
module.exports = app;