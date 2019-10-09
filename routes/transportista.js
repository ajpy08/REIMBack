var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Transportista = require('../models/transportista');
var varias = require('../public/varias');
var fs = require('fs');
var app = express();

// ==========================================
// Obtener todos los transportistas
// ==========================================
app.get('/', (req, res, next) => {
  var role = 'TRANSPORTISTA_ROLE';
  Transportista.find({ role: role })
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioMod', 'nombre email')
    .exec(
      (err, transportistas) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar transportistas',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          transportistas: transportistas,
          total: transportistas.length
        });

      });
});

// ==========================================
// Obtener transportistas por ID
// ==========================================
app.get('/transportista/:id', (req, res) => {
  var id = req.params.id;
  Transportista.findById(id)
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
app.post('/transportista/', mdAutenticacion.verificaToken, (req, res) => {
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

  varias.MoverArchivoFromTemp('./uploads/temp/', transportista.img, './uploads/clientes/', transportista.img);

  varias.MoverArchivoFromTemp('./uploads/temp/', transportista.formatoR1, './uploads/clientes/', transportista.formatoR1);

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
app.put('/transportista/:id', mdAutenticacion.verificaToken, (req, res) => {

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

    if (transportista.formatoR1 != body.formatoR1) {
      if (varias.MoverArchivoFromTemp('./uploads/temp/', body.formatoR1, 'clientes/', transportista.formatoR1)) {
        transportista.formatoR1 = body.formatoR1;
      }
    }

    if (transportista.img != body.img) {
      if (varias.MoverArchivoFromTemp('./uploads/temp/', body.img, 'clientes/', transportista.img)) {
        transportista.img = body.img;
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
app.delete('/transportista/:id', mdAutenticacion.verificaToken, (req, res) => {
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