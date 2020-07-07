var express = require('express');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var ClaveProductoServicio = require('../models/facturacion/claveSAT');



//=============================================================
//  OBTENER TODAS LAS CLAVES PRODUCTOS SERVICIOS
//=============================================================
app.get('/',  mdAutenticacion.verificaToken,(req, res, next) => {
    ClaveProductoServicio.find({})
        .exec((err, clave) => {
            if (err) {
                return status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar Claves productos servicios',
                    erroros: err
                });
            }
            res.status(200).json({
                ok: true,
                ClaveProServicio: clave,
                total: clave.length
            });
        });
});


//=============================================================
//  OBTENER POR ID CLAVES PRODUCTOS SERVICIOS
//=============================================================

app.get('/clave-producto-servicio/:id',  mdAutenticacion.verificaToken,(req, res) => {
    var id = req.params.id;
    ClaveProductoServicio.findById(id).exec((err, clave) => {
        if (err) {
            return status(500).json({
                ok: false,
                mensaje: 'Error al buscar Clave Producto servicio',
                erroros: err
            });
        }
        if (!clave) {
            return status(400).json({
                ok: false,
                mensaje: 'La Clave producto servicio con el id ' + id + ' no existe',
                erroros: err
            });
        }

        res.status(200).json({
            ok: true,
            ClaveProServicio: clave
        });
    });
});

//=============================================================
//  CREAR NURVO CLAVES PRODUCTOS SERVICIOS
//=============================================================
app.post('/clave-producto-servicio/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var clave_producto_servicio = new ClaveProductoServicio({
        claveProdServ: body.claveProdServ,
        descripcion: body.descripcion,
        incluir_IVA_trasladado: body.incluir_IVA_trasladado,
        incluir_IEPS_trasladado: body.incluir_IEPS_trasladado,
        palabras_similares: body.palabras_similares
    });
    clave_producto_servicio.save((err, clave_producto_servicioGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear Clave Producto Servicio',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            clave_producto_servicio: clave_producto_servicioGuardado
        });
    });
});

//=============================================================
// ACTUALIZAR CLAVES PRODUCTOS SERVICIOS
//=============================================================

app.put('/clave-producto-servicio/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body
    ClaveProductoServicio.findById(id).exec((err, clave) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Clave producto servicio',
                errors: err
            });
        }
        if (!clave) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La Clave producto servicio ' + id + ' no existe',
                errors: {message: 'No existe Clave Producto Servicio con ese ID'}
            });
        }
        clave.claveProdServ = body.claveProdServ,
        clave.descripcion = body.descripcion,
        clave.incluir_IVA_trasladado = body.incluir_IVA_trasladado,
        clave.incluir_IEPS_trasladado = body.incluir_IEPS_trasladado,
        clave.palabras_similares = body.palabras_similares

        clave.save((err, claveGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Clave Producto Servicio',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                clave: claveGuardada
            });
        });
    });
});

//=============================================================
// BORRAR CLAVES PRODUCTOS SERVICIOS
//=============================================================

app.delete('/clave-producto-servicio/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    ClaveProductoServicio.findByIdAndRemove(id, (err, claveBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Clave Producto Servicio',
                errors: err
            });
        }
        if (!claveBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe Clave Producto Servicio con ese ID',
                errors: {message: 'No existe Clave Producto Servicio con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            clave: claveBorrada
        });
    });
});
module.exports = app;