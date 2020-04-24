var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var ProductoServicio = require('../models/facturacion/producto-servicio');

// ==========================================
// Obtener todos los Productos o Servicios
// ==========================================
app.get('/', (req, res, next) => {
  ProductoServicio.find({})
    .populate('claveSAT', 'claveProdServ descripcion')
    .populate('unidadSAT', 'claveUnidad nombre')
    .sort({ descripcion: 1 })
    .exec((err, productos_servicios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar Productos o Servicios',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        productos_servicios: productos_servicios,
        total: productos_servicios.length
      });
    });
});

// ==========================================
//  Obtener Producto o Servicio por ID
// ==========================================
app.get('/producto-servicio/:id', (req, res) => {
  var id = req.params.id;
  ProductoServicio.findById(id)
    .populate('claveSAT', 'claveProdServ')
    .populate('unidadSAT', 'claveUnidad')
    .populate('usuario', 'nombre img email')
    .exec((err, producto_servicio) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el producto_servicio',
          errors: err
        });
      }
      if (!producto_servicio) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El producto_servicio con el id ' + id + 'no existe',
          errors: { message: 'No existe un producto_servicio con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        producto_servicio: producto_servicio
      });
    });
});


// ==========================================
// Crear nuevo Producto o Servicio
// ==========================================
app.post('/producto-servicio/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var producto_servicio = new ProductoServicio({
    codigo: body.codigo,
    unidad: body.unidad,
    descripcion: body.descripcion,
    valorUnitario: body.valorUnitario,
    claveSAT: body.claveSAT,
    unidadSAT: body.unidadSAT,
    impuestos: body.impuestos
  });
  producto_servicio.save((err, producto_servicioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear producto o servicio',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      producto_servicio: producto_servicioGuardado
    });
  });
});

// ==========================================
// Actualizar Producto o Servicio
// ==========================================
app.put('/producto-servicio/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  ProductoServicio.findById(id, (err, producto_servicio) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar producto o servicio',
        errors: err
      });
    }
    if (!producto_servicio) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El producto o servicio con el id ' + id + ' no existe',
        errors: { message: 'No existe producto o servicio con ese ID' }
      });
    }

    producto_servicio.codigo = body.codigo,
      producto_servicio.unidad = body.unidad,
      producto_servicio.descripcion = body.descripcion,
      producto_servicio.valorUnitario = body.valorUnitario,
      producto_servicio.claveSAT = body.claveSAT,
      producto_servicio.unidadSAT = body.unidadSAT,
      producto_servicio.impuestos = body.impuestos

    producto_servicio.save((err, producto_servicioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar producto_servicio',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        producto_servicio: producto_servicioGuardado
      });
    });
  });
});

// ============================================
//   Borrar buques por el id
// ============================================
app.delete('/producto-servicio/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  ProductoServicio.findByIdAndRemove(id, (err, producto_servicioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar producto o servicio',
        errors: err
      });
    }
    if (!producto_servicioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe producto o servicio con ese id',
        errors: { message: 'No existe producto o servicio con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      producto_servicio: producto_servicioBorrado
    });
  });
});
module.exports = app;