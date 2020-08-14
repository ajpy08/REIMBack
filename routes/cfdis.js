var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var DATOS = require('../config/config').DATOS
var KEYS = require('../config/config').KEYS
var app = express();
var fs = require('fs');
const path = require('path');
var soap = require('soap');
var funcion = require('../routes/fuctions');
var moment = require('moment');
var CFDIS = require('../models/facturacion/cfdi');
var CONTADOR = require('../models/contador');
const CFDI = require('@alexotano/cfdi33').CFDI
const Emisor = require('@alexotano/cfdi33').Emisor
const Impuestos = require('@alexotano/cfdi33').Impuestos
const Receptor = require('@alexotano/cfdi33').Receptor
const Concepto = require('@alexotano/cfdi33').Concepto
const Traslado = require('@alexotano/cfdi33').Traslado
const Addenda = require('@alexotano/cfdi33').Addenda
const Retencion = require('@alexotano/cfdi33').Retencion
const ImpTraslado = require('@alexotano/cfdi33').ImpTraslado
const ImpRetencion = require('@alexotano/cfdi33').ImpRetencion
// const parser = require('xml2json');
var xml2js = require('xml2js').parseString;
var QRCode = require('qrcode');
const Complemento = require('@alexotano/cfdi33').Complemento;
var Maniobra = require('../models/maniobra');
var variasBucket = require('../public/variasBucket');
const { Route53Resolver } = require('aws-sdk');
const contador = require('../models/contador');
const https = require('https');
let cfdiXML;
var options = {
  object: true,
  sanitize: true,
  trim: true,
  // arrayNotation: true,
  alternateTextNode: true
}


// ==========================================
// Obtener todos los CFDIS
// ==========================================
app.get('/', mdAutenticacion.verificaToken, (req, res, next) => {
  var serie = req.query.serie || '';
  var metodoPago = req.query.metodoPago || '';

  var filtro = '{';
  if (serie != 'undefined' && serie != '')
    filtro += '\"serie\":' + '\"' + serie + '\",';
  if (metodoPago != 'undefined' && metodoPago != '')
    filtro += '\"metodoPago\":' + '\"' + metodoPago + '\",';

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  CFDIS.find(json)
    // .populate('claveSAT', 'claveProdServ descripcion')
    // .populate('unidadSAT', 'claveUnidad nombre')
    .sort({ serie: 1, folio: 1 })
    .exec((err, cfdis) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar CFDIs',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        cfdis: cfdis,
        total: cfdis.length
      });
    });
});

// ==========================================
// Obtener CFDIS TIMBRADOS Y SIN TIMBRAR
// ==========================================
app.get('/T_ST/:timbres', mdAutenticacion.verificaToken, (req, res, next) => {
  let timbres = req.query.timbre || '';
  if (timbres === '') {
    timbres = 'false';
  }
  let filtro = '{';

  if (timbres !== '' && timbres !== 'undefined') {
    filtro += '\"uuid\":{\"$exists\":' + '\"' + timbres + '\"}' + '}';
  }
  var json = JSON.parse(filtro);

  CFDIS.find(json).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar cfdis Timbrados/sin Timbrar',
        errors: { message: 'Error al buscar cfdis Timbrados/sin Timbrar' }
      });
    }
    res.status(200).json({
      ok: true,
      cfdi_T_sT: data,
      total: data.length
    });
  });

})
// ==========================================
//  Obtener CFDI por ID
// ==========================================
app.get('/cfdi/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  CFDIS.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, cfdi) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el cfdi',
          errors: err
        });
      }
      if (!cfdi) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El CFDI con el id ' + id + 'no existe',
          errors: { message: 'No existe un CFDI con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        cfdi: cfdi,
        NoCertificadoEmisor: DATOS.NoCertificado,
      });
    });
});

// ==========================================
// Obtener CFDI con UUID
// ==========================================
app.get('/uuid/:uuid', mdAutenticacion.verificaToken, (req, res, next) => {
  let uuid = req.query.uuid || '';

  let filtro = '{';

  if (uuid != 'undefined' && uuid != '')
    filtro += '\"uuid\":' + '\"' + uuid + '\",';

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  CFDIS.findOne(json).exec((err, cfdi) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar cfdi con UUID',
        errors: { message: 'Error al buscar cfdi con UUID' }
      });
    }
    res.status(200).json({
      cfdi
    });
  });
});

// ==========================================
//  VALIDAR SI NO EXISTE MANIOBRA Y CONCEPTO YA AGREGADOS EN LA BD 
// ==========================================

app.get('/cfdis/Maniobra/Concepto/:maniobra&:concepto/', mdAutenticacion.verificaToken, (req, res) => {
  var maniobra_ID = req.params.maniobra;
  var concepto_ID = req.params.concepto;

  CFDIS.find({ 'conceptos.maniobras': { $eq: maniobra_ID }, 'conceptos._id': { $eq: concepto_ID } }).exec((err, maniobrasConcepto) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar Maniobra ' + maniobra_ID + 'y concepto ' + concepto_ID,
        errors: { message: 'Error al buscar Maniobra ' + maniobra_ID + 'y concepto' + concepto_ID, }
      });
    }
    if (!maniobra_ID && !concepto_ID) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra ' + maniobra_ID + ' y conceptos ' + concepto_ID + ' no existen',
        errors: { message: 'La maniobra ' + maniobra_ID + ' y conceptos ' + concepto_ID + ' no existen' }
      });
    }
    res.status(200).json({
      ok: true,
      maniobrasConceptos: maniobrasConcepto
    });
  });
});

// ==========================================
// Crear nuevo CFDI
// ==========================================
app.post('/cfdi/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  let respuesta = [];
  let cenceptoCFDI = [];
  if (body.informacionAdicional === '@') {
    body.informacionAdicional = '';
  }
  var cfdi = new CFDIS({
    fecha: body.fecha,
    folio: body.folio,
    formaPago: body.formaPago,
    // lugarExpedicion: body.lugarExpedicion,
    metodoPago: body.metodoPago,
    moneda: body.moneda,
    serie: body.serie,
    subtotal: body.subtotal,
    tipoComprobante: body.tipoComprobante,
    total: body.total,
    // version:  body.version,
    // noCertificado: body.noCertificado,
    // sello: body.sello,
    // certificado: body.certificado,

    // nombreEmisor: body.certificado,
    // regimenFiscal: body.regimenFiscal,
    // rfcEmisor: body.rfcEmisor,

    nombre: body.nombre,
    rfc: body.rfc,
    informacionAdicional: body.informacionAdicional,
    usoCFDI: body.usoCFDI,
    direccion: body.direccion,
    correo: body.correo,
    conceptos: body.conceptos,
    totalImpuestosRetenidos: body.totalImpuestosRetenidos,
    totalImpuestosTrasladados: body.totalImpuestosTrasladados,
    sucursal: body.sucursal,
    fechaEmision: moment().format('YYYY-MM-DD HH:mm:ss'),
    usuarioAlta: req.usuario._id
  });

  function maniobraCfdi() {  //! ESTA FUNCION SIRVE PARA BORRAR LOS ID DE MANIOBRAS REPETIDO
    let maniobra = [];
    body.conceptos.forEach(c => {
      c.maniobras.forEach(m => {
        maniobra.push({ maniobras: m._id, productoSer: c._id, cfdi: cfdi._id });
      });
    });
    maniobra = new Set(maniobra);
    return maniobra
  }

  async function agregacion() {
    respuesta = await maniobraCfdi();

  }

  agregacion().then(() => {

    respuesta.forEach(async m => {
      let concepto_CFDI = [];
      concepto_CFDI.push(m.productoSer, m.cfdi)
      Maniobra.update({ "_id": m.maniobras }, { $push: { 'cfdisAsociados': { $each: [{ 'id_Concepto': m.productoSer, 'id_Cfdi': m.cfdi }] } } }, (err, maniobra) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al agregar cfdi asociado en la Maniobra' + maniobra,
            errors: { message: 'Error al agregar cfdi asociado en la Maniobra' + maniobra }
          })
        }
        if (!maniobra) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar maniobra asociada',
            errors: { message: 'Error al buscar maniobra asociada' }
          });
        }
      });
      // // Maniobra.updateMany({ "_id": m.maniobras }, { $push: { 'cfdisAsociados.id_Concepto': { $each: [cfdi._id] } }}, {$push: {'cfdisAsociados.id_Cfdi': { $each:[body.conceptos]}}}, (err, maniobra) => { //! AQUI SE AGREGAN EN EL CAMPO CFDISASOCIADOS LOS ID DE LAS MANIBRAS 
    });
  });

  cfdi.save((err, cfdiGuardado) => {
    var Time_Emision = moment
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear el CFDI',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      cfdi: cfdiGuardado,

    });
  });
});

// ==========================================
// Actualizar CFDI
// ==========================================
app.put('/cfdi/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  CFDIS.findById(id, (err, cfdi) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el CFDI',
        errors: err
      });
    }
    if (!cfdi) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El CFDI con el id ' + id + ' no existe',
        errors: { message: 'No existe CFDI con ese ID' }
      });
    }

    cfdi.fecha = body.fecha,
      cfdi.folio = body.folio,
      cfdi.formaPago = body.formaPago,
      cfdi.metodoPago = body.metodoPago,
      cfdi.moneda = body.moneda,
      cfdi.serie = body.serie,
      cfdi.subtotal = body.subtotal,
      cfdi.tipoComprobante = body.tipoComprobante,
      cfdi.total = body.total,
      cfdi.nombre = body.nombre,
      cfdi.rfc = body.rfc,
      cfdi.usoCFDI = body.usoCFDI,
      cfdi.direccion = body.direccion,
      cfdi.correo = body.correo,
      cfdi.informacionAdicional = body.informacionAdicional,
      cfdi.conceptos = body.conceptos,
      cfdi.totalImpuestosRetenidos = body.totalImpuestosRetenidos,
      cfdi.totalImpuestosTrasladados = body.totalImpuestosTrasladados,
      cfdi.sucursal = body.sucursal,
      cfdi.usuarioMod = req.usuario._id;
    cfdi.fMod = new Date();

    cfdi.save((err, cfdiGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el CFDI',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        cfdi: cfdiGuardado
      });
    });
  });
});

// ============================================
//   Borrar CFDI por ID
// ============================================
app.delete('/cfdi/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  //! DESCOMENTAR PARA PASE A PRODUCCION ( OPCIONAL -> YA QUE SE VA A DESACTIVAR DESDEL DEL FRONT)
  // CFDIS.findById(id, (err, valcfdi) => {
  //   if (err || !valcfdi) {
  //     return res.status(404).json({
  //       ok: false,
  //       mensaje: 'Error al validar si esta timbrado el cfdi',
  //       errors: {message: 'Error al validar si esta timbrado el cfdi'}
  //     });
  //   }
  //   if (valcfdi.uuid) {
  //     return res.status(400).json({
  //       ok: false,
  //       mensaje: `Error al borrar el cfdi ${valcfdi.serie} - ${valcfdi.folio}, ya que se encuentra TIMBRADO`,
  //       errors:{ message: `Error al borrar el cfdi ${valcfdi.serie} - ${valcfdi.folio}, ya que se encuentra TIMBRADO`}
  //     });
  //   } else {
  //     Maniobra.updateMany({ 'cfdisAsociados': id }, { $pull: { 'cfdisAsociados': id } }, (err) => {
  //       if (err) {
  //         return res.status(400).json({
  //           ok: false,
  //           mensaje: 'Error al borrar CFDi Asociado con el id ' + id,
  //           errors: { message: 'Error al borrar CFDi Asociado con el id ' + id }
  //         });
  //       } else {

  //         CFDIS.findByIdAndRemove(id, (err, cfdiBorrado) => {
  //           if (err) {
  //             return res.status(500).json({
  //               ok: false,
  //               mensaje: 'Error al borrar CFDI',
  //               errors: err
  //             });
  //           }
  //           if (!cfdiBorrado) {
  //             return res.status(400).json({
  //               ok: false,
  //               mensaje: 'No existe CFDI con ese ID',
  //               errors: { message: 'No existe CFDI con ese ID' }
  //             });
  //           }
  //           res.status(200).json({
  //             ok: true,
  //             cfdi: cfdiBorrado
  //           });
  //         });
  //       }
  //     });
  //   }
  // });

  Maniobra.updateMany({ 'cfdisAsociados.id_Cfdi': id }, { $pull: { 'cfdisAsociados': { 'id_Cfdi': id } } }, (err) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al borrar CFDi Asociado con el id ' + id,
        errors: { message: 'Error al borrar CFDi Asociado con el id ' + id }
      });
    } else {
      CFDIS.findByIdAndRemove(id, (err, cfdiBorrado) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar CFDI',
            errors: err
          });
        }
        if (!cfdiBorrado) {
          return res.status(400).json({
            ok: false,
            mensaje: 'No existe CFDI con ese ID',
            errors: { message: 'No existe CFDI con ese ID' }
          });
        }
        res.status(200).json({
          ok: true,
          cfdi: cfdiBorrado
        });
      });
    }
  });
});

// ==========================================
// XML CFDI SIN TIMBRAR 
// ==========================================
app.get('/cfdi/:id/xml/', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  CFDIS.findById(id, (err, cfdi) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar CFDI',
        errors: err
      });
    }
    if (!cfdi) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El CFDI con el id ' + id + 'no existe',
        errors: { message: 'No existe un CFDI con ese ID' }
      });
    }
    const fecha = moment(cfdi.fecha).format('YYYY-MM-DDTHH:mm:ss');
    // var total = funcion.cortado(cfdi.total, 6);
    // const subTotal = funcion.cortado(cfdi.subtotal, 2);


    let des = 0;
    for (const c of cfdi.conceptos) {
      let number = parseFloat(c.descuento);
      des = des + number
    }

    cfdiXML = new CFDI({
      'Fecha': fecha,
      'Folio': cfdi.folio,
      'FormaPago': cfdi.formaPago,
      'LugarExpedicion': DATOS.LugarExpedicion,
      'MetodoPago': cfdi.metodoPago,
      'Moneda': cfdi.moneda,
      'Serie': cfdi.serie,
      'SubTotal': cfdi.subtotal,
      'TipoDeComprobante': cfdi.tipoComprobante,
      'Total': cfdi.total,
      'Descuento': des,
      'NoCertificado': DATOS.NoCertificado,
    });

    cfdiXML.key = KEYS.key
    cfdiXML.cer = KEYS.cer
    cfdiXML.withOutCerts = false

    cfdiXML.add(new Emisor({
      'Nombre': DATOS.Emisor_Nombre,
      'RegimenFiscal': DATOS.Emisor_RegimenFiscal,
      'Rfc': DATOS.Emisor_RFC,
    }));

    cfdiXML.add(new Receptor({
      'Nombre': cfdi.nombre,
      'Rfc': cfdi.rfc,
      'UsoCFDI': cfdi.usoCFDI
    }));



    for (const c of cfdi.conceptos) {
      let Importe = funcion.splitEnd(c.importe);
      const concepto = new Concepto({
        'Cantidad': c.cantidad,
        'ClaveProdServ': c.claveProdServ,
        'ClaveUnidad': c.claveUnidad,
        'Descripcion': c.descripcion,
        'Importe': c.importe,
        'NoIdentificacion': c.noIdentificacion,
        'ValorUnitario': c.valorUnitario,
        'Descuento': c.descuento
      });


      for (const im of c.impuestos) {
        var tasaOCuota = funcion.punto(im.tasaCuota);

        if (im.TR === 'TRASLADO') {
          concepto.add(new Traslado({
            'Base': Importe,
            'Importe': im.importe,
            'Impuesto': im.impuesto,
            'TasaOCuota': tasaOCuota,
            'TipoFactor': im.tipoFactor,
          }));
          // cfdiXML.add(concepto);
        } else if (im.TR === 'RETENCION') {
          var importeR = funcion.splitEnd(im.importe);
          concepto.add(new Retencion({
            'Base': Importe,
            'Importe': importeR,
            'Impuesto': im.impuesto,
            'TasaOCuota': tasaOCuota,
            'TipoFactor': im.tipoFactor,
          }));
        }

      }
      cfdiXML.add(concepto);
    }
    const totalimp = new Impuestos({
      'TotalImpuestosRetenidos': cfdi.totalImpuestosRetenidos,
      'TotalImpuestosTrasladados': cfdi.totalImpuestosTrasladados
    });

    let tasaOCuotaR = ''
    for (const imp of cfdi.conceptos) {
      for (const im of imp.impuestos) {
        if (im.TR !== 'RETENCION') {
          tasaOCuotaR = funcion.punto(im.tasaCuota);
        }
        if (im.TR === 'TRASLADO') {
          totalimp.add(new ImpTraslado({
            'Importe': cfdi.totalImpuestosTrasladados,
            'Impuesto': im.impuesto,
            'TasaOCuota': tasaOCuotaR,
            'TipoFactor': im.tipoFactor,

          }));

        } if (im.TR != 'RETENCION') {
          const imp = im.impuesto;
          let totalImpuestosRetenidos = funcion.splitStart(cfdi.totalImpuestosRetenidos);
          totalimp.add(new ImpRetencion({
            'Importe': totalImpuestosRetenidos,
            'Impuesto': imp
          }));
        }
      }
      totalimp.nodes.reverse()
      cfdiXML.add(totalimp);
      break
    }

    var RouteFolder = path.resolve(__dirname, `../archivosTemp/`)
    var folderexist = fs.existsSync(RouteFolder);
    if (folderexist === false) {
      fs.mkdirSync(RouteFolder)
    }
    var nombre = `${cfdi.serie}-${cfdi.folio}-${cfdi._id}.xml`;
    var Route = path.resolve(__dirname, `../archivosTemp/${nombre}`);

    var xmlT = [];
    cfdiXML.getXml().then(xml => fs.writeFile(Route, xml, (err) => {
      if (err) {
        console.log('error al crear archivo XML Temporal');
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al crear archivo XML Temportal',
          errors: { message: 'Error al crear archivo XML Temportal' }
        });

      } else {
        console.log('Archivo Temportal Guardado');
        const xmlSinT = xml2js(xml, function (err, data) {

          xmlT = data
        });
        return res.status(200).json({
          ok: true,
          rutaArchivo: Route,
          NombreArchivo: nombre,
          cfdiXMLsinTimbrar: xmlT,
          cfdiData: cfdi
        });
      }
    }))
      .catch(e => console.log(e.toString(), '---> OCURRIO UN ERROR AL CREAR EL XML del CFDI ' + `${nombre}`));

  });
});


// ==========================================
// TIMBRAR XML Y GENERAL CADENA ORIGINAL COMPLEMENTO 
// ==========================================
app.get('/timbrado/:nombre&:id&:direccion&:info/', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var nombre = req.params.nombre;
  let direccion = req.params.direccion;
  let info = req.params.info || '';
  var Route = path.resolve(__dirname, `../archivosTemp/${nombre}`);
  xml = fs.readFileSync(Route, 'utf8');

  var url = KEYS.URL_TIM_DES,
    key = KEYS.API_KEY,
    args = {
      key: key,
      cfdi: xml
    };

  soap.createClient(url, (errC, cliente) => {
    if (errC) {
      funcion.CorreoFac('Error al conectar con Web Services Timbrado' + errC, nombre, 1, 'Error al conectar con Web Services Timbrado');
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al conectar con Web Services Timbrado, validar LOG..',
        errors: { message: 'Error al conectar con Web Services Timbrado, validar LOG..' }
      });
    }

    cliente.timbrar(args, (errT, result) => {
      if (errT) {
        funcion.CorreoFac('Se produjo un error al Timbrar' + result.return.Message.$value, nombre, 1, result.return.Code.$value + ' - ' + result.return.Message.$value)
        return res.status(400).json({
          ok: false,
          mensaje: `Code: (${result.return.Code.$value}) - Mensaje: ${result.return.Message.$value}`,
          errors: { message: `Code: (${result.return.Code.$value}) - Mensaje: ${result.return.Message.$value}` }
        });
      }

      if (result.return === undefined) {
        funcion.CorreoFac('No se obtuvo respuesta del provedor de servicio', nombre, 1, 'No se obtuvo respuesta del provedor de servicios de timbrado');
        return res.status(500).json({
          ok: false,
          mensaje: 'No hay respuesta de timbrado',
          errors: { message: 'No hay respuesta del provedor de timbrado' }
        });
      }

      if (result.return.Code.$value === "200") {
        RespuestaTimbre(result)
        return ok = true
      } else if (result.return.Code.$value === "307") {
        RespuestaTimbre(result)
        return ok = true
      } else {
        if ((result.return.Code.$value != "200") || (result.return.Code.$value != "307")) {
          funcion.CorreoFac(result.return.Code.$value + ' - ' + result.return.Message.$value, nombre, '1', result.return.Message.$value)
          return res.status(400).json({
            ok: false,
            mensaje: `Code: (${result.return.Code.$value}) - Mensaje: ${result.return.Message.$value}`,
            errors: { message: `Code: (${result.return.Code.$value}) - Mensaje: ${result.return.Message.$value}` }
          });
        }

      }
    });
  });

  function RespuestaTimbre(result) {
    var respuesta = []
    xml2js(result.return.Timbre.$value, function (err, data) {
      respuesta = data[Object.keys(data)];
    });
    Object.getOwnPropertyNames(respuesta).forEach(function (val) {
      const complemento = new Complemento({
        'xmlns:tdf': 'http://www.sat.gob.mx/TimbreFiscalDigital',
        'xsi:schemaLocation': 'http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd',
        'Version': respuesta[val].Version,
        'FechaTimbrado': respuesta[val].FechaTimbrado,
        'SelloCFD': respuesta[val].SelloCFD,
        'UUID': respuesta[val].UUID,
        'NoCertificadoSAT': respuesta[val].NoCertificadoSAT,
        'RfcProvCertif': respuesta[val].RfcProvCertif,
        'SelloSAT': respuesta[val].SelloSAT
      });

      cfdiXML.add(complemento);
    });

    if (info !== '@') {
      const addenda = new Addenda({
        'xmlns:REIM': 'http://reimcontainerpark.com.mx',
        'xsi:schemaLocation': 'http://reimcontainerpark.com.mx/REIM_adicionales.xsd',
        'Version': '1.0',
        'InformacionAdicional': info,
        'ReceptorDireccion': direccion,
        'EmisorDireccion': DATOS.Direccion
      });
      cfdiXML.add(addenda);
    }




    var TRoute = path.resolve(__dirname, `../archivosTemp/${nombre}`);

    cfdiXML.getXml().then(xmlT => fs.writeFile(TRoute, xmlT, (err) => {
      if (err) {
        console.log('error al crear archivo XML TIMBRADO, validar LOG..');
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al crear archivo XML TIMBRADO, validar LOG..',
          errors: { message: 'Error al crear archivo XML TIMBRADO, validar LOG..' }
        });

      } else {
        let cadenaOriginal = '';
        Object.getOwnPropertyNames(respuesta).forEach(function (val) {
          let CadenaOriginalComplemento = funcion.cadenaOriginalComplemeto(respuesta[val].Version, respuesta[val].UUID, respuesta[val].FechaTimbrado, respuesta[val].RfcProvCertif
            , respuesta[val].SelloCFD, respuesta[val].NoCertificadoSAT);
          cadenaOriginal = CadenaOriginalComplemento
        });

        if (cadenaOriginal != undefined) {
          CFDIS.findById(id, (err, cfdi) => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar CFDI para Agregar xml Timbrado',
                errors: { message: 'Error al buscar CFDI para Agregar xml Timbrado' }
              });
            }
            if (!cfdi) {
              return res.status(400).json({
                ok: false,
                mensaje: 'El CFDI con el id ' + id + ' No existe',
                errors: { message: 'No existe CFDI con ese ID' }
              });
            }

            var xmlFinal = fs.readFileSync(TRoute, 'utf8')
            cfdi.xmlTimbrado = xmlFinal
            cfdi.save((err, cfdiGuardado) => {
              if (err) {
                return res.status(400).json({
                  ok: false,
                  mensaje: 'Error al guardar XML TIMBRADO',
                  errors: err
                });
              }
              res.status(200).json({
                ok: true,
                cfdi: cfdiGuardado,
                Timbre: respuesta,
                CadenaComplemento: cadenaOriginal,
              });
            });
          });
        } else {
          funcion.CorreoFac('Error al generar Cadena Original Complemento Sat', nombre, 0, 'Error al generar Cadena Original Complemento Sat');
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al generar Cadena Original Comelento Sat, validar LOG..',
            errors: { message: 'Error al generar Cadena Original Comelento Sat, validar LOG..' }
          });
        }
        console.log('Archivo temporal TIMBRADO Guardado');



        // console.log('SUBIENDO ARCHIVO XML TIMBRADO A BOOKET');
        // funcion.subirArchivoBooket('cfdi/xml/', nombre);
      }
    }))
      .catch(e => console.log(e.toString(), '---> OCURRIO UN ERROR AL CREAR EL XML TIMBRADO del CFDI ' + `${nombre}`));
  }
});




// ==========================================
// ACTUALIZAR DATOS DE TIMBRADO EN LA BD
// ==========================================
app.put('/datosTimbrado/:id/', mdAutenticacion.verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body
  CFDIS.findById(id, (err, datosTimbre) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar CFDI',
        errors: err
      });
    }
    if (!datosTimbre) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El CFDI con el id ' + id + ' no existe',
        errors: { message: 'El CFDI con el id ' + id + ' no existe' }
      });
    }
    datosTimbre.uuid = body.uuid;
    datosTimbre.NoSerieSat = body.NoCerieSat;
    datosTimbre.fechaCertificacion = body.fechaCer;
    datosTimbre.cadenaOriginalSat = body.cadenaOriginal;
    datosTimbre.selloSat = body.selloSat;
    datosTimbre.selloEmisor = body.selloEmisor;
    datosTimbre.rfcProvCer = body.rfcProvSat;
    datosTimbre.save((err, datosTimbradoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el CFDI',
          errors: { message: 'Error al actualizar el CFDI' }
        });
      }
      res.status(200).json({
        ok: true,
        cfdiTimbradoAct: datosTimbradoGuardado
      });
    });
  });
});


// ==========================================
// CANCELACION DE CFDI 
// ==========================================

app.get('/cancelacionCFDI/:rfcEmisor&:uuid&:total/', mdAutenticacion.verificaToken, (req, res) => {
  let rfcReceptor = req.params.rfcEmisor,
    uuid = req.params.uuid,
    total = req.params.total,
    rfcEmisor = DATOS.Emisor_RFC
  url = KEYS.URL_CANCELACION;


  async function read() {
    // const key = await ReadCerKey(KEYS.key);
    // const cer = await ReadCerKey(KEYS.cer);
    const archivo = await writeArchivo();

    return { archivo }
  }

  function writeArchivo() {

    // const ARCHIVO = fs.readFileSync(path.resolve(__dirname, `../templates/cancelacion.xml`));

    var Route = path.resolve(__dirname, `../templates/cancelacion.xml`);
    var xml = fs.readFileSync(Route, 'utf8');
    // var CRoute = path.resolve(__dirname, `../archivosTemp/cancelacion.txt`);
    // let ROUTE = fs.writeFileSync(CRoute, mensaje);

    return xml
  }
  function ReadCerKey(key) {
    let text = fs.readFileSync(key, 'utf-8');
    return text;
  }
  read().then(ress => {
    let options = {
      solicitud: ress.archivo,
    }
    const Route = path.resolve(__dirname, `../templates/cancelacion.xml`);
    soap.createClient(url, (err, cliente) => {
      if (err) {
        funcion.envioCooreo('Error al contectar con el web Services Cancelacion' + err, 'UUID: ' + uuid);
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al conectar con Web Services Cancelacion, validar LOG..',
          errors: { message: 'Error al conectar con Web Services Timbrado, validar LOG..' }
        });
      }

      cliente.Cancelar(ress.archivo, function (errorC, result) {
        if (errorC) {
          funcion.envioCooreo('Se produkp un error al cancelar' + result.return.$value + '-' + result.return.Code.$value + ' - ' + result.return.Message.$value, 'UUID: ' + uuid)
          return res.status(400).json({
            ok: false,
            mensaje: `Code: (${result.return.Code.$value}) - Mensaje: ${result.return.Message.$value}`,
            errors: { message: `Code: (${result.return.Code.$value}) - Mensaje: ${result.return.Message.$value}` }
          });
        }
        if (result.return === undefined) {
          funcion.envioCooreo('No se obtuvo respuesta del PAC', 'null');
          return res.status(500).json({
            ok: false,
            mensaje: 'No hay respuesta de timbrado',
            errors: { message: 'No hay respuesta del provedor de timbrado' }
          });
        }
        if (result.return.Code.$value !== '200') {
          funcion.envioCooreo('Error de cancelacion' + result.return.Message.$value, ' CANCELACIÓN: UUID: ' + uuid);
          return res.status(400).json({
            ok: false,
            mensaje: `Code: (${result.return.Code.$value}) - Mensaje: ${result.return.Message.$value}`,
            errors: { message: `Code: (${result.return.Code.$value}) - Mensaje: ${result.return.Message.$value}` }
          });
        }
        res.status(200).json({
          ok: true,
          result: result
        });
      });
    });
  });
});


app.put('/creditos/:creditos', mdAutenticacion.verificaToken, (req, res) => {
  let creditos = req.params.creditos;
  creditos = parseInt(creditos)

  CONTADOR.findById('CreditosTimbre', (err, contador) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'ERROR CONTADOR',
        errors: err
      });
    }
    contador.seq = creditos;

    contador.save((err, contadorGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el CFDI',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        cfdi: contadorGuardado
      });
    });
  });
});

app.get('/getCreditos/:id', (req, res) => {
  let id = req.params.id;
  CONTADOR.findById(id, (erro, getCreditos) => {
    if (erro) {
      return res.status(400).json({
        ok: false,
        mensaje: 'ERROR GET CONTADOR',
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      creditos: getCreditos
    });
  });
});


module.exports = app;