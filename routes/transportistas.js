var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Transportista = require('../models/transportista');
var Operador = require('../models/operador');
var Camion = require('../models/camion');
var variasBucket = require('../public/variasBucket');
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
    .sort({ nombreComercial: 1 })
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
    usoCFDI: body.usoCFDI,
    usuarioAlta: req.usuario._id
  });

  variasBucket.MoverArchivoBucket('temp/', transportista.img, 'clientes/');
  variasBucket.MoverArchivoBucket('temp/', transportista.formatoR1, 'clientes/');

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
    transportista.usoCFDI = body.usoCFDI;
    transportista.usuarioMod = req.usuario._id;
    transportista.fMod = new Date();

    if (transportista.formatoR1 != body.formatoR1) {
      if (variasBucket.MoverArchivoBucket('temp/', body.formatoR1, 'clientes/')) {
        if (transportista.formatoR1 != null && transportista.formatoR1 != undefined && transportista.formatoR1 != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('clientes/', transportista.formatoR1);
        }
        transportista.formatoR1 = body.formatoR1;
      }
    }

    if (transportista.img != body.img) {
      if (variasBucket.MoverArchivoBucket('temp/', body.img, 'clientes/')) {
        if (transportista.img != null && transportista.img != undefined && transportista.img != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('clientes/', transportista.img);
        }
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
  Operador.find({
      $or: [
        { "transportista": id }
      ]
    })
    .exec(
      (err, operadores) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al intentar cargar operadores asociados.',
            errors: err
          });
        }
        if (operadores && operadores.length > 0) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Existen ' + operadores.length + ' asociados, por lo tanto no se permite eliminar.',
            errors: { message: 'Existen ' + operadores.length + ' operadores asociados a trasportistas, por lo tanto no se puede eliminar.' }
          });
        } else {
          Camion.find({
              $or: [
                { "transportista": id }
              ]
            })
            .exec(
              (err, camiones) => {
                if (err) {
                  return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al intentar cargar camiones asociados.',
                    errors: err
                  });
                }
                if (camiones && camiones.length > 0) {
                  return res.status(400).json({
                    ok: false,
                    mensaje: 'Existen ' + camiones.length + ' asociados, por lo tanto no se permite eliminar.',
                    errors: { message: 'Existen ' + camiones.length + ' camiones asociados a trasportistas, por lo tanto no se puede eliminar.' }
                  });
                } else {
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
                    variasBucket.BorrarArchivoBucket('clientes/', transportistaBorrado.img);
                    variasBucket.BorrarArchivoBucket('clientes/', transportistaBorrado.formatoR1);
                    res.status(200).json({
                      ok: true,
                      transportista: transportistaBorrado
                    });
                  });
                }
              });
        }
      })
});

module.exports = app;