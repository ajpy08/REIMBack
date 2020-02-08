var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var EDI = require('../models/EDI');
const MSC = require('../public/msc');
var Maniobra = require('../models/maniobra');
const varias = require('../public/varias');
var IdMSC = require('../config/config').IdMSC;
const FTP = require('../public/ftp');
var CODE_MYT_MSC = require('../config/config').CODE_MYT_MSC;
const sentMail = require('../routes/sendAlert');
var correosTI = require('../config/config').correosTI;

// ==========================================
// Crear nuevo EDI
// ==========================================
app.post('/nuevo/', mdAutenticacion.verificaToken, (req, res) => {
  var ok = false;
  var body = req.body;

  // Valido si la naviera es MSC
  if (req.query.naviera && req.query.naviera == IdMSC) {
    //LLeno los datos de EDI que viene por query 
    var edi = new EDI({
      tipo: req.query.tipo,
      naviera: req.query.naviera,
      maniobra: req.query.maniobra,
      usuarioAlta: req.usuario._id,
      fAlta: new Date()
    });

    //Consulto la maniobra para obtener sus datos
    Maniobra.findById(req.query.maniobra)
      .populate('solicitud', '_id blBooking facturarA')
      .exec((err, maniobra) => {
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
            mensaje: 'La maniobra con el id ' + EDIGuardado.maniobra + ' no existe',
            errors: { message: 'No existe una maniobra con ese ID' }
          });
        }

        //Si la maniobra esta en los siguientes estatus continuo
        if (maniobra.estatus == 'LAVADO_REPARACION' ||
          maniobra.estatus == 'DISPONIBLE' ||
          maniobra.estatus == 'CARGADO') {

          //Guardo el EDI en la base de datos
          edi.save((err, EDIGuardado) => {
            if (err) {
              return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar EDI',
                errors: err
              });
            }

            //Busco el EDI que acabo de guardar para obtener el numero de Referencia
            //que se crea automaticamente.
            EDI.findById(EDIGuardado._id, (err, EDI) => {
              if (err) {
                return res.status(500).json({
                  ok: false,
                  mensaje: 'Error al buscar EDI',
                  errors: err
                });
              }
              if (!EDI) {
                return res.status(400).json({
                  ok: false,
                  mensaje: 'El EDI con el id ' + EDIGuardado._id + ' no existe',
                  errors: { message: 'No existe EDI con ese ID' }
                });
              }

              //Si el numero de referencia existe y es valido continuo
              if (EDIGuardado.noReferencia != '' && EDIGuardado.noReferencia != undefined) {

                //Creo la cadena EDI
                var contenidoEDI = MSC.CreaCODECO(maniobra, EDIGuardado.noReferencia)

                //Si se creo la cadena continuo
                if (contenidoEDI != '' && contenidoEDI != undefined) {
                  //Le asigno al EDI que consulte la cadena EDI
                  EDI.edi = contenidoEDI;
                } else {
                  return res.status(400).json({
                    ok: false,
                    mensaje: 'El ContenidoEDI es VACIO',
                    errors: { message: 'El ContenidoEDI es VACIO' }
                  });
                }

                //Actualizo el EDI ya con la cadena.
                EDI.save((err, ADIActualizado) => {
                  if (err) {
                    return res.status(400).json({
                      ok: false,
                      mensaje: 'Error al actualizar EDI',
                      errors: err
                    });
                  }
                  //Devuelvo el EDI completo.
                  res.status(200).json({
                    ok: true,
                    EDI: ADIActualizado
                  });
                });
              } else {
                return res.status(400).json({
                  ok: false,
                  mensaje: 'El Numero de Referencia no es válido (' + EDIGuardado.noReferencia + ')',
                  errors: { message: 'El Numero de Referencia no es válido' }
                });
              }
            });
          });

          // FTP.UploadFile(req.query.ruta, nombreArchivo, true);
        } else {
          return res.status(400).json({
            ok: false,
            mensaje: 'La maniobra no se encuentra en un estado válido',
            errors: { message: 'La maniobra no se encuentra en un estado válido' }
          });
        }
      });
  } else {
    return res.status(400).json({
      ok: false,
      mensaje: 'La naviera no pertenece a MSC',
      errors: { message: 'La naviera no pertenece a MSC' }
    });
  }
});

// ================================================
//  Servicio para Subir a FTP el EDI CODECO de MSC
// ================================================
app.put('/upload/CODECO/', mdAutenticacion.verificaToken, (req, res) => {
  var d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
    hr = d.getHours(),
    min = d.getMinutes();

  var fechaEnvioYYYY = year.toString() + varias.zFill(month, 2) + varias.zFill(day, 2);
  var horaEnvio = varias.zFill(hr.toString(), 2) + varias.zFill(min.toString(), 2);

  var idManiobra = req.query.maniobra;
  var rutaTMP = req.query.rutaTMP;
  var elimina = (req.query.elimina === 'true');

  EDI.find({ maniobra: idManiobra })
    .populate('maniobra', 'naviera cargaDescarga')
    .sort({ noReferencia: -1 })
    .exec((err, EDIS) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar EDI',
          errors: err
        });
      }

      if (EDIS && EDIS.length > 0) {
        var EDI = EDIS[0];

        if (EDI.maniobra.naviera && EDI.maniobra.naviera == IdMSC) {

          if (EDI.edi != '') {
            var gate = 'Gate-';

            if (EDI.maniobra.cargaDescarga == 'D') {
              gate += 'In';
            } else {
              if (EDI.maniobra.cargaDescarga == 'C') {
                gate += 'Out';
              }
            }

            var nombreArchivo = gate + '_' + CODE_MYT_MSC + '_' + fechaEnvioYYYY + horaEnvio + '_' + EDI.noReferencia + '.txt';
            rutaTMP += nombreArchivo;

            varias.creaArchivoTXT(rutaTMP, EDI.edi.replace(/\n/g, '').trim()).then(
              function (ok) {
                if (ok) {
                  FTP.UploadFile(rutaTMP, 'MSC', elimina).then(
                    function (ok) {
                      if (ok) {
                        FTP.ExistFile(nombreArchivo, 'MSC').then(
                          function (ok) {
                            if (ok) {
                              EDI.generado = ok;
                              EDI.fEnvio = new Date();
                              EDI.usuarioMod = req.usuario._id;
                              EDI.fMod = new Date();
                              EDI.save((err, EDI) => {
                                if (err) {
                                  return res.status(400).json({
                                    ok: false,
                                    mensaje: 'Error al actualizar EDI',
                                    errors: err
                                  });
                                }
                                res.status(200).json({
                                  ok: true,
                                  maniobra: EDI.maniobra,
                                  EDI: EDI.edi,
                                  // rutaTMP: rutaTMP,
                                  referenceNumber: EDI.noReferencia,
                                  generado : ok
                                });
                              });                              
                            } else {
                              var cuerpoCorreo = 'No se pudo subir al FTP de MSC el archivo con referencia ' + EDI.noReferencia;
                              sentMail('Compañero de TI', correosTI, 'Error Upload FTP', cuerpoCorreo, 'emailAlert');

                              return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al subir EDI a FTP',
                                errors: err
                              });
                            }
                          }
                        );
                      }
                    },
                    function (err) {
                      console.log("ERROR: ", err);
                    }
                  );
                }
              },
              function (err) {
                console.log("ERROR: ", err);
              }
            );
          } else {
            return res.status(400).json({
              ok: false,
              mensaje: 'El ContenidoEDI es VACIO',
              errors: { message: 'El ContenidoEDI es VACIO' }
            });
          }
        } else {
          return res.status(400).json({
            ok: false,
            mensaje: 'La maniobra no pertenece a MSC',
            errors: { message: 'La maniobra no pertenece a MSC' }
          });
        }
      } else {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar EDI',
          errors: err
        });
      }
    });
});

// ==========================================
//  Crea Cadena CODECO (Se puede usar solo para generar archivo 
//  con CODECO - Estaba separado pero lo junte en upload FTP)
// ==========================================
app.get('/CODECO/', (req, res) => {

  var d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
    hr = d.getHours(),
    min = d.getMinutes();

  var fechaEnvioYYYY = year.toString() + varias.zFill(month, 2) + varias.zFill(day, 2);
  var horaEnvio = varias.zFill(hr.toString(), 2) + varias.zFill(min.toString(), 2);

  var idManiobra = req.query.maniobra;
  var referenceNumber = req.query.referenceNumber;
  var rutaTMPCompleta = req.query.ruta;

  Maniobra.findById(idManiobra)
    .populate('solicitud', '_id blBooking facturarA')
    .exec((err, maniobra) => {
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
          mensaje: 'La maniobra con el id ' + idManiobra + ' no existe',
          errors: { message: 'No existe una maniobra con ese ID' }
        });
      }

      if (maniobra.naviera && maniobra.naviera == IdMSC) {
        if (maniobra.estatus == 'LAVADO_REPARACION' ||
          maniobra.estatus == 'DISPONIBLE' ||
          maniobra.estatus == 'CARGADO') {

          var contenidoEDI = MSC.CreaCODECO(maniobra, referenceNumber)

          if (contenidoEDI != '') {
            var gate = 'Gate-';

            if (maniobra.cargaDescarga == 'D') {
              gate += 'In';
            } else {
              if (maniobra.cargaDescarga == 'C') {
                gate += 'Out';
              }
            }

            var nombreArchivo = gate + '_MXPGOAB_' + fechaEnvioYYYY + horaEnvio + '_' + referenceNumber + '.txt';
            rutaCompleta += nombreArchivo;


            varias.creaArchivoTXT(rutaCompleta, contenidoEDI.replace(/\n/g, '').trim());
          } else {
            return res.status(400).json({
              ok: false,
              mensaje: 'El ContenidoEDI es VACIO',
              errors: { message: 'El ContenidoEDI es VACIO' }
            });
          }

          // FTP.UploadFile(req.query.ruta, nombreArchivo, true);

          res.status(200).json({
            ok: true,
            //maniobra: maniobra,
            contenido: contenidoEDI,
            ruta: rutaCompleta,
            referenceNumber: referenceNumber
          });

        } else {
          return res.status(400).json({
            ok: false,
            mensaje: 'La maniobra no se encuentra en un estado válido',
            errors: { message: 'La maniobra no se encuentra en un estado válido' }
          });
        }
      } else {
        return res.status(400).json({
          ok: false,
          mensaje: 'La maniobra no pertenece a MSC',
          errors: { message: 'La maniobra no pertenece a MSC' }
        });
      }
    });
});

// ==========================================
//  Este metodo me servía para actualizar el EDI
// ==========================================

app.put('/update/', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.query.id;
  //var body = req.body;
  EDI.findById(id, (err, EDI) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar EDI',
        errors: err
      });
    }
    if (!EDI) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El EDI con el id ' + id + ' no existe',
        errors: { message: 'No existe EDI con ese ID' }
      });
    }

    //EDI.edi = req.query.edi;
    EDI.generado = req.query.generado;
    EDI.fEnvio = req.query.fEnvio
    EDI.usuarioMod = req.usuario._id;
    EDI.fMod = new Date();
    EDI.save((err, EDIGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar EDI',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        EDI: EDIGuardado
      });
    });
  });
});

module.exports = app;