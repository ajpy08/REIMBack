var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Naviera = require('../models/naviera');
var fs = require('fs');
var app = express();

// ==========================================
// Obtener todas las navieras
// ==========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var role = 'NAVIERA_ROLE';
    Naviera.find({ role: role })
        .skip(desde)
        .limit(10)
        .populate('usuarioAlta', 'nombre email')
        .populate('usuarioMod', 'nombre email')
        .exec(
            (err, navieras) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar navieras',
                        errors: err
                    });
                }
                Naviera.countDocuments({ role: role }, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        navieras: navieras,
                        total: conteo
                    });
                });
            });
});

// ==========================================
//  Obtener Naviera por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Naviera.findById(id)
        .exec((err, naviera) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar la naviera',
                    errors: err
                });
            }
            if (!naviera) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La naviera con el id ' + id + 'no existe',
                    errors: { message: 'No existe una naviera con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                naviera: naviera
            });
        });
});

// ==========================================
// Crear nuevas navieras
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var naviera = new Naviera({
        rfc: body.rfc,
        razonSocial: body.razonSocial,
        nombreComercial: body.nombreComercial,
        calle: body.calle ,
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

    if (naviera.img!='' && fs.existsSync('./uploads/temp/' + naviera.img)) {
        fs.rename('./uploads/temp/' + naviera.img, './uploads/clientes/' + naviera.img, (err) => {
            if (err) { console.log(err); }
        });
    }
    if (naviera.formatoR1!='' && fs.existsSync('./uploads/temp/' + naviera.formatoR1)) {
        fs.rename('./uploads/temp/' + naviera.formatoR1, './uploads/clientes/' + naviera.formatoR1, (err) => {
            if (err) { console.log(err); }
        });
    }

    naviera.save((err, navieraGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear naviera',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Naviera Creada Con éxito.',
            naviera: navieraGuardado
        });


    });

});

// ==========================================
// Actualizar Naviera
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Naviera.findById(id, (err, naviera) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar naviera',
                errors: err
            });
        }
        if (!naviera) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La naviera con el id ' + id + ' no existe',
                errors: { message: 'No existe una naviera con ese ID' }
            });
        }
        
        naviera.rfc = body.rfc;
        naviera.razonSocial = body.razonSocial;
        naviera.nombreComercial = body.nombreComercial;
        naviera.calle = body.calle;
        naviera.noExterior = body.noExterior;
        naviera.noInterior = body.noInterior;
        naviera.colonia = body.colonia;
        naviera.municipio = body.municipio;
        naviera.ciudad = body.ciudad;
        naviera.estado = body.estado;
        naviera.cp = body.cp;
        naviera.correo = body.correo;
        naviera.correoFac = body.correoFac;
        naviera.credito = body.credito;
        naviera.caat = body.caat;
        naviera.usuarioMod = req.usuario._id;
        naviera.fMod = new Date();
        
        console.log (naviera);
        if (naviera.img != body.img) {
            if (fs.existsSync('./uploads/temp/' + body.img)) {
                fs.unlink('./uploads/clientes/' + naviera.img, (err) => {
                    if (err) console.log(err);
                    else
                        console.log('Imagen anterior fue borrada con éxito');
                });
                fs.rename('./uploads/temp/' + body.img, './uploads/clientes/' + body.img, (err) => {
                    if (err) { console.log(err); }
                });
            }
            naviera.img = body.img;
        }
        if (naviera.formatoR1 != body.formatoR1) {
            if (fs.existsSync('./uploads/temp/' + body.formatoR1)) {
                fs.unlink('./uploads/clientes/' + naviera.formatoR1, (err) => {
                    if (err) console.log(err);
                    else
                        console.log('Imagen anterior fue borrada con éxito');
                });
                fs.rename('./uploads/temp/' + body.formatoR1, './uploads/clientes/' + body.formatoR1, (err) => {
                    if (err) { console.log(err); }
                });
            }
            naviera.formatoR1 = body.formatoR1;
        }
        naviera.save((err, navieraGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar naviera',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                naviera: navieraGuardado
            });

        });

    });
});

// ============================================
//   Borrar navieras por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Naviera.findByIdAndRemove(id, (err, navieraBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar naviera',
                errors: err
            });
        }
        if (!navieraBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe naviera con ese id',
                errors: { message: 'No existe naviera con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            naviera: navieraBorrado
        });
    });
});


module.exports = app;