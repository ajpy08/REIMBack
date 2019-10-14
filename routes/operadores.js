var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Operador = require('../models/operador');
var fs = require('fs');
var app = express();
var Maniobra = require('../models/maniobra');
var variasBucket = require('../public/variasBucket');
var mongoose = require('mongoose');

// ==========================================
// Obtener todos los Operadores
// Por query se le puede pasar :
// id de transportista
// Activo : true / false
// ==========================================

app.get('/', (req, res, next) => {
  var transportista = req.query.transportista || '';
  var activo = req.query.activo || '';
  var filtro = '{';
  if (transportista != 'undefined' && transportista != '')
    filtro += '\"transportista\":' + '\"' + transportista + '\",';
  if (activo != 'undefined' && activo != '')
    filtro += '\"activo\":' + '\"' + activo + '\",';
  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);
  Operador.find(json)
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioMod', 'nombre email')
    .populate('transportista', 'rfc razonSocial')
    .exec(
      (err, operadores) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando operadores',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          operadores: operadores,
          totalRegistros: operadores.length
        });
      });
});

// ==========================================
//  Obtener Operador por ID
// ==========================================
app.get('/operador/:id', (req, res) => {
  var id = req.params.id;
  Operador.findById(id)
    .exec((err, operadores) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar al operador',
          errors: err
        });
      }
      if (!operadores) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El operador con el id ' + id + 'no existe',
          errors: { message: 'No existe un operador con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        operadores: operadores
      });
    });
});

// ==========================================
//  Obtener Operador por ID, con includes
// ==========================================
app.get('/operador/:id/includes', (req, res) => {
  var id = req.params.id;
  Operador.findById(id)
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioMod', 'nombre email')
    .populate('transportista', 'rfc razonSocial')
    .exec((err, operadores) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar al operador',
          errors: err
        });
      }
      if (!operadores) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El operador con el id ' + id + 'no existe',
          errors: { message: 'No existe un operador con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        operadores: operadores
      });
    });
});

// ==========================================
// Crear un nuevo operador
// ==========================================
app.post('/operador/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var operador = new Operador({
    transportista: body.transportista,
    nombre: body.nombre,
    foto: body.foto,
    licencia: body.licencia,
    vigenciaLicencia: body.vigenciaLicencia,
    fotoLicencia: body.fotoLicencia,
    activo: body.activo,
    usuarioAlta: req.usuario._id
  });

  variasBucket.MoverArchivoBucket('temp/', operador.foto, 'operadores/');
  variasBucket.MoverArchivoBucket('temp/', operador.fotoLicencia, 'operadores/');


  operador.save((err, operadorGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear operador',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      mensaje: 'Operador creado con éxito.',
      operador: operadorGuardado
    });
  });
});

// ==========================================
// Actualizar Operador
// ==========================================
app.put('/operador/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Operador.findById(id, (err, operador) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar al operador',
        errors: err
      });
    }
    if (!operador) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El operador con el id ' + id + ' no existe',
        errors: { message: 'No existe un operador con ese ID' }
      });
    }
    operador.transportista = body.transportista;
    operador.nombre = body.nombre;
    operador.usuario = req.usuario._id;
    operador.vigenciaLicencia = body.vigenciaLicencia;
    operador.activo = body.activo;
    operador.usuarioMod = req.usuario._id;
    operador.fMod = new Date();

    if (operador.foto != body.foto) {
      if (variasBucket.MoverArchivoBucket('temp/', body.foto, 'operadores/')) {
        if (operador.foto != null && operador.foto != undefined && operador.foto != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('operadores/', operador.foto);
        }
        operador.foto = body.foto;
      }
    }


    if (operador.fotoLicencia != body.fotoLicencia) {
      if (variasBucket.MoverArchivoBucket('temp/', body.fotoLicencia, 'operadores/')) {
        if (operador.fotoLicencia != null && operador.fotoLicencia != undefined && operador.fotoLicencia != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('operadores/', operador.fotoLicencia);
        }
        operador.fotoLicencia = body.fotoLicencia;
      }
    }

    operador.save((err, operadorGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar al operador',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        operador: operadorGuardado
      });
    });
  });
});

// =======================================
// Actualizar Operador    HABILITAR DESHABILITAR
// =======================================

app.put('/operador/:id/habilita_deshabilita', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Operador.findById(id, (err, operador) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar al operador',
        errors: err
      });
    }
    if (!operador) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El operador con el id ' + id + ' no existe',
        errors: { message: 'No existe un operador con ese ID' }
      });
    }
    operador.activo = body.activo;
    operador.save((err, operadorGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar al operador',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        operador: operadorGuardado
      });
    });
  });
});

// ============================================
//  Borrar un operador por el id
// ============================================
app.delete('/operador/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Maniobra.find({ "operador": new mongoose.Types.ObjectId(id) })
    .exec(
      (err, maniobra) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al intentar validar la eliminacion del operador',
            errors: err
          });
        }
        if (maniobra && maniobra.length > 0) {
          return res.status(400).json({
            ok: false,
            mensaje: 'El operador ya tiene operaciones registradas, por lo tanto no puede eliminarse.',
            errors: { message: 'El operador ya tiene operaciones registradas, por lo tanto no puede eliminarse.' }
          });
        }
        Operador.findByIdAndRemove(id, (err, operadorBorrado) => {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al borrar el operador',
              errors: err
            });
          }
          if (!operadorBorrado) {
            return res.status(400).json({
              ok: false,
              mensaje: 'No existe un operador con ese id',
              errors: { message: 'No existe un operador con ese id' }
            });
          }
          variasBucket.BorrarArchivoBucket('clientes/', operadorBorrado.foto);
          variasBucket.BorrarArchivoBucket('clientes/', operadorBorrado.fotoLicencia);
          res.status(200).json({
            ok: true,
            operador: operadorBorrado
          });
        });
      });



});


module.exports = app;