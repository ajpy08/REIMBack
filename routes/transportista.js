var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Transportista = require('../models/transportista');
var fs = require('fs');
var app = express();

// ==========================================
// Obtener todos los transportistas
// ==========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var role = 'TRANSPORTISTA_ROLE';
    Transportista.find({ role: role })
        .skip(desde)
        .limit(10)
        .exec(
            (err, transportistas) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar transportistas',
                        errors: err
                    });
                }
                Transportista.countDocuments({ role: role }, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        transportistas: transportistas,
                        total: conteo
                    });
                });
            });
});

// ==========================================
// Obtener transportistas por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Transportista.findById(id)
        .populate('usuarioAlta', 'nombre img email')
        .populate('usuarioMod', 'nombre img email')
        .exec((err, transportista) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar transportista',
                    errors: err
                });
            }
            if (!transportista) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La transportista con el id ' + id + 'no existe',
                    errors: { message: 'No existe un transportista con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                transportista: transportista
            });
        });
});


// ==========================================
// Crear nuevo transportista
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var transportista = new Transportista({
        rfc: body.rfc,
        razonSocial: body.razonSocial,
        nombreComercial: body.nombreComercial,
        calle: body.calle,
        noExterior: body.noExterior,
        noInterior: body.noInterior,
        colonia: body.colonia,
        municipio: body.municipio,
        ciudad: body.ciudad,
        estado: body.estado,
        cp: body.cp,
        formatoR1: body.formatoR1,
        correo: body.correo,
        correoFac: body.correoFac,
        credito: body.credito,
        caat: body.caat,
        img: body.img,
        usuarioAlta: req.usuario._id
    });

    console.log(req)
    //console.log(req.usuario);

    if (transportista.img != '' && fs.existsSync('./uploads/temp/' + transportista.img)) {
        fs.rename('./uploads/temp/' + transportista.img, './uploads/clientes/' + transportista.img, (err) => {
            if (err) { console.log(err); }
        });
    }
    if (transportista.formatoR1 != '' && fs.existsSync('./uploads/temp/' + transportista.formatoR1)) {
        fs.rename('./uploads/temp/' + transportista.formatoR1, './uploads/clientes/' + transportista.formatoR1, (err) => {
            if (err) { console.log(err); }
        });
    }

    transportista.save((err, transportistaGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Transportista',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Transportista Creado Con éxito.',
            transportista: transportistaGuardado
        });
    });
});

// ==========================================
// Actualizar transportista
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    Transportista.findById(id, (err, transportista) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar transportista',
                errors: err
            });
        }
        if (!transportista) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El transportista con el id ' + id + ' no existe',
                errors: { message: 'No existe transportista con ese ID' }
            });
        }
        transportista.rfc = body.rfc;
        transportista.razonSocial = body.razonSocial;
        transportista.nombreComercial = body.nombreComercial;
        transportista.calle = body.calle;
        transportista.noExterior = body.noExterior;
        transportista.noInterior = body.noInterior;
        transportista.colonia = body.colonia;
        transportista.municipio = body.municipio;
        transportista.ciudad = body.ciudad;
        transportista.estado = body.estado;
        transportista.cp = body.cp;
        transportista.correo = body.correo;
        transportista.correoFac = body.correoFac;
        transportista.credito = body.credito;
        transportista.caat = body.caat;
        transportista.usuarioMod = req.usuario._id;
        transportista.fMod = new Date();

        if (transportista.img != body.img) {
            if (fs.existsSync('./uploads/temp/' + body.img)) {
                if (transportista.img != undefined || transportista.img != '' && transportista.img != null && fs.existsSync('./uploads/clientes/' + transportista.img)) {
                    fs.unlink('./uploads/clientes/' + transportista.img, (err) => {
                        if (err) console.log(err);
                        else
                            console.log('Imagen anterior fue borrada con éxito');
                    });
                }
                fs.rename('./uploads/temp/' + body.img, './uploads/clientes/' + body.img, (err) => {
                    if (err) { console.log(err); }
                });
                transportista.img = body.img;
            }
        }
        if (transportista.formatoR1 != body.formatoR1) {
            if (fs.existsSync('./uploads/temp/' + body.formatoR1)) {
                if (transportista.formatoR1 != undefined || transportista.formatoR1 != '' && transportista.formatoR1 != null && fs.existsSync('./uploads/clientes/' + transportista.formatoR1)) {
                    fs.unlink('./uploads/clientes/' + transportista.formatoR1, (err) => {
                        if (err) console.log(err);
                        else
                            console.log('File anterior fue borrado con éxito');
                    });
                }
                fs.rename('./uploads/temp/' + body.formatoR1, './uploads/clientes/' + body.formatoR1, (err) => {
                    if (err) { console.log(err); }
                });
                transportista.formatoR1 = body.formatoR1;
            }
        }
        transportista.save((err, transportistaGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar transportista',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Transportista actualizado con exito',
                transportista: transportistaGuardado
            });
        });
    });
});


// ============================================
//   Borrar transportistas por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Transportista.findByIdAndRemove(id, (err, transportistaBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar transportista',
                errors: err
            });
        }
        if (!transportistaBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe transportista con ese id',
                errors: { message: 'No existe transportista con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            transportista: transportistaBorrado
        });

    });

});


module.exports = app;