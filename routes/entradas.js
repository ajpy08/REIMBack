var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Entrada = require('../models/entrada');
var app = express();
const controller = require('../controllers/entradasController');

// ==========================================
//  Obtener todos las Entradas
// ==========================================

app.get('/', mdAutenticacion.verificaToken, (req, res) => {

    const entradas = controller.consultaEntradas(req, res);
    entradas.then(entradas => {
            res.status(200).json({
                ok: true,
                entradas,
                totalRegistros: entradas.length
            });
    }).catch(error => {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando entradas',
            errors: error
        });
    });

    // var noFactura = req.query.noFactura || '';
    // var proveedor = req.query.proveedor || '';
    // var material = req.query.material || '';
    // var filtro = '{';
    // if (noFactura != 'undefined' && noFactura != '')
    //     filtro += '\"noFactura\":' + '\"' + noFactura + '\",';
    // if (proveedor != 'undefined' && proveedor != '')
    //     filtro += '\"proveedor\":' + '\"' + proveedor + '\",';
    // if (material != 'undefined' && material != '')
    //     filtro += '\"detalles.material\":' + '\"' + material + '\",';
    // if (filtro != '{')
    //     filtro = filtro.slice(0, -1);
    // filtro = filtro + '}';
    // var json = JSON.parse(filtro);
    // Entrada.find(json)
    //     .populate('usuarioAlta', 'nombre email')
    //     .populate('usuarioMod', 'nombre email')
    //     .populate('proveedor', 'razonSocial')
    //     .populate('detalles.material', 'descripcion')
    //     .sort({ fAlta: -1 })
    //     .exec(
    //         (err, entradas) => {
    //             if (err) {
    //                 return res.status(500).json({
    //                     ok: false,
    //                     mensaje: 'Error cargando entradas',
    //                     errors: err
    //                 });
    //             }
    //             res.status(200).json({
    //                 ok: true,
    //                 entradas: entradas,
    //                 totalRegistros: entradas.length
    //             });
    //         });
});

// ==========================================
//  Obtener Entrada por ID
// ==========================================
app.get('/entrada/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Entrada.findById(id)
        .populate('detalles.material', 'descripcion')
        // .populate({
        //     path: "detalles.detalle",
        //     select: 'material cantidad costo entrada',

        //     populate: {
        //         path: "material",
        //         select: 'descripcion'
        //     }
        // })
        .exec((err, entrada) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar entrada',
                    errors: err
                });
            }
            if (!entrada) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El entrada con el id ' + id + ' no existe',
                    errors: { message: 'No existe un entrada con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                entrada: entrada
            });
        });
});

// ==========================================
// Crear una nueva entrada
// ==========================================
app.post('/entrada/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var entrada = new Entrada({
        noFactura: body.noFactura,
        proveedor: body.proveedor,
        fFactura: body.fFactura,
        detalles: body.detalles,
        usuarioAlta: req.usuario._id
    });

    entrada.save((err, entradaGuardada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear entrada',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Entrada creada con éxito.',
            entrada: entradaGuardada
        });
    });
});

// ==========================================
// Actualizar entrada
// ==========================================

app.put('/entrada/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Entrada.findById(id, (err, entrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar entrada',
                errors: err
            });
        }
        if (!entrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La entrada con el id ' + id + ' no existe',
                errors: { message: 'No existe una entrada con ese ID' }
            });
        }
        entrada.noFactura = body.noFactura;
        entrada.proveedor = body.proveedor;
        entrada.fFactura = body.fFactura;
        entrada.detalles = body.detalles;
        entrada.usuarioMod = req.usuario._id;
        entrada.fMod = new Date();
        entrada.save((err, entradaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar entrada',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                entrada: entradaGuardada
            });
        });
        // body.detalles.forEach(det => {
        //     if (det._id === '') {
        //         var detalle = new DetalleMaterial({
        //             material: det.material,
        //             cantidad: det.cantidad,
        //             costo: det.costo,
        //             entrada: entrada._id,
        //             usuarioAlta: req.usuario._id
        //         });

        //         detalle.save((err, detalleGuardado) => {
        //             if (err) {
        //                 return res.status(400).json({
        //                     ok: false,
        //                     mensaje: 'Error al agregar detalle',
        //                     errors: err
        //                 });
        //             }
        //             Entrada.findByIdAndUpdate(id, { $push: { detalles: { detalle: detalleGuardado._id } } }, (err, entradaActualizada) => {
        //                 if (err) {
        //                     return res.status(400).json({
        //                         ok: false,
        //                         mensaje: 'Error al actualizar entrada',
        //                         errors: err
        //                     });
        //                 }
        //                 res.status(200).json({
        //                     ok: true,
        //                     entrada: entradaActualizada
        //                 });
        //             });
        //         });
        //     }
        // });
    });
});

// ============================================
//  Borrar un Entrada por el id
// ============================================
app.delete('/entrada/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Entrada.findById(id, (err, entradaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar entrada',
                errors: err
            });
        }
        if (!entradaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe una entrada con ese id',
                errors: { message: 'No existe una entrada con ese id' }
            });
        }
        entradaBorrada.remove();
        res.status(200).json({
            ok: true,
            entrada: entradaBorrada
        });
    });

    // DetalleMaterial.find({
    //     $or: [
    //         { 'entrada': id }
    //     ]
    // })
    //     .exec(
    //         (err, detalleMaterial) => {
    //             if (err) {
    //                 return res.status(500).json({
    //                     ok: false,
    //                     mensaje: 'Error al intentar validar la eliminacion del entrada',
    //                     errors: err
    //                 });
    //             }
    //             if (detalleMaterial && detalleMaterial.length > 0) {
    //                 res.status(400).json({
    //                     ok: false,
    //                     mensaje: 'El entrada ya tiene detalles registrados, por lo tanto no puede eliminarse.',
    //                     errors: { message: 'El entrada ya tiene detalles registrados, por lo tanto no puede eliminarse.' },
    //                     resultadoError: detalleMaterial
    //                 });
    //             }               
    //         });
});
module.exports = app;