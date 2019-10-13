var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Agencia = require('../models/agencia');
var variasBucket = require('../public/variasBucket');
var fs = require('fs');
var app = express();

// ==========================================
// Obtener todas las agencias aduanales
// ==========================================
app.get('/', (req, res, next) => {
  var role = 'AA_ROLE';
  Agencia.find({ role: role })
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioMod', 'nombre email')
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
app.get('/agencia/:id', (req, res) => {
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
app.get('/usuario/:id', (req, res) => {
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
});

module.exports = app;