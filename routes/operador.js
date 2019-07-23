var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Operador = require('../models/operador');
var fs = require('fs');
var app = express();

// ==========================================
// Obtener todos los Operador
// ==========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Operador.find({})
        .skip(desde)
        .limit(10)
        .populate('usuarioAlta', 'nombre email')
        .populate('usuarioMod', 'nombre email')
        .populate('transportista', 'rfc razonSocial')
        .exec(
            (err, operadores) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando operador',
                        errors: err
                    });                }
                Operador.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        operadores: operadores,
                        totalRegistros: conteo
                    });
                });
            });
});

// ==========================================
//  Obtener Operador por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Operador.findById(id)
        .populate('usuarioAlta', 'nombre img email')
        .exec((err, operadores) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar al operador',
                    errors: err
                });
            }
            if (!operadores) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El operador con el id ' + id + 'no existe',
                    errors: { message: 'No existe un operador con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                operadores: operadores
            });
        });
});

// ==========================================
// Crear un nuevo operador
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var operador = new Operador({
        transportista: body.transportista,
        nombre: body.nombre,
        foto : body.foto,
        licencia : body.licencia,
        vigenciaLicencia: body.vigenciaLicencia,
        fotoLicencia: body.fotoLicencia,
        activo: body.activo,
        usuarioAlta: req.usuario._id
    });

    if (operador.foto != '' && fs.existsSync('./uploads/temp/' + operador.foto)) {
        fs.rename('./uploads/temp/' + operador.foto, './uploads/operadores/' + operador.foto, (err) => {
            if (err) { console.log(err); }
        });
    }
    
    if (operador.fotoLicencia != '' && fs.existsSync('./uploads/temp/' + operador.fotoLicencia)) {
        fs.rename('./uploads/temp/' + operador.fotoLicencia, './uploads/operadores/' + operador.fotoLicencia, (err) => {
            if (err) { console.log(err); }
        });
    }

    operador.save((err, operadorGuardado) => {
        console.log(err)
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear operador',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Operador creado con éxito.',
            operador: operadorGuardado
        });
    });
});

// ==========================================
// Actualizar Operador
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Operador.findById(id, (err, operador) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar al operador',
                errors: err
            });
        }
        if (!operador) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El operador con el id ' + id + ' no existe',
                errors: { message: 'No existe un operador con ese ID' }
            });
        }
        operador.transportista =  body.transportista;
        operador.nombre = body.nombre;
        operador.usuario = req.usuario._id;
        operador.foto = body.foto;
        operador.licencia = body.licencia;
        operador.vigenciaLicencia =  body.vigenciaLicencia;
        operador.fotoLicencia = body.fotoLicencia;
        operador.activo = body.activo;
        operador.usuarioMod = req.usuario._id;
        operador.fMod = new Date();

        if (operador.foto != body.foto) {
            console.log(operador.foto)
            console.log(body.foto)
            if (fs.existsSync('./uploads/temp/' + body.foto)) {
                if (operador.foto != undefined || operador.foto != '' && operador.foto != null && fs.existsSync('./uploads/operadores/' + operador.foto)) {
                    fs.unlink('./uploads/operadores/' + operador.foto, (err) => {
                        if (err) console.log(err);
                        else
                            console.log('Imagen anterior fue borrada con éxito');
                    });
                }
                fs.rename('./uploads/temp/' + body.foto, './uploads/operadores/' + body.foto, (err) => {
                    if (err) { console.log(err); }
                });
                operador.foto = body.foto;
            }
        } 

        if (operador.fotoLicencia != body.fotoLicencia) {
            if (fs.existsSync('./uploads/temp/' + body.fotoLicencia)) {
                if (operador.fotoLicencia != undefined || operador.fotoLicencia != '' && operador.fotoLicencia != null && fs.existsSync('./uploads/operadores/' + operador.fotoLicencia)) {
                    fs.unlink('./uploads/operadores/' + operador.fotoLicencia, (err) => {
                        if (err) console.log(err);
                        else
                            console.log('Imagen anterior fue borrada con éxito');
                    });
                }
                fs.rename('./uploads/temp/' + body.fotoLicencia, './uploads/operadores/' + body.fotoLicencia, (err) => {
                    if (err) { console.log(err); }
                });
                operador.fotoLicencia = body.fotoLicencia;
            }
        } 

        operador.save((err, operadorGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar al operador',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                operador: operadorGuardado
            });
        });
    });
});


// ============================================
//  Borrar un operador por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Operador.findByIdAndRemove(id, (err, operadorBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el operador',
                errors: err
            });
        }
        if (!operadorBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un operador con ese id',
                errors: { message: 'No existe un operador con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            operador: operadorBorrado
        });
    });
});


module.exports = app;