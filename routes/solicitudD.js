var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var SolicitudD = require('../models/solicitudD');
var Maniobra = require('../models/maniobra');

// =======================================
// Obtener solicitudes
// =======================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    SolicitudD.find({})
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
                SolicitudD.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        solicitudesD,
                        total: conteo
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
//  Obtener solicitudes por ID
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    SolicitudD.findById(id)
        .populate('agencia', 'razonSocial')
        .populate('naviera', 'razonSocial')
        .populate('transportista', 'razonSocial')
        .populate('cliente', 'razonSocial')
        .populate('buque', 'buque')
        .populate('usuario', 'nombre email')
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

    var solicitud = new SolicitudD({
        agencia: body.agencia,
        naviera: body.naviera,
        transportista: body.transportista,
        cliente: body.cliente,
        facturarA: body.facturarA,
        buque: body.buque,
        viaje: body.viaje,
        observaciones: body.observaciones,
        rutaBL: body.rutaBL,
        rutaComprobante: body.rutaComprobante,
        correo: body.correo,
        correoFac: body.correoFac,
        contenedores: body.contenedores,
        tipo: body.tipo,
        estatus: body.estatus,
        usuarioAlta: req.usuario._id
    });

    if (solicitud.pdf != '' && fs.existsSync('./uploads/temp/' + camion.pdfSeguro)) {
        fs.rename('./uploads/temp/' + camion.pdfSeguro, './uploads/camiones/' + camion.pdfSeguro, (err) => {
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


        solicitud.agencia = body.agencia;
        solicitud.naviera = body.naviera;
        solicitud.transportista = body.transportista;
        solicitud.cliente = body.cliente;
        solicitud.facturarA = body.facturarA;
        solicitud.buque = body.buque;
        solicitud.viaje = body.viaje;
        solicitud.observaciones = body.observaciones;
        solicitud.rutaBL = body.rutaBL;
        solicitud.credito = body.credito;
        solicitud.rutaComprobante = body.rutaComprobante;
        solicitud.correo = body.correo;
        solicitud.correoFac = body.correoFac;
        solicitud.contenedores = body.contenedores;
        solicitud.tipo = body.tipo;
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