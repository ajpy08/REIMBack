var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Contenedor = require('../models/contenedor');

// ==========================================
// Obtener todas los contenedores
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Contenedor.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, contenedor) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar contenedores',
                        errors: err
                    });
                }

                Contenedor.countDocuments({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        contenedor: contenedor,
                        total: conteo
                    });
                });

            });
});

// ==========================================
//  Obtener contenedores por ID
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Contenedor.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, contenedor) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar contenedor',
                    errors: err
                });
            }

            if (!contenedor) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Ccontenedor con el id ' + id + 'no existe',
                    errors: { message: 'No existe un contenedor con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                contenedor: contenedor
            });
        });
});





// ==========================================
// Actualizar Contenedor
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Contenedor.findById(id, (err, contenedor) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar placas',
                errors: err
            });
        }

        if (!contenedor) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El contenedor con el id ' + id + ' no existe',
                errors: { message: 'No existe contenedor con ese ID' }
            });
        }


        contenedor.contenedor = body.contenedor;
        contenedor.tipo = body.tipo;
        contenedor.usuario = req.usuario._id;

        contenedor.save((err, contenedorGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar contenedor',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                contenedor: contenedorGuardado
            });

        });

    });

});



// ==========================================
// Crear nuevos contenedores
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var contenedor = new Contenedor({
        contenedor: body.contenedor,
        tipo: body.tipo,
        usuario: req.usuario._id
    });

    contenedor.save((err, contenedorGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear contenedor',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            contenedor: contenedorGuardado
        });


    });

});


// ============================================
//   Borrar contenedor por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Contenedor.findByIdAndRemove(id, (err, contenedorBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar contenedor',
                errors: err
            });
        }

        if (!contenedorBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe contenedor con ese id',
                errors: { message: 'No existe contenedor con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            contenedor: contenedorBorrado
        });

    });

});


module.exports = app;