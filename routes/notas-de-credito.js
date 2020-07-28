var express = require('express');
var app = express();
var CFDIS = require('../models/facturacion/cfdi');
var mdAutenticacion = require('../middlewares/autenticacion');
var tipoRelacion = require('../models/facturacion/tipoRelacion');
var moment = require('moment');
const cfdi = require('../models/facturacion/cfdi');
const { DATOS, KEYS } = require('../config/config');
let notaXML;
var fs = require('fs');
var xml2js = require('xml2js').parseString;
var soap = require('soap');
const path = require('path');
var funcion = require('../routes/fuctions');
const CFDI = require('@alexotano/cfdi33').CFDI
const Emisor = require('@alexotano/cfdi33').Emisor
const CfdiRelacionado = require('@alexotano/cfdi33').CfdiRelacionado
const Impuestos = require('@alexotano/cfdi33').Impuestos
const Receptor = require('@alexotano/cfdi33').Receptor
const Concepto = require('@alexotano/cfdi33').Concepto
const Traslado = require('@alexotano/cfdi33').Traslado
const Retencion = require('@alexotano/cfdi33').Retencion
const Complemento = require('@alexotano/cfdi33').Complemento;
const ImpTraslado = require('@alexotano/cfdi33').ImpTraslado
const ImpRetencion = require('@alexotano/cfdi33').ImpRetencion


// ==========================================
// CARGAR TIPO RELACIÓN
// ==========================================
app.get('/', mdAutenticacion.verificaToken, (req, res) => {
    tipoRelacion.find().exec((err, tipoRelacion) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al cargar Tipo Relacion',
                errors: err
            });
        }
        return res.status(200).json({
            ok: true,
            tipoRelacion: tipoRelacion
        });
    });
});

// ==========================================
// Crear nueva NOTA DE CREDITO
// ==========================================

app.post('/notas/', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;
    const notas = new CFDIS({
        fecha: body.fecha,
        folio: body.folio,
        formaPago: body.formaPago,
        metodoPago: body.metodoPago,
        moneda: body.moneda,
        serie: body.serie,
        subtotal: body.subtotal,
        tipoComprobante: body.tipoComprobante,
        total: body.total,
        nombre: body.nombre,
        rfc: body.rfc,
        usoCFDI: body.usoCFDI,
        direccion: body.direccion,
        correo: body.correo,
        conceptos: body.conceptos,
        tipoRelacion: body.tipoRelacionNota,
        totalImpuestosRetenidos: body.totalImpuestosRetenidos,
        totalImpuestosTrasladados: body.totalImpuestosTrasladados,
        sucursal: body.sucursal,
        fechaEmision: moment().format('YYYY-MM-DD HH:mm:ss'),
        usuarioAlta: req.usuario._id
    });
    for (const cc of notas.conceptos) {
        for (const c of cc.cfdis) {
            CFDIS.findByIdAndUpdate(c.idCFDI, { $set: { 'notaDeCreditoRelacionada': notas._id } }).then(cfdi => {
                console.log('ok agregado id nota a cfdi')
            }).catch(err => {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al agregar nota de credito relacionada a cfdi',
                    errors: err
                });
            });
        }
    }
    notas.save((err, notaGuardada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar Nota de Credito',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            nota: notaGuardada
        });
    });
});

// ==========================================
// ACTUALIZAR NOTA DE CREDITO
// ==========================================
app.put('/notas/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    CFDIS.findById(id, (err, nota) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Nota de credito',
                errors: err
            });
        }
        if (!nota) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La Nota de Credito con el id ' + id + ' no existe',
                errors: { message: 'La Nota de Credito con el id ' + id + ' no existe' }
            });
        }
        nota.fecha = body.fecha,
            nota.folio = body.folio,
            nota.formaPago = body.formaPago,
            nota.metodoPago = body.metodoPago,
            nota.moneda = body.moneda,
            nota.serie = body.serie,
            nota.subtotal = body.subtotal,
            nota.tipoComprobante = body.tipoComprobante,
            nota.total = body.total,
            nota.nombre = body.nombre,
            nota.rfc = body.rfc,
            nota.usoCFDI = body.usoCFDI,
            nota.direccion = body.direccion,
            nota.correo = body.correo,
            nota.informacionAdicional = body.informacionAdicional,
            nota.conceptos = body.conceptos,
            nota.totalImpuestosRetenidos = body.totalImpuestosRetenidos,
            nota.totalImpuestosTrasladados = body.totalImpuestosTrasladados,
            nota.sucursal = body.sucursal,
            nota.usuarioMod = req.usuario._id;
        nota.fMod = new Date();

        nota.save((err, notaUpdate) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Nota de Credito',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                nota: notaUpdate
            });
        });
    });

});

// ==========================================
// BORRAR NOTA DE CREDITO
// ==========================================

app.delete('/nota_de_credito/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    CFDIS.updateMany({ 'notaDeCreditoRelacionada': id }, { $unset: { 'notaDeCreditoRelacionada': id } }, (err, notaB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar nota de credito relacionada de cfdi',
                errors: err
            });
        } else {
            CFDIS.findByIdAndRemove(id, (err, notaBorrada) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al borrar Nota de credito con el id ' + id,
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    notaBorrada: notaBorrada
                });
            });
        }

    });
});

// ==========================================
// XML NOTA SIN TIMBRAR
// ==========================================

app.get('/nota/:id/xml/', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    CFDIS.findById(id, (err, nota) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Nota de Credito',
                errors: err
            });
        }
        if (!nota) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La NOTA de credito con el ID ' + id + ' no existe',
                errors: { message: 'No existe Nota de credito con ese ID' }
            });
        }
        const fecha = moment(nota.fecha).format('YYYY-MM-DDTHH:mm:ss');

        notaXML = new CFDI({
            'Fecha': fecha,
            'Folio': nota.folio,
            'FormaPago': nota.formaPago,
            'LugarExpedicion': DATOS.LugarExpedicion,
            'MetodoPago': nota.metodoPago,
            'Moneda': nota.moneda,
            'Serie': nota.serie,
            'SubTotal': nota.subtotal,
            'TipoDeComprobante': nota.tipoComprobante,
            'Total': nota.total,
            'Version': DATOS.Version,
            'NoCertificado': DATOS.NoCertificado
        });

        notaXML.key = KEYS.key
        notaXML.cer = KEYS.cer
        notaXML.withOutCerts = false

        let r;
        
        for (const c of nota.conceptos) {
            for (const u of c.cfdis) {
               r = new CfdiRelacionado({
                    'UUID': u.uuid
                }, {'TipoRelacion': nota.tipoRelacion});
            }
            notaXML.add(r);
            
        }
        notaXML.add(new Emisor({
            'Nombre': DATOS.Emisor_Nombre,
            'RegimenFiscal': DATOS.Emisor_RegimenFiscal,
            'Rfc': DATOS.Emisor_RFC,
        }));

        notaXML.add(new Receptor({
            'Nombre': nota.nombre,
            'Rfc': nota.rfc,
            'UsoCFDI': nota.usoCFDI
        }));

        for (const c of nota.conceptos) {
            let Importe = funcion.splitEnd(c.importe);
            const concepto = new Concepto({
                'Cantidad': c.cantidad,
                'ClaveProdServ': c.claveProdServ,
                'ClaveUnidad': c.claveUnidad,
                'Descripcion': c.descripcion,
                'Importe': c.importe,
                'NoIdentificacion': c.noIdentificacion,
                'ValorUnitario': c.valorUnitario,
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
            notaXML.add(concepto);
        }

        const totalimp = new Impuestos({
            'TotalImpuestosRetenidos': nota.totalImpuestosRetenidos,
            'TotalImpuestosTrasladados': nota.totalImpuestosTrasladados
        });

        let tasaOCuotaR = ''
        for (const imp of nota.conceptos) {
            for (const im of imp.impuestos) {
                if (im.TR !== 'RETENCION') {
                    tasaOCuotaR = funcion.punto(im.tasaCuota);
                }
                if (im.TR === 'TRASLADO') {
                    totalimp.add(new ImpTraslado({
                        'Importe': nota.totalImpuestosTrasladados,
                        'Impuesto': im.impuesto,
                        'TasaOCuota': tasaOCuotaR,
                        'TipoFactor': im.tipoFactor,

                    }));

                } if (im.TR != 'RETENCION') {
                    const imp = im.impuesto;
                    let totalImpuestosRetenidos = funcion.splitStart(nota.totalImpuestosRetenidos);
                    totalimp.add(new ImpRetencion({
                        'Importe': totalImpuestosRetenidos,
                        'Impuesto': imp
                    }));
                }
            }
            totalimp.nodes.reverse()
            notaXML.add(totalimp);
            break
        }

        var RouteFolder = path.resolve(__dirname, `../archivosTemp/`)
        var folderexist = fs.existsSync(RouteFolder);
        if (folderexist === false) {
            fs.mkdirSync(RouteFolder)
        }
        var nombre = `${nota.serie}-${nota.folio}-${nota._id}.xml`;
        var Route = path.resolve(__dirname, `../archivosTemp/${nombre}`);

        var xmlT = [];
        notaXML.getXml().then(xml => fs.writeFile(Route, xml, (err) => {
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
                    cfdiData: nota
                });
            }
        }))
            .catch(e => console.log(e.toString(), '---> OCURRIO UN ERROR AL CREAR EL XML del CFDI ' + `${nombre}`));

    });
});


// ==========================================
// TIMBRAR XML Y GENERAL CADENA ORIGINAL COMPLEMENTO 
// ==========================================
app.get('/notaTimbre/:nombre&:id&:direccion/', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var nombre = req.params.nombre;
    let direccion = req.params.direccion;
    var Route = path.resolve(__dirname, `../archivosTemp/${nombre}`);
    xml = fs.readFileSync(Route, 'utf8');
  
    var url = KEYS.URL_TIM_DES,
      key = KEYS.API_KEY,
      args = {
        key: key,
        nota: xml
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
  
        notaXML.add(complemento);
      });
  
  
      var TRoute = path.resolve(__dirname, `../archivosTemp/${nombre}`);
  
      notaXML.getXml().then(xmlT => fs.writeFile(TRoute, xmlT, (err) => {
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
            mensaje: 'Error al actualizar el Nota',
            errors: { message: 'Error al actualizar el Nota' }
          });
        }
        res.status(200).json({
          ok: true,
          NotaTimbradoAct: datosTimbradoGuardado
        });
      });
    });
  });
  
module.exports = app;