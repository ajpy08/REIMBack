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
const CFDI = require('@alexotano/cfdi33').CFDI
const Emisor = require('@alexotano/cfdi33').Emisor
const Impuestos = require('@alexotano/cfdi33').Impuestos
const Receptor = require('@alexotano/cfdi33').Receptor
const Concepto = require('@alexotano/cfdi33').Concepto
const Traslado = require('@alexotano/cfdi33').Traslado
const Retencion = require('@alexotano/cfdi33').Retencion
const ImpTraslado = require('@alexotano/cfdi33').ImpTraslado
const ImpRetencion = require('@alexotano/cfdi33').ImpRetencion
const parser = require('xml2json');
var QRCode = require('qrcode');
const Complemento = require('@alexotano/cfdi33').Complemento;
var Maniobra = require('../models/maniobra');
var variasBucket = require('../public/variasBucket');
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
app.get('/', (req, res, next) => {
  CFDIS.find({})
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
//  Obtener CFDI por ID
// ==========================================
app.get('/cfdi/:id', (req, res) => {
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
        cfdi: cfdi
      });
    });
});


// ==========================================
//  VALIDAR SI NO EXISTE MANIOBRA Y CONCEPTO YA AGREGADOS EN LA BD 
// ==========================================

app.get('/cfdis/Maniobra/Concepto/:maniobra&:concepto/', mdAutenticacion.verificaToken, (req, res) => {
  var maniobra_ID = req.params.maniobra;
  var concepto_ID = req.params.concepto;

  CFDIS.find({ 'conceptos.maniobras': { $eq: maniobra_ID }, 'conceptos._id': { $eq:  concepto_ID }}).exec((err, maniobrasConcepto) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar Maniobra ' + maniobra_ID  + 'y concepto ' + concepto_ID,
        errors: {message: 'Error al buscar Maniobra ' + maniobra_ID  + 'y concepto' + concepto_ID,}
      });
    }
    if (!maniobra_ID && !concepto_ID) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra ' + maniobra_ID + ' y conceptos ' + concepto_ID + ' no existen',
        errors: { message: 'La maniobra ' + maniobra_ID + ' y conceptos ' + concepto_ID + ' no existen'}
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
    usoCFDI: body.usoCFDI,
    direccion: body.direccion,
    correo: body.correo,
    conceptos: body.conceptos,
    totalImpuestosRetenidos: body.totalImpuestosRetenidos,
    totalImpuestosTrasladados: body.totalImpuestosTrasladados,
    sucursal: body.sucursal,
    usuarioAlta: req.usuario._id
  });

  body.conceptos.forEach(c => {
    c.maniobras.forEach(m => {
      Maniobra.updateMany({ "_id": m._id }, { $push: { 'cfdisAsociados': { $each: [cfdi._id] } } }, (err, maniobra) => {
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
    });
  });

  cfdi.save((err, cfdiGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear el CFDI',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      cfdi: cfdiGuardado
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

    cfdi.serie = body.serie,
      cfdi.folio = body.folio,
      cfdi.sucursal = body.sucursal,
      cfdi.formaPago = body.formaPago,
      cfdi.metodoPago = body.metodoPago,
      cfdi.moneda = body.moneda,
      cfdi.tipoComprobante = body.tipoComprobante,
      cfdi.fecha = body.fecha,
      cfdi.rfc = body.rfc,
      cfdi.nombre = body.nombre,
      cfdi.usoCFDI = body.usoCFDI,
      cfdi.direccion = body.direccion,
      cfdi.correo = body.correo,
      cfdi.conceptos = body.conceptos,
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
  Maniobra.updateMany({ 'cfdisAsociados': id }, { $pull: { 'cfdisAsociados': id } }, (err) => {
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
    var total = funcion.totalRedondeo(cfdi.total);
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
      'Total': total,
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
      let ValorUnitario = funcion.splitEnd(c.valorUnitario)
      let Importe = funcion.splitEnd(c.importe);
      let Cantidad = funcion.cantidad(c.cantidad);

      const concepto = new Concepto({
        'Cantidad': Cantidad,
        'ClaveProdServ': c.claveProdServ,
        'ClaveUnidad': c.claveUnidad,
        'Descripcion': c.descripcion,
        'Importe': Importe,
        'NoIdentificacion': c.noIdentificacion,
        'ValorUnitario': ValorUnitario,
      });


      for (const im of c.impuestos) {
        var tasaOCuota = funcion.punto(im.tasaCuota);

        if (im.TR === 'TRASLADO') {
          var importeT = funcion.splitEnd(im.importe);
          concepto.add(new Traslado({
            'Base': Importe,
            'Importe': importeT,
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


    var totalImpuestosTrasladados = funcion.splitStart(cfdi.totalImpuestosTrasladados);
    var totalImpuestosRetenidos = funcion.splitStart(cfdi.totalImpuestosRetenidos);
    const totalimp = new Impuestos({

      'TotalImpuestosRetenidos': totalImpuestosRetenidos,
      'TotalImpuestosTrasladados': totalImpuestosTrasladados
    });

    let tasaOCuotaR = ''
    for (const imp of cfdi.conceptos) {
      for (const im of imp.impuestos) {
        if (im.TR !== 'RETENCION') {
          tasaOCuotaR = funcion.punto(im.tasaCuota);
        }
        if (im.TR === 'TRASLADO') {
          let impR = im.impuesto;
          let totalImpuestosTrasladados = funcion.splitStart(cfdi.totalImpuestosTrasladados)
          totalimp.add(new ImpTraslado({
            'Importe': totalImpuestosTrasladados,
            'Impuesto': impR,
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

    var RouteFolder = path.resolve(__dirname, `../xmlTemp/`)
    var folderexist = fs.existsSync(RouteFolder);
    if (folderexist === false) {
      fs.mkdirSync(RouteFolder)
    }
    var nombre = `${cfdi.serie}-${cfdi.folio}-${cfdi._id}.xml`;
    var Route = path.resolve(__dirname, `../xmlTemp/${nombre}`);




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
        const xmlSinT = parser.toJson(xml, options);
        return res.status(200).json({
          ok: true,
          rutaArchivo: Route,
          NombreArchivo: nombre,
          cfdiXMLsinTimbrar: xmlSinT
        });
      }
    }))
      .catch(e => console.log(e.toString(), '---> OCURRIO UN ERROR AL CREAR EL XML del CFDI ' + `${nombre}`));

  });

});


// ==========================================
// TIMBRAR XML Y GENERAL CADENA ORIGINAL COMPLEMENTO 
// ==========================================
app.get('/timbrado/:nombre&:id/', (req, res) => {
  var id = req.params.id;
  var nombre = req.params.nombre;
  var Route = path.resolve(__dirname, `../xmlTemp/${nombre}`);
  xml = fs.readFileSync(Route, 'utf8');

  var url = KEYS.URL_TIM_DES,
    key = KEYS.API_KEY,
    args = {
      key: key,
      cfdi: xml
    };

  soap.createClient(url, (errC, cliente) => {
    if (errC) {
      funcion.log('Error al conectar con Web Services Timbrado' + errC, nombre, 1, 'Error al conectar con Web Services Timbrado');
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al conectar con Web Services Timbrado, validar LOG..',
        errors: { message: 'Error al conectar con Web Services Timbrado, validar LOG..' }
      });
    }

    cliente.timbrar(args, (errT, result) => {
      if (errT) {
        funcion.log('Se produjo un error al rimbrar' + result.return.Message.$value, nombre, 1, result.return.Code.$value + ' - ' + result.return.Message.$value)
        return res.status(400).json({
          ok: false,
          mensaje: 'Se produjo un error al timbrar XML, validar LOG..',
          errors: { message: 'Se produjo un error al timbrar XML, validar LOG..' }
        });
      }

      if (result.return === undefined) {
        funcion.log('No se obtuvo respuesta del provedor de servicio', nombre, 1, 'No se obtuvo respuesta del provedor de servicios de timbrado');
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
          funcion.log(result.return.Code.$value + ' - ' + result.return.Message.$value, nombre, '1', result.return.Message.$value)
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al Timbrar -> LogCFDI',
            errors: { message: 'Error al Timbrar -> LogCFDI' }
          });
        }

      }
    });
  });

  function RespuestaTimbre(result) {
    var respuesta = parser.toJson(result.return.Timbre.$value, options);
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

    var TRoute = path.resolve(__dirname, `../xmlTemp/T-${nombre}`);

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

          //  var cfdiQR = conusltaCFDIdb();
          //   codigoQR = funcion.codigoQR(respuesta[val].UUID, DATOS.Emisor_RFC, cfdiQR.rfc, cfdiQR.total);
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
          funcion.log('Error al generar Cadena Original Complemento Sat', nombre, 0, 'Error al generar Cadena Original Complemento Sat');
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al generar Cadena Original Comelento Sat, validar LOG..',
            errors: { message: 'Error al generar Cadena Original Comelento Sat, validar LOG..' }
          });
        }
        console.log('Archivo temporal TIMBRADO Guardado');


        // leer y mover el archivo timbrado a boocket 
        var url = 'cfdi/xml/',
          nombreArchivo = `T-${nombre}`,
          archivoTemp = nombre,
          read = path.resolve(__dirname, `../xmlTemp/T-${nombre}`);
        fs.readFile(read, (err, fd) => {
          if (err) {
            funcion.log('Fallo al leer archivo timbrado XML', nombreArchivo, 0, 'Error read');
            return res.status(400).json({
              ok: false,
              mensaje: 'Error al leer archivo XML temporal, validar LOG..'
            });
          }
          variasBucket.SubirArchivoBucket(fd, url, nombreArchivo).then((value) => {
            if (value) {
              console.log('El archivo XML TIMBRADO se ha subido Exitosamente a BOCKET');
              fs.unlink(path.resolve(__dirname, `../xmlTemp/${nombreArchivo}`), (err) => {
                if (err) {
                  funcion.log('Error al borrar archivo XML TIMBRADO temporal', nombreArchivo, 1, 'error when deleting');
                  return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar archivo temporal' + nombreArchivo,
                    errors: { message: 'Error al borrar archivo temporal' + nombreArchivo }
                  });
                }
              });
              fs.unlink(path.resolve(__dirname, `../xmlTemp/${archivoTemp}`), (err) => {
                if (err) {
                  funcion.log('Error al borrar archivo XML temporal', nombreArchivo, 1, 'error when deleting');
                  return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al borrar archivo temporal' + nombreArchivo,
                    errors: { message: 'Error al borrar archivo temporal' + nombreArchivo }
                  });
                }
              });
            }
          });
        });
        // ! FIN leer y mover el archivo timbrado a boocket 
      }
    }))
      .catch(e => console.log(e.toString(), '---> OCURRIO UN ERROR AL CREAR EL XML TIMBRADO del CFDI ' + `${nombre}`));
  }
});


// ==========================================
// GENERAR CODIGO QR
// ==========================================

app.get('/code/:uuid&:rfc_emisor&:rfc_receptor&:total&:sello/', (req, res) => {
  var uuid = req.params.uuid;
  rfc_emisor = req.params.rfc_emisor,
    rfc_receptor = req.params.rfc_receptor,
    total = req.params.total,
    sello = req.params.sello,
    urlQR = 'cfdi/QR/',
    readQR = path.resolve(__dirname, `../xmlTemp/QR-${uuid}.png`);

  var sellomod = sello.indexOf('@'),
    selloast = '';
  if (sellomod != -1) {
    selloast = sello.replace('@', '/');
  } else {
    selloast = sello;
  }

  var codigoQR = '';
  var totalQR = total.toString().indexOf('.');
  var totalFinalQR = "";
  if (totalQR != -1) {
    let cort = total.toString().split('.');
    totalFinalQR = cort[0].padStart(17, 0) + cort[1].padStart(6, 0);
  } else {
    totalFinalQR = total.toString().padStart(16, 0);
  }
  codigoQR = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${rfc_emisor}&rr=${rfc_receptor}&tt=${totalFinalQR}&fe=${selloast}`;
  QRCode.toFile(readQR, codigoQR, function (err, data) {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al generar codigo QR del UUID ' + uuid,
        errors: {
          mensaje: 'Error al generar codigo QR del UUID ' + uuid
        }
      })
    } else {
      fs.readFile(readQR, (err, qr) => {
        if (err) {
          funcion.log('Error al leer archivo QR del uuid' + `QR-${uuid}.png`, `QR-${uuid}.png`, 1, err);
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al leer archivo QR del uuid' + uuid,
            errors: { message: 'Error al leer archivo QR del uuid' + uuid }
          })
        };
        variasBucket.SubirArchivoBucket(qr, urlQR, `QR-${uuid}.png`).then((value) => {
          if (value) {
            console.log('Archivo QR subido al bucket');

            fs.unlink(path.resolve(__dirname, `../xmlTemp/QR-${uuid}.png`), (err) => {
              if (err) {
                return res.status(400).json({
                  ok: false,
                  mensaje: 'Error al borrar codigo QR Temporal',
                  errors: { message: 'Error al borrar codigo QR Temporal' }
                });
              }
            });
            return res.status(200).json({
              ok: true,
              QR: `QR-${uuid}.png`
            });
          }
        });
      });
    }
  });
});


module.exports = app;