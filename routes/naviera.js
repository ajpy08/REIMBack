var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Naviera = require('../models/naviera');

// ==========================================
// Obtener todas las navieras
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var role = 'NAVIERA_ROLE';

    Naviera.find({ role: role })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, naviera) => {

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
                        naviera: naviera,
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
        .populate('usuario', 'nombre img email')
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

        naviera.razonSocial = body.razonSocial;
        naviera.rfc = body.rfc;
        naviera.calle = body.calle;
        naviera.numeroExterior = body.numeroExterior;
        naviera.numeroInterior = body.numeroInterior;
        naviera.colonia = body.colonia;
        naviera.municipioDelegacion = body.municipioDelegacion;
        naviera.ciudad = body.ciudad;
        naviera.estado = body.estado;
        naviera.cp = body.cp;
        naviera.correo = body.correo;
        naviera.correoFac = body.correoFac;
        naviera.credito = body.credito;
        naviera.patente = body.patente;
        naviera.nombreComercial = body.nombreComercial;
        naviera.usuario = req.usuario._id;


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



// ==========================================
// Crear nuevas navieras
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var naviera = new Naviera({
        razonSocial: body.razonSocial,
        rfc: body.rfc,
        calle: body.calle,
        numeroExterior: body.numeroExterior,
        numeroInterior: body.numeroInterior,
        colonia: body.colonia,
        municipioDelegacion: body.municipioDelegacion,
        ciudad: body.ciudad,
        estado: body.estado,
        cp: body.cp,
        correo: body.correo,
        correoFac: body.correoFac,
        credito: body.credito,
        patente: body.patente,
        nombreComercial: body.nombreComercial,
        usuario: req.usuario._id
    });

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
            naviera: navieraGuardado
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