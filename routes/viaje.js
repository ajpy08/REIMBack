var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();
var Viaje = require('../models/viaje');

var Maniobra = require('../models/maniobra');

// default options
app.use(fileUpload());

// ==========================================
// Obtener todas los viajes
// ==========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Viaje.find({})
        .skip(desde)
        .limit(10)
        .populate('buque', 'buque')
        .exec(
            (err, viajes) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar viajes',
                        errors: err
                    });
                }
                Viaje.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        viajes: viajes,
                        total: conteo
                    });
                });
            });
});

// ==========================================
//  Obtener viaje por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Viaje.findById(id)
        .exec((err, viaje) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar viaje',
                    errors: err
                });
            }
            if (!viaje) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El viaje con el id ' + id + 'no existe',
                    errors: { message: 'No existe un viaje con ese ID' }
                });
            }
            Maniobra.find({}).exec(
                (err, maniobras) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando maniobras',
                            errors: err
                        });
                    }
                    viaje.contenedores = maniobras;
                    res.status(200).json({
                        ok: true,
                        viaje: viaje
                    });
                });
        });
});


// ==========================================
//  Obtener viajes por numero
// ==========================================
app.get('/numero/:viaje', (req, res) => {

    var viaje = req.params.viaje;

    Viaje.find({ 'viaje': viaje })
        .populate('buque', 'buque')
        .exec((err, viaje) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar viaje',
                    errors: err
                });
            }

            if (!viaje) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El viaje con el numero' + viaje + 'no existe',
                    errors: { message: 'No existe un viaje con ese Numero' }
                });
            }
            res.status(200).json({
                ok: true,
                viaje: viaje
            });
        });
});

// ==========================================
// Crear nuevo viaje
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var viaje = new Viaje({
        viaje: body.viaje,
        buque: body.buque,
        fArribo: body.fechaArribo,
        fVigenciaTemporal: body.fechaVigenciaTemporal,
        pdfTemporal: body.pdfTemporal,
        usuarioAlta: req.usuario._id
    });

    if (viaje.pdfTemporal != '' && fs.existsSync('./uploads/temp/' + viaje.pdfTemporal)) {
        fs.rename('./uploads/temp/' + viaje.pdfTemporal, './uploads/viajes/' + viaje.pdfTemporal, (err) => {
            if (err) { console.log(err); }
        });
    }
    viaje.save((err, viajeGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear viaje',
                errors: err
            });
        }
        body.contenedores.forEach(function(element) {
            var maniobra;
            if (element.estado == 'VACIO') {
                maniobra = new Maniobra({
                    viaje: viaje._id,
                    cliente: "5c49e55b6b427b166466c9b3",
                    facturarA: "AQUI IRIA NOMBRE DE LA NAVIERA",
                    correoFac: 'aqui iria correo del datos que hay en clientes',
                    contenedor: element.contenedor,
                    tipo: element.tipo,
                    estado: element.estado,
                    estatus: 'TRANSITO',
                    destinatario: element.destinatario,
                    usuarioAlta: req.usuario._id
                });
            } else {
                maniobra = new Maniobra({
                    viaje: viaje._id,
                    contenedor: element.contenedor,
                    tipo: element.tipo,
                    estado: element.estado,
                    estatus: 'APROBACION',
                    destinatario: element.destinatario,
                    usuarioAlta: req.usuario._id
                });
            }
            maniobra.save((err, maniobraGuardado) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al cargar la maniobra",
                        errors: err
                    });
                }
            });
        });
        res.status(201).json({
            ok: true,
            mensaje: 'Viaje dado de alta con éxito',
            viaje: viajeGuardado
        });
    });
});


// ==========================================
// Actualizar Viaje
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Viaje.findById(id, (err, viaje) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar viaje',
                errors: err
            });
        }
        if (!viaje) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El viaje con el id ' + id + ' no existe',
                errors: { message: 'No existe viaje con ese ID' }
            });
        }
        viaje.viaje = body.viaje;
        viaje.buque = body.buque;
        viaje.fArribo = body.fechaArribo;
        viaje.fVigenciaTemporal = body.fechaVigenciaTemporal;
        viaje.usuarioMod = req.usuario._id;
        viaje.fMod = new Date();

        if (viaje.pdfTemporal != body.pdfTemporal) {
            if (fs.existsSync('./uploads/temp/' + body.pdfTemporal)) {
                if (viaje.pdfTemporal != undefined || viaje.pdfTemporal != '' && viaje.pdfTemporal != null && fs.existsSync('./uploads/viajes/' + viaje.pdfTemporal)) {
                    fs.unlink('./uploads/viajes/' + viaje.pdfTemporal, (err) => {
                        if (err) console.log(err);
                        else
                            console.log('File anterior fue borrado con éxito');
                    });
                }
                fs.rename('./uploads/temp/' + body.pdfTemporal, './uploads/viajes/' + body.pdfTemporal, (err) => {
                    if (err) { console.log(err); }
                });
                viaje.pdfTemporal = body.pdfTemporal;
            }
        }
        viaje.save((err, viajeGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar viaje',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Transportista actualizado con exito',
                viaje: viajeGuardado
            });

        });

    });

});

// ==========================================
// Remover contenedores del viaje
// ==========================================

app.put('/removecontenedor/:id&:contenedor', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var contenedor = req.params.contenedor;

    Maniobra.find({ 'viaje': id, 'contenedor': contenedor })
        .exec((err, conte) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar viaje - Contenedor',
                    errors: err
                });
            }
            if (!conte) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El contenedor ' + contenedor + ' no existe',
                    errors: { message: 'No existe un contendor con ese Numero' }
                });
            }
            console.log(contenedor);
            Maniobra.findOneAndDelete({ 'viaje': id, 'contenedor': contenedor }, (err, contBorrado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al borrar el contenedor',
                        errors: err
                    });
                }
                if (!contBorrado) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El contenedor ' + conte.contenedor + ' no existe',
                        errors: { message: 'No existe un contendor con ese Numero' }
                    });
                }
                res.status(200).json({
                    ok: true,
                    contenedor: contBorrado
                });
            });

            // res.status(200).json({
            //     ok: true,
            //     viaje: viaje
            // });
        });
});

// ==========================================
// Agregar Contenedor al viaje
// ==========================================

app.put('/addcontenedor/:id&:contenedor&:tipo&:estado&:destinatario', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var contenedor = req.params.contenedor;
    var tipo = req.params.tipo;
    var estado = req.params.estado;
    var destinatario = req.params.destinatario;
    if (estado == 'VACIO') {
        maniobra = new Maniobra({
            viaje: id,
            facturarA: "AQUI IRIA NOMBRE DE LA NAVIERA",
            correoFac: 'aqui iria correo del datos que hay en clientes',
            contenedor: contenedor,
            tipo: tipo,
            estado: estado,
            estatus: 'APROBADO',
            destinatario: destinatario,
            usuarioAlta: req.usuario._id
        });
    } else {
        maniobra = new Maniobra({
            viaje: id,
            contenedor: contenedor,
            tipo: tipo,
            estado: estado,
            estatus: 'APROBACION',
            destinatario: destinatario,
            usuarioAlta: req.usuario._id
        });
    }
    maniobra.save((err, maniobraGuardado) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                ok: false,
                mensaje: "Error al cargar la maniobra",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Contenedor Agregado con éxito.',
            contenedor: maniobraGuardado
        });
    });
});

// ============================================
// Borrar viaje por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Viaje.findByIdAndRemove(id, (err, viajeBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar viaje',
                errors: err
            });
        }
        if (!viajeBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe viaje con ese id',
                errors: { message: 'No existe viaje con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            viaje: viajeBorrado
        });
    });
});


module.exports = app;