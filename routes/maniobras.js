// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Maniobra = require('../models/maniobra');
var Mantenimiento = require('../models/mantenimiento');
var variasBucket = require('../public/variasBucket');
const sentMail = require('../routes/sendAlert');
var fileUpload = require('express-fileupload');
var uuid = require('uuid/v1');
app.use(fileUpload());
var varias = require('../public/varias');

const maniobrasController = require('../controllers/maniobrasController');

// =======================================
// Obtener Maniobras G E N E R A L
// =======================================
app.get('', mdAutenticacion.verificaToken, (req, res) => {
  var cargadescarga = req.query.cargadescarga || '';
  var estatus = req.query.estatus || '';
  var transportista = req.query.transportista || '';
  var contenedor = req.query.contenedor || '';
  var viaje = req.query.viaje || '';
  var peso = req.query.peso || '';
  var lavado = req.query.lavado || '';
  var reparacion = req.query.reparacion || '';
  var finillegada = req.query.finillegada || '';
  var ffinllegada = req.query.ffinllegada || '';
  var naviera = req.query.naviera || '';
  var cliente = req.query.cliente || '';

  var filtro = '{';
  if (cargadescarga != 'undefined' && cargadescarga != '')
    filtro += '\"cargaDescarga\":' + '\"' + cargadescarga + '\",';
  if (estatus != 'undefined' && estatus != '')
    filtro += '\"estatus\":' + '\"' + estatus + '\",';
  if (transportista != 'undefined' && transportista != '')
    filtro += '\"transportista\":' + '\"' + transportista + '\",';
  if (contenedor != 'undefined' && contenedor != '')
    filtro += '\"contenedor\":{ \"$regex\":' + '\".*' + contenedor + '\",\"$options\":\"i\"},';
  if (viaje != 'undefined' && viaje != '')
    filtro += '\"viaje\":' + '\"' + viaje + '\",';
  if (naviera != 'undefined' && naviera != '')
    filtro += '\"naviera\":' + '\"' + naviera + '\",';
  if (cliente != 'undefined' && cliente != '')
    filtro += '\"cliente\":' + '\"' + cliente + '\",';

  // if (peso != 'undefined' && peso != '')
  //   filtro += '\"peso\":' + '\"' + peso + '\",';
  peso = peso.replace(/,/g, '\",\"');

  if (peso != 'undefined' && peso != '')
    filtro += '\"peso\":{\"$in\":[\"' + peso + '\"]},';

  if (lavado === 'true') {
    filtro += '\"lavado\"' + ': {\"$in\": [\"A\", \"B\", \"E\"]},';
  }

  if (reparacion === 'true') {
    filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true},';
  }

  if (finillegada != '' && ffinllegada) {
    fIni = moment(finillegada, 'DD-MM-YYYY', true).utc().startOf('day').format();
    fFin = moment(ffinllegada, 'DD-MM-YYYY', true).utc().endOf('day').format();
    filtro += '\"fLlegada\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
  }

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  // console.log(json);
  Maniobra.find(json)
    .populate('cliente', 'rfc razonSocial nombreComercial')
    .populate('agencia', 'rfc razonSocial nombreComercial')
    .populate('transportista', 'rfc razonSocial nombreComercial')
    .populate('operador', 'nombre')
    .populate('camion', 'placa noEconomico')
    .populate('solicitud', 'folio blBooking rutaComprobante')
    .populate({
      path: "viaje",
      select: 'viaje fechaArribo fVigenciaTemporal pdfTemporal',

      populate: {
        path: "buque",
        select: 'nombre'
      },
      populate: {
        path: "naviera",
        select: 'nombreComercial'
      }
    })
    .populate({
      path: "viaje",
      select: 'viaje fVigenciaTemporal pdfTemporal',

      populate: {
        path: "buque",
        select: 'nombre'
      }
    })
    .populate('naviera', 'rfc razonSocial nombreComercial')
    .populate('usuarioAlta', 'nombre email')
    .sort({
      fAlta: -1
    })
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobras: maniobras,
        total: maniobras.length
      });
    });
});

// ==========================================
//  Obtener Maniobra por ID
// ==========================================
app.get('/maniobra/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Maniobra.findById(id)
    .populate('solicitud', 'blBooking')
    .populate('naviera', 'nombreComercial')
    .exec((err, maniobra) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar la maniobra',
          errors: err
        });
      }
      if (!maniobra) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La maniobra con el id ' + id + 'no existe',
          errors: {
            message: 'No existe maniobra con ese ID'
          }
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobra
      });
    });
});

// ==========================================
//  Envia Correo
// ==========================================
app.get('/maniobra/:id/enviacorreo', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Maniobra.findById(id)
    .populate('cliente', 'rfc razonSocial nombreComercial')
    .populate('agencia', 'rfc razonSocial nombreComercial correo')
    .populate('transportista', 'rfc razonSocial nombreComercial correo')
    .populate('solicitud', 'correo estatus tipo correo')
    .exec((err, maniobra) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar la maniobra',
          errors: err
        });
      }
      if (!maniobra) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La maniobra con el id ' + id + ' no existe',
          errors: {
            message: 'No existe maniobra con ese ID'
          }
        });
      } else {
        if (maniobra.solicitud.estatus === 'APROBADA') {
          var tipo = maniobra.solicitud.tipo == 'D' ? 'Descarga' : maniobra.solicitud.tipo == 'C' ? 'Carga' : 'TIPO';

          var cuerpoCorreo = `${maniobra.agencia.razonSocial} ha solicitado en nombre de ${maniobra.cliente.razonSocial} las siguientes ${tipo}s: 
            
        `;

          if (maniobra.folio) {
            cuerpoCorreo += `Folio: ${maniobra.folio} `;
          }
          if (maniobra.contenedor) {
            cuerpoCorreo += `Contenedor: ${maniobra.contenedor} `;
          }
          if (maniobra.tipo) {
            cuerpoCorreo += `Tipo: ${maniobra.tipo} `;
          }

          if (maniobra.grado) {
            cuerpoCorreo += `Grado: ${maniobra.grado} `;
          }

          if (maniobra.tipo === 'C') {
            cuerpoCorreo += 'http://reimcontainerpark.com.mx/#/solicitudes/solicitud_carga/' + maniobra.solicitud;
          } else if (maniobra.tipo === 'D') {
            cuerpoCorreo += 'http://reimcontainerpark.com.mx/#/solicitudes/solicitud_descarga/' + maniobra.solicitud;
          }
          cuerpoCorreo += `
      
        `;

          var correos = '';
          var error = '';
          if (maniobra.solicitud.correo === '' || maniobra.solicitud.correo === undefined) {
            error += 'Solicitud - '
          } else {
            correos += maniobra.solicitud.correo + ',';
          }

          if (maniobra.transportista.correo === '' || maniobra.transportista.correo === undefined) {
            error += 'Transportista - '
          } else {
            correos += maniobra.transportista.correo + ',';
          }

          // if (maniobra.agencia.correo === '' || maniobra.agencia.correo === undefined) {
          //   error += 'Agencia - '
          // } else { correos += maniobra.agencia.correo; }

          if (correos != null) {
            if (correos.endsWith(",")) {
              correos = correos.substring(0, correos.length - 1);
            }

            sentMail(maniobra.transportista.razonSocial, correos,
              'Solicitud de ' + tipo + ' Aprobada', cuerpoCorreo, 'emailAlert');

          } else {
            return res.status(500).json({
              ok: false,
              mensaje: 'No existe correo de destino',
              errors: err
            });
          }
        }
      }
      if (error != '' && error != undefined) {
        if (error.trim().endsWith("-")) {
          error = error.trim().substring(0, error.length - 3);
        }
      }

      var mensaje = '';
      if (error != '' && error != undefined && error.length > 0) {
        mensaje = 'No se enviará el correo a ' + error + ' por que no cuenta con correo y solo se enviará a ' + correos;
      } else {
        mensaje = 'Correo enviado a ' + correos;
      }

      res.status(200).json({
        ok: true,
        mensaje: mensaje,
        maniobra: maniobra
      });
    });
});

// =======================================
// Obtener Maniobras NAVIERA
// =======================================
app.get('/inventarioLR/', mdAutenticacion.verificaToken, (req, res) => {
  var naviera = req.query.naviera || '';
  var estatus = req.query.estatus || '';
  var transportista = req.query.transportista || '';
  var contenedor = req.query.contenedor || '';
  var viaje = req.query.viaje || '';
  var peso = req.query.peso || '';
  var lavado = req.query.lavado || '';
  var reparacion = req.query.reparacion || '';

  var naviera = req.query.naviera || '';
  var buque = req.query.buque || '';

  var filtro = '{';

  if (estatus != 'undefined' && estatus != '')
    filtro += '\"estatus\":' + '\"' + estatus + '\",';
  if (transportista != 'undefined' && transportista != '')
    filtro += '\"transportista\":' + '\"' + transportista + '\",';
  if (contenedor != 'undefined' && contenedor != '')
    filtro += '\"contenedor\":{ \"$regex\":' + '\".*' + contenedor + '\",\"$options\":\"i\"},';
  if (viaje != 'undefined' && viaje != '')
    filtro += '\"viaje\":' + '\"' + viaje + '\",';

  // if (peso != 'undefined' && peso != '')
  //   filtro += '\"peso\":' + '\"' + peso + '\",';
  peso = peso.replace(/,/g, '\",\"');

  if (peso != 'undefined' && peso != '')
    filtro += '\"peso\":{\"$in\":[\"' + peso + '\"]},';

  if (lavado === 'true') {
    filtro += '\"lavado\"' + ': {\"$in\": [\"A\", \"B\", \"E\"]},';
  }

  if (reparacion === 'true') {
    filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true},';
  }

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  var filtro2 = '{';

  if (buque != 'undefined' && buque != '') {
    filtro2 += '\"viaje.buque\":' + '\"' + buque + '\",';
  } else {
    if (naviera != 'undefined' && naviera != '' && naviera != null) {
      filtro2 += '\"naviera\":' + '\"' + naviera + '\",';
    }
  }

  //Sirve para el populate de abajo
  if (filtro2 != '{')
    filtro2 = filtro2.slice(0, -1);
  filtro2 = filtro2 + '}';
  var json2 = JSON.parse(filtro2);

  Maniobra.find(json)
    .populate('cliente', 'rfc razonSocial nombreComercial')
    .populate('agencia', 'rfc razonSocial nombreComercial')
    .populate('transportista', 'rfc razonSocial nombreComercial')
    .populate('operador', 'nombre')
    .populate('camion', 'placa noEconomico')
    .populate({
      path: "viaje",
      select: 'viaje buque naviera fechaArribo',
      match: json2,
      populate: {
        path: "naviera",
        select: 'razonSocial'
      },
      populate: {
        path: "buque",
        select: 'nombre'
      }
    })
    .populate('naviera', 'rfc razonSocial')
    .populate('usuarioAlta', 'nombre email')
    .sort({
      contenedor: 1
    })
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando maniobras',
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        maniobras: maniobras.filter(x => x.viaje != null),
        total: maniobras.filter(x => x.viaje != null).length
      });
    });
});


// ==========================================
//  Obtener Maniobra por ID CON INCLUDES

// ==============================================
app.get('/maniobra/:id/includes', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Maniobra.findById(id)
    .populate('operador', 'nombre foto')
    .populate('camion', 'placa noEconomico')
    .populate('operador', 'nombre licencia')
    .populate('cliente', 'razonSocial nombreComercial')
    .populate('solicitud', 'blBooking')
    .populate('agencia', 'razonSocial nombreComercial')
    .populate('buque', 'nombre')
    .populate('transportista', 'razonSocial nombreComercial')
    .populate('viaje', 'viaje')
    .populate('solicitud', 'viaje blBooking')
    .populate({
      path: "viaje",
      select: "viaje",
      populate: {
        path: "naviera",
        select: 'nombreComercial'
      }
    })
    .populate({
      path: "viaje",
      select: "viaje",
      populate: {
        path: "buque",
        select: "nombre"
      }
    })


    .exec((err, maniobra) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar la maniobra',
          errors: err
        });
      }
      if (!maniobra) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La maniobra con el id ' + id + 'no existe',
          errors: {
            message: 'No existe maniobra con ese ID'
          }
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobra
      });
    });
});

// =======================================
// Obtener maniobras que son VACIOS
// =======================================
app.get('/facturacion-vacios', mdAutenticacion.verificaToken, (req, res) => {
  var cargadescarga = req.query.cargadescarga || '';
  var viaje = req.query.viaje || '';
  var peso = req.query.peso || '';
  var lavado = req.query.lavado || '';
  var reparacion = req.query.reparacion || '';
  var sinFactura = req.query.sinFactura || '';
  var descargados = req.query.descargados || '';
  var yaLavados = req.query.yaLavados || '';

  var filtro = '{';
  if (cargadescarga != 'undefined' && cargadescarga != '')
    filtro += '\"cargaDescarga\":' + '\"' + cargadescarga + '\",';

  if (viaje != 'undefined' && viaje != '')
    filtro += '\"viaje\":' + '\"' + viaje + '\",';

  peso = peso.replace(/,/g, '\",\"');

  if (peso != 'undefined' && peso != '')
    filtro += '\"peso\":' + '\"' + peso + '\",';


  if (lavado === 'true') {
    filtro += '\"lavado\"' + ': {\"$in\": [\"E\", \"B\"]},';
  }

  if (reparacion === 'true') {
    filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true, \"$not\": {\"$size\": 0}},';
  } else {
    filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': false, \"$not\": {\"$size\": 0}},';
  }

  if (sinFactura === 'true') {
    filtro += '\"facturaManiobra\"' + ': {\"$exists\"' + ': false},';
  } else {
    filtro += '\"facturaManiobra\"' + ': {\"$exists\"' + ': true},';
  }

  if (descargados === 'true') {
    filtro += '\"hDescarga\"' + ': {\"$exists\"' + ': true},';
  } else {
    filtro += '\"hDescarga\"' + ': {\"$exists\"' + ': false},';
  }

  if (yaLavados === 'true') {
    filtro += '\"hFinLavado\"' + ': {\"$exists\"' + ': true},';
  } else {
    filtro += '\"hFinLavado\"' + ': {\"$exists\"' + ': false},';
  }

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  //console.log(json);
  Maniobra.find(json)
    .populate('cliente', 'rfc razonSocial nombreComercial')
    .populate('agencia', 'rfc razonSocial nombreComercial')
    .populate('transportista', 'rfc razonSocial nombreComercial')
    .populate('operador', 'nombre')
    .populate('solicitud', 'blBooking')
    .populate('camion', 'placa noEconomico')
    .populate('solicitud', 'viaje blBooking')
    .populate('viaje', 'buque nombre')
    .populate({
      path: "viaje",
      select: 'viaje fechaArribo',
      populate: {
        path: "buque",
        select: 'nombre'
      }
    })
    .populate('buque', 'nombre')
    .populate('usuarioAlta', 'nombre email')
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando Facturacion Maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobras: maniobras,
        total: maniobras.length
      });
    });
});


// =======================================
// Obtener maniobras que no incluyen VACIOS
// =======================================
app.get('/facturacion-maniobras', mdAutenticacion.verificaToken, (req, res) => {
  var cargadescarga = req.query.cargadescarga || '';
  var viaje = req.query.viaje || '';
  var peso = req.query.peso || '';
  var lavado = req.query.lavado || '';
  var reparacion = req.query.reparacion || '';
  var sinFactura = req.query.sinFactura || '';
  var descargados = req.query.descargados || '';
  var yaLavados = req.query.yaLavados || '';

  var filtro = '{';
  if (cargadescarga != 'undefined' && cargadescarga != '')
    filtro += '\"cargaDescarga\":' + '\"' + cargadescarga + '\",';

  if (viaje != 'undefined' && viaje != '')
    filtro += '\"viaje\":' + '\"' + viaje + '\",';

  peso = peso.replace(/,/g, '\",\"');

  if (peso != 'undefined' && peso != '')
    filtro += '\"peso\":{\"$ne\":\"' + peso + '\"},';


  if (lavado === 'true') {
    filtro += '\"lavado\"' + ': {\"$in\": [\"E\", \"B\"]},';
  }

  if (reparacion === 'true') {
    // filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true, \"$not\": {\"$size\": 0}},';
    filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true, \"$not\": {\"$size\": 0}},';
  } else {
    if (reparacion === 'false') {
      filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': false, \"$not\": {\"$size\": 0}},';
    }
  }

  if (sinFactura === 'true') {
    filtro += '\"facturaManiobra\"' + ': {\"$exists\"' + ': false},';
  } else {
    if (sinFactura === 'false') {
      filtro += '\"facturaManiobra\"' + ': {\"$exists\"' + ': true},';
    }
  }

  if (descargados === 'true') {
    filtro += '\"hDescarga\"' + ': {\"$exists\"' + ': true},';
  } else {
    if (descargados === 'false') {
      filtro += '\"hDescarga\"' + ': {\"$exists\"' + ': false},';
    }
  }

  if (yaLavados === 'true') {
    filtro += '\"hFinLavado\"' + ': {\"$exists\"' + ': true},';
  } else {
    if (yaLavados === 'false') {
      filtro += '\"hFinLavado\"' + ': {\"$exists\"' + ': false},';
    }
  }

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  //console.log(json);
  Maniobra.find(json)
    .populate('cliente', 'rfc razonSocial nombreComercial')
    .populate('agencia', 'rfc razonSocial nombreComercial')
    .populate('transportista', 'rfc razonSocial nombreComercial')
    .populate('operador', 'nombre')
    .populate('solicitud', 'blBooking')
    .populate('camion', 'placa noEconomico')
    .populate('solicitud', 'viaje blBooking')
    .populate('viaje', 'buque nombre')
    .populate({
      path: "viaje",
      select: 'viaje fechaArribo',
      populate: {
        path: "buque",
        select: 'nombre'
      }
    })
    .populate('buque', 'nombre')
    .populate('usuarioAlta', 'nombre email')
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando Facturacion Maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobras: maniobras,
        total: maniobras.length
      });
    });
});



// ============================================
// Obtener Maniobras que tuvieron lavado o reparacion (de alguna naviera o de todas las navieras)
// ============================================
app.get('/LR', mdAutenticacion.verificaToken, (req, res) => {
  var naviera = req.query.naviera || '';
  var buque = req.query.buque || '';
  var viaje = req.query.viaje || '';
  var fechaLlegadaInicio = req.query.fechaLlegadaInicio || '';
  var fechaLlegadaFin = req.query.fechaLlegadaFin || '';

  var filtro = '{';
  filtro += '\"$or\": [';
  filtro += '{\"lavado\"' + ': {\"$in\": [\"E\", \"B\"]} },';
  filtro += '{\"reparaciones.0\"' + ': {\"$exists\"' + ': true} }';
  filtro += '],';


  if (viaje != 'undefined' && viaje != '')
    filtro += '\"viaje\":' + '\"' + viaje + '\",';

  if (fechaLlegadaInicio != '' && fechaLlegadaInicio) {
    fIni = moment(fechaLlegadaInicio, 'DD-MM-YYYY', true).utc().startOf('day').format();
    fFin = moment(fechaLlegadaFin, 'DD-MM-YYYY', true).utc().endOf('day').format();
    filtro += '\"fLlegada\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
  }

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  var filtro2 = '{';


  if (buque != 'undefined' && buque != '') {
    filtro2 += '\"viaje.buque\":' + '\"' + buque + '\",';
  } else {
    if (naviera != 'undefined' && naviera != '') {
      filtro2 += '\"naviera\":' + '\"' + naviera + '\",';
    }
  }

  //Sirve para el populate de abajo
  if (filtro2 != '{')
    filtro2 = filtro2.slice(0, -1);
  filtro2 = filtro2 + '}';
  var json2 = JSON.parse(filtro2);

  Maniobra.find(
    json
  )
    .populate('cliente', 'rfc razonSocial nombreComercial')
    .populate('agencia', 'rfc razonSocial nombreComercial')
    .populate('transportista', 'rfc razonSocial nombreComercial')
    .populate('solicitud', 'viaje blBooking')
    .populate({
      path: 'viaje',
      select: 'viaje buque naviera',
      match: json2,
      populate: {
        path: "naviera",
        select: 'razonSocial'
      },
      populate: {
        path: "naviera",
        select: 'nombreComercial'
      },
      populate: {
        path: "buque",
        select: 'nombre'
      }
    })
    .populate('buque', 'nombre')
    .populate('naviera', 'rfc razonSocial')
    .populate('usuarioAlta', 'nombre email')
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        // maniobras: maniobras,
        // total: maniobras.length
        maniobras: maniobras.filter(x => x.viaje != null),
        total: maniobras.filter(x => x.viaje != null).length
      });
    });
});


app.get('/xviaje/:idviaje/importacion', mdAutenticacion.verificaToken, (req, res) => {
  //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
  var idViaje = req.params.idviaje;
  Maniobra.find({
    "viaje": idViaje,
    "peso": {
      $ne: 'VACIO'
    },
    "estatus": 'APROBACION'
  })
    .populate('cliente', 'rfc razonSocial nombreComercial')
    .populate('agencia', 'rfc razonSocial')
    .populate('transportista', 'rfc razonSocial nombreComercial')
    .populate('usuarioAlta', 'nombre email')
    .sort({
      contenedor: 1
    })
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobras: maniobras,
        total: maniobras.length
      });
    });
});





// ==========================================
// Subir fotos lavado o Reparacion de la maniobra
// ==========================================
app.put('/maniobra/:id/addimg/:LR', (req, res) => {

  var id = req.params.id;
  var LR = req.params.LR;

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No selecciono nada',
      errors: {
        message: 'Debe de seleccionar una imagen'
      }
    });
  }


  // Obtener nombre del archivo
  var archivo = req.files.file;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];
  var nombreArchivo = `${uuid()}.${extensionArchivo}`;
  var path = 'maniobras/' + id + '/' + LR + '/';

  variasBucket.SubirArchivoBucket(archivo, path, nombreArchivo)
    .then((value) => {
      if (value) {
        res.status(200).json({
          ok: true,
          mensaje: 'Archivo guardado!',
        });
      }
    });
});


// ETAPAS DE LA MANIOBRA EN EL PATIO

// =======================================
// 1   Registra LLegada Contendor
// =======================================
app.put('/maniobra/:id/registra_llegada', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  // if (body.transportista === undefined || body.transportista === '') {
  //   return res.status(400).json({
  //     ok: false,
  //     mensaje: 'Se debe declarar el transportista',
  //     errors: { message: 'Se debe declarar el transportista' }
  //   });
  // }
  // if (body.camion === undefined || body.camion === '') {
  //   return res.status(400).json({
  //     ok: false,
  //     mensaje: 'Se debe declarar el camion',
  //     errors: { message: 'Se debe declarar el camion' }
  //   });
  // }
  // if (body.operador === undefined || body.operador === '') {
  //   return res.status(400).json({
  //     ok: false,
  //     mensaje: 'Se debe declarar el operador',
  //     errors: { message: 'Se debe declarar el operador' }
  //   });
  // }
  if (body.fLlegada === undefined || body.fLlegada === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Se debe declarar la Fecha de Llegada',
      errors: {
        message: 'Se debe declarar la Fecha de Llegada'
      }
    });
  }
  if (body.hLlegada === undefined || body.hLlegada === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Se debe declarar la Hora de Llegada',
      errors: {
        message: 'Se debe declarar la Hora de Llegada'
      }
    });
  }
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: {
          message: 'No existe una maniobra con ese ID'
        }
      });
    }

    if (body.transportista !== undefined && body.transportista !== '') {
      maniobra.transportista = body.transportista;
    }
    if (body.camion !== undefined && body.camion !== '') {
      maniobra.camion = body.camion;
    }

    if (body.operador !== undefined && body.operador !== '') {
      maniobra.operador = body.operador;
    }

    maniobra.sello = body.sello;
    maniobra.fLlegada = body.fLlegada;
    maniobra.hLlegada = body.hLlegada;
    maniobra.estatus = "ESPERA";
    if (body.hEntrada) {
      maniobra.hEntrada = body.hEntrada;
      if (maniobra.cargaDescarga === 'C') {
        maniobra.estatus = "XCARGAR";
      } else {
        maniobra.estatus = "REVISION";
      }
    }

    maniobra.save((err, maniobraGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardado
      });
    });
  });
});

// =======================================
// Registra Lavado, reparaciones y descarga
// =======================================
app.put('/maniobra/:id/registra_descarga', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;


  Mantenimiento.find({
    maniobra: id,
    finalizado: false
  })
    .exec((err, mantenimientos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Ha habido un error al consultar los Mantenimientos.',
          errors: err
        });
      } else {
        if ((mantenimientos.length <= 0) && (body.grado === '' || body.grado === undefined)) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Si no hay lavados o reparaciones pendientes, DEBE ASIGNAR EL GRADO DEL CONTENEDOR',
            errors: {
              message: 'Si no hay lavado y reparación, DEBE ASIGNAR EL GRADO DEL CONTENEDOR'
            }
          });
        } else {

          Maniobra.findById(id, (err, maniobra) => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar maniobra',
                errors: err
              });
            }
            if (!maniobra) {
              return res.status(400).json({
                ok: false,
                mensaje: 'La maniobra con el id ' + id + ' no existe',
                errors: {
                  message: 'No existe una maniobra con ese ID'
                }
              });
            }
            maniobra.historial = body.historial;
            maniobra.sello = body.sello;
            maniobra.grado = body.grado;
            // if (maniobra.descargaAutorizada == true) {
            maniobra.hDescarga = body.hDescarga;
            maniobra.hSalida = body.hSalida;

            if (body.hDescarga !== '' && body.hDescarga !== undefined && body.hSalida !== '' && body.hSalida !== undefined)
              if (mantenimientos.length > 0)
                maniobra.estatus = "LAVADO_REPARACION";
              else
                maniobra.estatus = "DISPONIBLE";

            // }

            maniobra.save((err, maniobraGuardado) => {
              if (err) {
                return res.status(400).json({
                  ok: false,
                  mensaje: 'Error al actualizar la maniobra',
                  errors: err
                });
              }
              res.status(200).json({
                ok: true,
                maniobra: maniobraGuardado
              });
            });
          });
        }
      }
    });
});

// =======================================
// Registra FINALIZACION DE Lavado, reparaciones 
// =======================================
app.put('/maniobra/:id/registra_fin_lav_rep', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  if (body.lavado) {
    if (body.hIniLavado && (body.fIniLavado === undefined || body.fIniLavado === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar hora de Inicio de lavado si no ha asignado Fecha de Inicio',
        errors: {
          message: 'No se puede asignar hora de Inicio de lavado si no ha asignado Fecha de Inicio'
        }
      });
    }

    if (body.hFinLavado && (body.fIniLavado === undefined || body.fIniLavado === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar hora de finalización de lavado si no ha asignado Fecha de Inicio',
        errors: {
          message: 'No se puede asignar hora de finalización de lavado si no ha asignado Fecha de Inicio'
        }
      });
    }
  }

  if (body.reparaciones.length > 0) {
    if (body.hIniReparacion && body.hIniReparacion !== '' && (body.fIniReparacion === undefined || body.fIniReparacion === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar hora de Inicio de reparación si no ha asignado Fecha de Inicio',
        errors: {
          message: 'No se puede asignar hora de Inicio de reparación si no ha asignado Fecha de Inicio'
        }
      });
    }

    if (body.fFinReparacion && (body.hIniReparacion === undefined || body.hIniReparacion === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar Fecha de Finalización reparación si no ha asignado Hora de Inicio',
        errors: {
          message: 'No se puede asignar Fecha de Finalización reparación si no ha asignado Hora de Inicio'
        }
      });
    }

    if (body.hFinReparacion && (body.fFinReparacion === undefined || body.fFinReparacion === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar Hora de Finalización reparación si no ha asignado Fecha de Finalización',
        errors: {
          message: 'No se puede asignar hora de Inicio de reparación si no ha asignado Fecha de Finalización'
        }
      });
    }
  }

  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: {
          message: 'No existe una maniobra con ese ID'
        }
      });
    }

    maniobra.lavado = body.lavado;
    if (maniobra.lavado) {
      maniobra.lavadoObservacion = body.lavadoObservacion;
      maniobra.fIniLavado = body.fIniLavado;
      maniobra.hIniLavado = body.hIniLavado;
      maniobra.hFinLavado = body.hFinLavado;
    } else {
      maniobra.lavadoObservacion = undefined;
      maniobra.fIniLavado = undefined;
      maniobra.hIniLavado = undefined;
      maniobra.hFinLavado = undefined;
    }

    maniobra.reparaciones = body.reparaciones;

    if (maniobra.reparaciones.length > 0) {
      maniobra.reparacionesObservacion = body.reparacionesObservacion;
      maniobra.fIniReparacion = body.fIniReparacion;
      maniobra.hIniReparacion = body.hIniReparacion;
      maniobra.fFinReparacion = body.fFinReparacion;
      maniobra.hFinReparacion = body.hFinReparacion;
    } else {
      maniobra.reparacionesObservacion = body.reparacionesObservacion;
      maniobra.fIniReparacion = undefined;
      maniobra.hIniReparacion = undefined;
      maniobra.fFinReparacion = undefined;
      maniobra.hFinReparacion = undefined;
    }

    maniobra.grado = body.grado;
    maniobra.sello = body.sello;


    if (!maniobra.lavado && maniobra.reparaciones.length == 0 && maniobra.grado) {
      maniobra.estatus = "DISPONIBLE";
    }
    if (maniobra.lavado && maniobra.fIniLavado && maniobra.hFinLavado && maniobra.reparaciones.length > 0 && maniobra.fFinReparacion && maniobra.hFinReparacion && maniobra.grado) {
      maniobra.estatus = "DISPONIBLE";
    }
    if (maniobra.lavado && maniobra.fIniLavado && maniobra.hFinLavado && maniobra.reparaciones.length == 0 && maniobra.grado) {
      maniobra.estatus = "DISPONIBLE";
    }
    if (!maniobra.lavado && maniobra.reparaciones.length > 0 && maniobra.fFinReparacion && maniobra.hFinReparacion && maniobra.grado) {
      maniobra.estatus = "DISPONIBLE";
    }
    maniobra.save((err, maniobraGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardado
      });
    });
  });
});

// =======================================
// Registra Carga Contenedor
// =======================================
app.put('/maniobra/:id/carga_contenedor', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  var cambiaManiobraAsociada = false;
  var maniobraAsociadaTemporal = '';

  if (body.maniobraAsociada === '' || body.maniobraAsociada === undefined ||
    body.contenedor === '' || body.contenedor === undefined) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Debe asignar un contenedor de la lista de disponibles',
      errors: {
        message: 'Debe asignar un contenedor de la lista de disponibles'
      }
    });
  }

  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: {
          message: 'No existe una maniobra con ese ID'
        }
      });
    }
    if (body.maniobraAsociada != maniobra.maniobraAsociada) {
      maniobraAsociadaTemporal = maniobra.maniobraAsociada;
      if (body.maniobraAsociada !== '' && body.maniobraAsociada !== undefined) {
        maniobra.maniobraAsociada = body.maniobraAsociada;
        maniobra.contenedor = body.contenedor;
        maniobra.tipo = body.tipo;
        cambiaManiobraAsociada = true;
      }
    }
    maniobra.hDescarga = body.hDescarga;
    maniobra.hSalida = body.hSalida;
    maniobra.sello = body.sello;

    if (body.grado !== '' && body.grado !== undefined) {
      maniobra.grado = body.grado;
    }
    if (maniobra.hDescarga !== '' && maniobra.hDescarga !== undefined &&
      maniobra.hSalida !== '' && maniobra.hSalida !== undefined &&
      maniobra.maniobraAsociada !== '' && maniobra.maniobraAsociada !== undefined &&
      maniobra.contenedor !== '' && maniobra.contenedor !== undefined) {
      maniobra.estatus = "CARGADO";
    }

    maniobra.save((err, maniobraGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      if (cambiaManiobraAsociada === true) {
        Maniobra.updateOne({
          '_id': new mongoose.Types.ObjectId(maniobra.maniobraAsociada)
        }, {
          $set: {
            'estatus': 'CARGADO',
            'maniobraAsociada': maniobra._id
          }
        }, function (err) {
          if (err) {
            console.log(err);
          }
        });
        if (maniobraAsociadaTemporal !== '' && maniobraAsociadaTemporal !== undefined && maniobraAsociadaTemporal !== null) {
          Maniobra.updateOne({
            '_id': new mongoose.Types.ObjectId(maniobraAsociadaTemporal)
          }, {
            $set: {
              'estatus': 'DISPONIBLE',
              'maniobraAsociada': null
            }
          }, function (err) {
            if (err) {
              console.log(err);
            }
          });
        }
      }

      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardado
      });
    });
  });
});

// =======================================
// Aprobar descarga    HABILITAR DESHABILITAR
// =======================================
app.put('/maniobra/:id/aprueba_descarga', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar la maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: {
          message: 'No existe una maniobra con ese ID'
        }
      });
    }
    maniobra.descargaAutorizada = body.descargaAutorizada;

    maniobra.save((err, maniobraGuardada) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mensaje: 'Maniora Actualizada con éxito',
        maniobra: maniobraGuardada
      });
    });
  });
});


// =======================================
// Cambio de Grado..
// =======================================
app.put('/maniobra/:id/cambio_grado', mdAutenticacion.verificaToken, (req, res) => {
  const cambiaGradoManiobra = maniobrasController.updateGrado(req.params.id, req.body.grado);
  cambiaGradoManiobra.then(update => {
    if (update.nModified == 1) {
      return res.status(200).json({
        ok: true,
        mensaje: 'Grado actualizado con éxito.',
      });
    } else {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se realizo ningun cambio.',
        errors: 'No se realizo ningun cambio'
      });
    }
  }).catch(error => {
    return res.status(400).json({
      ok: false,
      mensaje: 'Error al actualizar el gradooo.',
      errors: error
    });
  });
});


// ============================================
// Obtener Maniobras que tuvieron lavado  (de alguna naviera o de todas las navieras)
// ============================================
app.get('/Lavado/Reparacion', mdAutenticacion.verificaToken, (req, res) => {
  var naviera = req.query.naviera || '';
  var buque = req.query.buque || '';
  var viaje = req.query.viaje || '';
  var fechaLlegadaInicio = req.query.fechaLlegadaInicio || '';
  var fechaLlegadaFin = req.query.fechaLlegadaFin || '';

  var LR = req.query.LR;


  var filtro = '{';
  //filtro += '\"$or\": [';
  // filtro += '{\"lavado\"' + ': {\"$in\": [\"E\", \"B\"]} },';
  // filtro += '{\"reparaciones.0\"' + ': {\"$exists\"' + ': true} }';
  // filtro += '],';
  if (LR === 'L') {
    filtro += '\"lavado\"' + ': {\"$in\": [\"E\", \"B\"]},'
  } else if (LR === 'R') {
    filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true},';
  }


  if (viaje != 'undefined' && viaje != '')
    filtro += '\"viaje\":' + '\"' + viaje + '\",';

  if (fechaLlegadaInicio != '' && fechaLlegadaInicio) {
    fIni = moment(fechaLlegadaInicio, 'DD-MM-YYYY', true).utc().startOf('day').format();
    fFin = moment(fechaLlegadaFin, 'DD-MM-YYYY', true).utc().endOf('day').format();
    filtro += '\"fLlegada\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
  }

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  var filtro2 = '{';


  if (buque != 'undefined' && buque != '') {
    filtro2 += '\"viaje.buque\":' + '\"' + buque + '\",';
  } else {
    if (naviera != 'undefined' && naviera != '') {
      filtro2 += '\"naviera\":' + '\"' + naviera + '\",';
    }
  }

  //Sirve para el populate de abajo
  if (filtro2 != '{')
    filtro2 = filtro2.slice(0, -1);
  filtro2 = filtro2 + '}';
  var json2 = JSON.parse(filtro2);

  Maniobra.find(
    json
  )
    .populate('cliente', 'rfc razonSocial nombreComercial')
    .populate('agencia', 'rfc razonSocial nombreComercial')
    .populate('transportista', 'rfc razonSocial nombreComercial')
    .populate({
      path: 'viaje',
      select: 'viaje buque naviera',
      match: json2,
      populate: {
        path: "naviera",
        select: 'nombreComercial'
      }
    })
    .populate('naviera', 'rfc nombreComercial')
    .populate('usuarioAlta', 'nombre email')
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        // maniobras: maniobras,
        // total: maniobras.length
        maniobras: maniobras.filter(x => x.viaje != null),
        total: maniobras.filter(x => x.viaje != null).length
      });
    });
});

// ==========================================
// Migracion de Maniobras
// ==========================================
// app.get('/migracion/maniobras/mantenimientos', mdAutenticacion.verificaToken, (req, res) => {

//   const token = req.query.token;

//   let mantenimientosLavado = [];
//   let mantenimientosReparacion = [];

//   Maniobra.find()
//     // .limit(58)
//     .sort({ fAlta: -1 })
//     .exec((err, maniobras) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'Error al cargar maniobras',
//           errors: err
//         });
//       }

//       maniobras.forEach(m => {
//         /* #region  REPARACIONES */

//         if (m.reparaciones && m.reparaciones.length > 0) {
//           let observaciones = '';
//           let mantenimiento = new Mantenimiento();
//           mantenimiento.tipoMantenimiento = 'REPARACION';

//           m.reparaciones.forEach(r => {
//             observaciones += r.reparacion + '; ';
//           });

//           if (observaciones.toLowerCase().includes('acondicionamiento') || observaciones.toLowerCase().includes('grado')) {
//             mantenimiento.tipoMantenimiento = 'ACONDICIONAMIENTO';
//             if (observaciones.toLowerCase().includes('cambio de grado')) {
//               mantenimiento.cambioGrado = true;
//             } else {
//               mantenimiento.cambioGrado = false;
//             }
//           }

//           let fechas = [];
//           let finalizado = false;

//           let fecha = {};

//           fecha.fIni = m.fIniReparacion;
//           fecha.hIni = m.hIniReparacion;
//           fecha.fFin = m.fFinReparacion;
//           fecha.hFin = m.hFinReparacion;


//           const f = new Date();
//           f.setDate(fecha.fFin);
//           f.setHours(fecha.hFin);
//           if (fecha.fFin && fecha.hFin && moment.isDate(f)) {
//             finalizado = true;
//           }

//           if (fecha.fIni) {
//             fechas.push(fecha);
//           }

//           mantenimiento.materiales = undefined;

//           mantenimiento.maniobra = m._id;

//           mantenimiento.observacionesGenerales = observaciones.substring(0, observaciones.length - 2);
//           mantenimiento.fechas = fechas;
//           mantenimiento.finalizado = finalizado;
//           finalizado ? mantenimiento.fFinalizado = fecha.fFin : undefined;
//           mantenimiento.migrado = true;

//           mantenimientosReparacion.push(mantenimiento);

//         }
//         /* #endregion */

//         /* #region  LAVADO */
//         if (m.lavado) {
//           let mantenimiento = new Mantenimiento();
//           mantenimiento.tipoMantenimiento = 'LAVADO';

//           if (m.lavado == 'E') {
//             mantenimiento.tipoLavado = 'ESPECIAL';
//           } else if (m.lavado == 'B') {
//             mantenimiento.tipoLavado = 'BASICO';
//           }

//           let fechas = [];
//           let finalizado = false;

//           let fecha = {};

//           fecha.fIni = m.fIniLavado;
//           fecha.hIni = m.hIniLavado;
//           fecha.fFin = m.fIniLavado;
//           fecha.hFin = m.hFinLavado;


//           const f = new Date();
//           f.setDate(fecha.fFin);
//           f.setHours(fecha.hFin);
//           if (fecha.fFin && fecha.hFin && moment.isDate(f)) {
//             finalizado = true;
//           }

//           if (fecha.fIni) {
//             fechas.push(fecha);
//           }

//           mantenimiento.materiales = undefined;

//           mantenimiento.maniobra = m._id;

//           mantenimiento.observacionesGenerales = m.lavadoObservacion;
//           mantenimiento.fechas = fechas;
//           mantenimiento.finalizado = finalizado;
//           finalizado ? mantenimiento.fFinalizado = fecha.fFin : undefined;
//           mantenimiento.migrado = true;

//           mantenimientosLavado.push(mantenimiento);

//         }
//         /* #endregion */
//       });

//       if (mantenimientosLavado.length > 0) {
//         const start = async () => {
//           await varias.asyncForEach(mantenimientosLavado, async (man) => {
//             let mantenimiento = new Mantenimiento({
//               maniobra: man.maniobra,
//               tipoMantenimiento: man.tipoMantenimiento,
//               tipoLavado: man.tipoLavado,
//               // cambioGrado: man.cambioGrado,
//               observacionesGenerales: man.observacionesGenerales,
//               // izquierdo: man.izquierdo,
//               // derecho: man.derecho,
//               // frente: man.frente,
//               // posterior: man.posterior,
//               // piso: man.piso,
//               // techo: man.techo,
//               // interior: man.interior,
//               // puerta: man.puerta,
//               fechas: man.fechas,
//               materiales: man.materiales,
//               finalizado: man.finalizado,
//               fFinalizado: man.fFinalizado,
//               migrado: man.migrado,
//               // usuarioAlta: req.usuario._id
//             });
//             const manL = await mantenimiento.save();
//           });
//         };
//         start();

//       }

//       if (mantenimientosReparacion.length > 0) {
//         const start = async () => {
//           await varias.asyncForEach(mantenimientosReparacion, async (man) => {
//             let mantenimiento = new Mantenimiento({
//               maniobra: man.maniobra,
//               tipoMantenimiento: man.tipoMantenimiento,
//               tipoLavado: man.tipoLavado,
//               cambioGrado: man.cambioGrado,
//               observacionesGenerales: man.observacionesGenerales,
//               // izquierdo: man.izquierdo,
//               // derecho: man.derecho,
//               // frente: man.frente,
//               // posterior: man.posterior,
//               // piso: man.piso,
//               // techo: man.techo,
//               // interior: man.interior,
//               // puerta: man.puerta,
//               fechas: man.fechas,
//               materiales: man.materiales,
//               finalizado: man.finalizado,
//               fFinalizado: man.fFinalizado,
//               migrado: man.migrado,
//               // usuarioAlta: req.usuario._id
//             });
//             const manR = await mantenimiento.save();
//           });
//         };
//         start();

//       }

//       res.status(200).json({
//         ok: true,
//         mantenimientosLavado: mantenimientosLavado,
//         mantenimientosReparacion: mantenimientosReparacion,
//         totalMantenimientosLavado: mantenimientosLavado.length,
//         totalMantenimientosReparacion: mantenimientosReparacion.length
//       });
//     });
// });

module.exports = app;