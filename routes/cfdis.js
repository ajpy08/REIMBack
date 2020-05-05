var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var DATOS = require('../config/config').DATOS
var KEYS = require('../config/config').KEYS
var app = express();
var fs = require('fs');
var path = require('path');
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
});

// ==========================================
// XML CFDI
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

    var total = funcion.splitStart(cfdi.total);
    const cfdiXML = new CFDI({
      'Fecha': fecha,
      'Folio': cfdi.folio,
      'FormaPago': cfdi.formaPago,
      'LugarExpedicion': DATOS.LugarExpedicion,
      'MetodoPago': cfdi.metodoPago,
      'Serie': cfdi.serie,
      'Moneda': cfdi.moneda,
      'NoCertificado': DATOS.NoCertificado,
      'SubTotal': cfdi.subtotal,
      'TipoDeComprobante': cfdi.tipoComprobante,
      'Total': total
    });

    cfdiXML.cer = KEYS.cer
    cfdiXML.key = KEYS.key
    cfdiXML.withOutCerts = false

    cfdiXML.add(new Emisor({
      'Rfc': DATOS.Emisor_RFC,
      'Nombre': DATOS.Emisor_Nombre,
      'RegimenFiscal': DATOS.Emisor_RegimenFiscal
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
        'ValorUnitario': ValorUnitario,
        'NoIdentificacion': c.noIdentificacion,
        'Importe': Importe,
        'Descripcion': c.descripcion,
        'ClaveUnidad': c.claveUnidad,
        'ClaveProdServ': c.claveProdServ,
        'Cantidad': Cantidad,
      });


      for (const im of c.impuestos) {
        var tasaOCuota = funcion.punto(im.tasaCuota);
        
        if (im.TR === 'TRASLADO') {
          var importeT = funcion.splitEnd(im.importe);
          concepto.add(new Traslado({
            'Importe': importeT,
            'TipoFactor': im.tipoFactor,
            'TasaOCuota': tasaOCuota,
            'Impuesto': im.impuesto,
            'Base': Importe,
          }));
          // cfdiXML.add(concepto);
        } else if (im.TR === 'RETENCION') {
          var importeR = funcion.splitEnd(im.importe);
          concepto.add(new Retencion({
            'Importe': importeR,
            'TipoFactor': im.tipoFactor,
            'TasaOCuota': tasaOCuota,
            'Impuesto': im.impuesto,
            'Base': Importe,
          }));
        }

      }
      cfdiXML.add(concepto);
      break
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
        if (im.TR === 'RETENCION') {
          let impR = im.impuesto;
          let totalImpuestosTrasladados = funcion.splitStart(cfdi.totalImpuestosTrasladados)
          totalimp.add(new ImpTraslado({
            'Importe': totalImpuestosTrasladados,
            'Impuesto': impR,
            'TasaOCuota': tasaOCuotaR,
            'TipoFactor': im.tipoFactor,

          }));

        } if (im.TR === 'TRASLADO') {
          const imp = im.impuesto;
          let totalImpuestosRetenidos = funcion.splitStart(cfdi.totalImpuestosRetenidos);
          totalimp.add(new ImpRetencion({
            'Importe': totalImpuestosRetenidos,
            'Impuesto': imp
          }));
        }
      }
      cfdiXML.add(totalimp);
      break
    }

    cfdiXML.getXml()
      .then(xml => fs.writeFile(path.resolve('C:/Users/leogh/Documents/GitHub/REIMBack/xmlTemp', `${cfdi._id}.xml`), xml, (err, res) => {
        if (err) {
          console.log('error al crear archivo XML');
        } else {
          console.log('Archivo Creado');
        }
      }))
      .catch(e => console.log(e.toString(), '---> error'));

    res.status(200).json({
      ok: true
    });
  });
});







module.exports = app;