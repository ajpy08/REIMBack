var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Agencia = require('../models/agencia');
var Maniobra = require('../models/maniobra');
var Viaje = require('../models/viaje');
var variasBucket = require('../public/variasBucket');
var fs = require('fs');
var app = express();

// ==========================================
// Obtener todas las agencias aduanales
// ==========================================
app.get('/:tf',  mdAutenticacion.verificaToken, (req, res, next) => {
  var role = 'AA_ROLE';
  var tf = req.params.tf

  Agencia.find({ role: role, "activo": tf })
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioMod', 'nombre email')
    .sort({ nombreComercial: 1 })
    .exec(
      (err, agencias) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar agencias',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          agencias: agencias,
          total: agencias.length
        });
      });
});


// ==========================================
//  Obtener Agencia por ID
// ==========================================
app.get('/agencia/:id',  mdAutenticacion.verificaToken,  (req, res) => {
  var id = req.params.id;
  Agencia.findById(id)
    .exec((err, agencia) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar agencia',
          errors: err
        });
      }
      if (!agencia) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La agencia con el id ' + id + 'no existe',
          errors: { message: 'No existe una agencia con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        agencia: agencia
      });
    });
});

// ==========================================
//  Obtener Agencias por ID de usuario
// ==========================================
app.get('/usuario/:id',  mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Agencia.find({ usuarios: id })
    .populate('usuarioAlta', 'nombre img email')
    .exec((err, agencia) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar agencias',
          errors: err
        });
      }
      if (!agencia) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La agencia con el id ' + id + 'no existe',
          errors: { message: 'No existe una agencia con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        agencia: agencia
      });
    });
});


// ==========================================
// Crear nueva Agencia
// ==========================================
app.post('/agencia/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var agencia = new Agencia({
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
    patente: body.patente,
    img: body.img,
    activo: body.activo,
    usuarioAlta: req.usuario._id
  });

  variasBucket.MoverArchivoBucket('temp/', agencia.img, 'clientes/');
  variasBucket.MoverArchivoBucket('temp/', agencia.formatoR1, 'clientes/');

  agencia.save((err, agenciaGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear agencia',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      mensaje: 'Agencia creada con éxito.',
      agencia: agenciaGuardado
    });
  });
});

// ==========================================
// Actualizar Agencias
// ==========================================
app.put('/agencia/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Agencia.findById(id, (err, agencia) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar agencia',
        errors: err
      });
    }
    if (!agencia) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La agencia con el id ' + id + ' no existe',
        errors: { message: 'No existe agencia con ese ID' }
      });
    }
    agencia.rfc = body.rfc;
    agencia.razonSocial = body.razonSocial;
    agencia.nombreComercial = body.nombreComercial;
    agencia.calle = body.calle;
    agencia.noExterior = body.noExterior;
    agencia.noInterior = body.noInterior;
    agencia.colonia = body.colonia;
    agencia.municipio = body.municipio;
    agencia.ciudad = body.ciudad;
    agencia.estado = body.estado;
    agencia.cp = body.cp;
    agencia.correo = body.correo;
    agencia.correoFac = body.correoFac;
    agencia.credito = body.credito;
    agencia.patente = body.patente;
    agencia.activo = body.activo;
    agencia.usuarioMod = req.usuario._id;
    agencia.fMod = new Date();


    if (agencia.formatoR1 != body.formatoR1) {
      if (variasBucket.MoverArchivoBucket('temp/', body.formatoR1, 'clientes/')) {
        if (agencia.formatoR1 != null && agencia.formatoR1 != undefined && agencia.formatoR1 != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('clientes/', agencia.formatoR1);
        }
        agencia.formatoR1 = body.formatoR1;
      }
    }

    if (agencia.img != body.img) {
      if (variasBucket.MoverArchivoBucket('temp/', body.img, 'clientes/')) {
        if (agencia.img != null && agencia.img != undefined && agencia.img != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('clientes/', agencia.img);
        }
        agencia.img = body.img;
      }
    }


    agencia.save((err, agenciaGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar agencia',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mensaje: 'Agencia actualizada con exito',
        agencia: agenciaGuardado
      });
    });
  });
});


// ============================================
//   Borrar agencia por id
// ============================================
app.delete('/agencia/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Maniobra.find({$or: [{'agencia': id}]}).exec((err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar Maniobra asociada',
        errors: err
      });
    }
    if (maniobra && maniobra.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La agencia cuenta con ( ' + maniobra.length + ' ) maniobras asociadas, por lo tanto no se puede eliminar',
        errors: {message: 'La agencia tiene ' + maniobra.length + ' asociadas, por lo tanto no se puede eliminar',}
      });
    } else {
      Viaje.find({$or: [{ "agencia": id}]}).exec((err, viaje) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar Viaje asociado',
            errors: err
          });
        }
        if (viaje && viaje.length > 0) {
          return res.status(400).json({
            ok: false,
            mensaje: 'La agencia cuenta con ( ' + viaje.length + ' ) viajes asociados, por lo tanto no se puede eliminar',
            errors: {message:  'La agencia cuenta con ( ' + viaje.length + ' ) viajes asociados, por lo tanto no se puede eliminar'}
          });
        } else {
          Agencia.findByIdAndRemove(id, (err, agenciaBorrado) => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar agencia',
                errors: err
              });
            }
            if (!agenciaBorrado) {
              return res.status(400).json({
                ok: false,
                mensaje: 'No existe agencia con ese id',
                errors: { message: 'No existe agencia con ese id' }
              });
            }
            variasBucket.BorrarArchivoBucket('clientes/', agenciaBorrado.img);
            variasBucket.BorrarArchivoBucket('clientes/', agenciaBorrado.formatoR1);
            res.status(200).json({
              ok: true,
              mensaje: 'Agencia borrada con exito',
              agencia: agenciaBorrado
            });
          });
        }
      });
    }
  });
});


// =======================================
// Actualizar Agencias HABILITAR DESHABILITAR
// =======================================

app.put('/agenciaDes/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body.activo;

  Agencia.findById(id, (err, agencia) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar Agencia',
        errors: err
      });
    }
    if (!agencia) {
      return res.status(400).json({
        ok: false,
        mensaje: ' La Agencia con el id ' + id + ' no existe',
        errors: {message:' La Agencia con el id ' + id + ' no existe'}
      });
    }
    if (agencia.activo === body) {
      var hab = '';
      if (body === ' true') {
        hab = 'Activo';
      } else {
        hab = 'Inactivo'
      }
      return res.status(400).json({
        ok: false,
        mensaje: ' El estatus de la Agencia ' + agencia.nombreComercial + ' ya se encuentra en ' + hab,
        errors: {message: ' El estatus de la Agencia ' + agencia.nombreComercial + ' ya se encuentra en ' + hab}
      });
    }
    agencia.activo = body
    agencia.save((err, agenciaGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar agencia',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        agencia: agenciaGuardado
      });
    });
  });
});

module.exports = app;