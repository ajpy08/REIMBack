var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Naviera = require('../models/naviera');
var variasBucket = require('../public/variasBucket');
var app = express();

// ==========================================
// Obtener todas las navieras
// ==========================================

app.get('/', (req, res, next) => {
  var role = 'NAVIERA_ROLE';
  Naviera.find({ role: role })
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioMod', 'nombre email')
    .sort({ nombreComercial: 1 })
    .exec(
      (err, navieras) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar navieras',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          navieras: navieras,
          total: navieras.length
        });
      });
});


// ==========================================
//  Obtener Naviera por ID
// ==========================================
app.get('/naviera/:id', (req, res) => {
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
app.post('/naviera/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  
  var naviera = new Naviera({
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
    correo: body.correosF,
    correoFac: body.correoFac,
    credito: body.credito,
    caat: body.caat,
    img: body.img,
    usoCFDI: body.usoCFDI,
    usuarioAlta: req.usuario._id
  });

  variasBucket.MoverArchivoBucket('temp/', naviera.img, 'clientes/');
  variasBucket.MoverArchivoBucket('temp/', naviera.formatoR1, 'clientes/');


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
app.put('/naviera/:id', mdAutenticacion.verificaToken, (req, res) => {
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
    naviera.correo = body.correosF;
    naviera.correoFac = body.correoFac;
    naviera.credito = body.credito;
    naviera.caat = body.caat;
    naviera.usoCFDI = body.usoCFDI;
    naviera.usuarioMod = req.usuario._id;
    naviera.fMod = new Date();

    if (naviera.formatoR1 != body.formatoR1) {
      if (variasBucket.MoverArchivoBucket('temp/', body.formatoR1, 'clientes/')) {
        if (naviera.formatoR1 != null && naviera.formatoR1 != undefined && naviera.formatoR1 != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('clientes/', naviera.formatoR1);
        }
        naviera.formatoR1 = body.formatoR1;
      }
    }

    if (naviera.img != body.img) {
      if (variasBucket.MoverArchivoBucket('temp/', body.img, 'clientes/')) {
        if (naviera.img != null && naviera.img != undefined && naviera.img != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('clientes/', naviera.img);
        }
        naviera.img = body.img;
      }
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
app.delete('/naviera/:id', mdAutenticacion.verificaToken, (req, res) => {
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
    variasBucket.BorrarArchivoBucket('clientes/', navieraBorrado.img);
    variasBucket.BorrarArchivoBucket('clientes/', navieraBorrado.formatoR1);
    res.status(200).json({

      ok: true,
      naviera: navieraBorrado
    });
  });
});


module.exports = app;