var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");
var fs = require("fs");
var app = express();
var variasBucket = require("../public/variasBucket");
var mongoose = require("mongoose");
var Liberaciones = require("../models/liberacion");
var Maniobra = require("../models/maniobra");
var moment = require("moment");
const sentMail = require("./sendAlert");
var varias = require("../public/varias");

// =======================================
// Obtener liberaciones TODAS
// =======================================
app.get("/:tipo?:estatus?:finialta?:ffinalta?:naviera?", (req, res) => {
  var tipo = req.query.tipo || "";
  var estatus = req.query.estatus || "";
  var finialta = req.query.finialta || "";
  var ffinalta = req.query.ffinalta || "";
  var naviera = req.query.naviera || "";

  var filtro = "{";

  if (tipo != "undefined" && tipo != "")
    filtro += '"tipo":' + '"' + tipo + '",';

  if (estatus != "undefined" && estatus != "")
    filtro += '"estatus":' + '"' + estatus + '",';

  if (naviera != "undefined" && naviera != "")
    filtro += '"naviera":{"$in":["' + naviera + '"]},';

  if (finialta != "" && ffinalta) {
    fIni = moment(finialta, "DD-MM-YYYY", true)
      .utc()
      .startOf("day")
      .format();
    fFin = moment(ffinalta, "DD-MM-YYYY", true)
      .utc()
      .endOf("day")
      .format();

    filtro +=
      '"fAlta":{ "$gte":' +
      '"' +
      fIni +
      '"' +
      ', "$lte":' +
      '"' +
      fFin +
      '"' +
      "},";
  }
  if (filtro != "{") filtro = filtro.slice(0, -1);
  filtro = filtro + "}";
  var json = JSON.parse(filtro);
  Liberaciones.find(json)
    .populate("naviera", "razonSocial nombreComercial")
    .populate("agencia", "razonSocial nombreComercial")
    .populate("cliente", "razonSocial nombreComercial")
    .populate("viaje", "viaje")
    .populate("usuarioAlta", "nombre email role")
    .populate("contenedores.maniobra", "contenedor tipo estatus grado")
    .exec((err, liberacion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando liberacion",
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        liberacion: liberacion,
        total: liberacion.length
      });
    });
});

// =======================================
// Crear liberaciones
// =======================================
app.post("/liberacion_bk/", mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var liberacion;
  liberacion = new Liberaciones({
    // agencia: body.agencia,
    naviera: body.naviera,
    transportista: body.transportista,
    cliente: body.cliente,
    observaciones: body.observaciones,
    correo: body.correo,
    contenedores: body.contenedores,
    tipo: body.tipo,
    blBooking: body.blBooking,
    facturarA: body.facturarA,
    rfc: body.rfc,
    razonSocial: body.razonSocial,
    calle: body.razonSocial,
    noExterior: body.noExterior,
    noInterior: body.noInterior,
    colonia: body.colonia,
    municipio: body.municipio,
    ciudad: body.ciudad,
    estado: body.estado,
    cp: body.cp,
    estatus: body.estatus,
    correoFac: body.correoFac,
    credito: body.credito,
    rutaComprobante: body.rutaComprobante,
    usuarioAlta: req.usuario._id
  });

  if (!liberacion.credito && liberacion.rutaComprobante != "..") {
    variasBucket.MoverArchivoBucket(
      "temp/",
      liberacion.rutaComprobante,
      "liberaciones_bk/"
    );
  } else {
    liberacion.rutaComprobante = undefined;
  }
  liberacion.save((err, liberacionGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear liberacion",
        errors: err
      });
    }

    body.contenedores.forEach(function(c) {
      if (c.transportista == null) {
        liberacion.estatus = "ESPERA";
      } else {
        liberacion.estatus = "NA";
      }
    });

    res.status(201).json({
      ok: true,
      liberacion: liberacionGuardado
    });
  });
});

// ==========================================
// Actualizar Liberacion
// ==========================================
app.put("/liberacion_bk/:id", mdAutenticacion.verificaToken, (req, res) => {
  console.log('entre');
  var id = req.params.id;
  var body = req.body;

  Liberaciones.findById(id, (err, liberacion) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar Liberacion",
        errors: err
      });
    }
    if (!liberacion) {
      return res.status(400).json({
        ok: false,
        mensaje: "La solicitud con el id" + id + "no existe",
        errors: { message: "No existe liberación con ese ID" }
      });
    }
    if (liberacion.estatus === "APROBADA") {
      return res.status(400).json({
        ok: false,
        mensaje:
          "La liberacion ha sido aprobada con anterioridad y no puede ser modificada.",
        errors: {
          message:
            "La liberación ha sido aprobada con anterioridad y no puede ser modificada."
        }
      });
    }
    liberacion.blBooking = body.blBooking;
    liberacion.transportista = body.transportista;
    liberacion.cliente = body.cliente;
    liberacion.facturarA = body.facturarA;
    liberacion.observaciones = body.observaciones;
    liberacion.correo = body.correo;
    liberacion.contenedores = body.contenedores;
    liberacion.facturarA = body.facturarA;
    liberacion.rfc = body.rfc;
    liberacion.razonSocial = body.razonSocial;
    liberacion.calle = body.razonSocial;
    liberacion.noExterior = body.noExterior;
    liberacion.noInterior = body.noInterior;
    liberacion.colonia = body.colonia;
    liberacion.municipio = body.municipio;
    liberacion.ciudad = body.ciudad;
    liberacion.estado = body.estado;
    liberacion.cp = body.cp;
    liberacion.estatus = body.estatus;
    liberacion.credito = body.credito;
    correoFac = body.correoFac;
    liberacion.fMod = Date.now();
    liberacion.usuarioMod = req.usuario._id;

    if (
      !liberacion.credito &&
      body.rutaComprobante != ".." &&
      liberacion.rutaComprobante != body.rutaComprobante
    ) {
      if (
        variasBucket.MoverArchivoBucket(
          "temp/",
          body.rutaComprobante,
          "liberaciones/"
        )
      ) {
        if (
          liberacion.rutaComprobante != null &&
          liberacion.rutaComprobante != undefined &&
          liberacion.rutaComprobante != ""
        ) {
          //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket(
            "liberaciones/",
            liberacion.rutaComprobante
          );
        }
        liberacion.rutaComprobante = body.rutaComprobante;
      }
    }

    liberacion.save((err, liberacionGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar la liberación",
          errors: err
        });
      }


      
      res.status(200).json({
        ok: true,
        liberacion: liberacionGuardado
      });
    });
  });
});

////eliminar liberacion /////

app.delete("/liberacion_bk/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Liberaciones.findById(id, (err, liberacionesBorrada) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al intentar borrar la solicitud",
        errors: err
      });
    }
    if (!liberacionesBorrada) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe solicitud con ese id",
        errors: { message: "No existe solicitud con ese id" }
      });
    }
    if (liberacionesBorrada.estatus == "APROBADA") {
      return res.status(400).json({
        ok: false,
        mensaje:
          "La solicitud no puede ser eliminada porque tiene el estado de " +
          liberacionesBorrada.estatus,
        errors: {
          message:
            "La solicitud no puede ser eliminada porque tiene el estado de " +
            liberacionesBorrada.estatus
        }
      });
    }

    variasBucket.BorrarArchivoBucket(
      "liberacion_bk/",
      liberacionesBorrada.rutaComprobante
    );
    variasBucket.BorrarArchivoBucket(
      "liberacion_bk/",
      liberacionesBorrada.rutaBL
    );

    liberacionesBorrada.remove();
    res.status(200).json({
      ok: true,
      viaje: liberacionesBorrada
    });
  });
});

//OBTENER SOLICITUD POR ID/////////////////////////////////////////

app.get("/liberacion_bk/:id", (req, res) => {
  var id = req.params.id;
  Liberaciones.findById(id)
    .populate("contenedores.maniobra", "contenedor tipo estatus grado")
    .populate(
      "contenedores.transportista",
      "razonSocial nombreComercial correo"
    )
    .populate("cliente", "razonSocial nombreComercial")
    .exec((err, liberacion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar liberacion",
          errors: err
        });
      }
      if (!liberacion) {
        return res.status(400).json({
          ok: false,
          mensaje: "La liberacion con el id " + id + "no existe",
          errors: { message: "No existe una liberacion con ese ID" }
        });
      }
      res.status(200).json({
        ok: true,
        liberacion: liberacion
      });
    });
});

/// obtener liberaciones con includes/////////////////////
app.get("/liberacion_bk/:id/includes", (req, res) => {
  var id = req.params.id;
  Liberaciones.findById(id)
    .populate("naviera", "razonSocial nombreComercial")
    .populate("transportista", "razonSocial nombreComercial")
    .populate("cliente", "razonSocial nombreComercial")
    .populate("buque", "nombre _id")
    .populate("usuarioAlta", "nombre email")
    .populate("usuarioAprobo", "nombre email")
    .populate(
      "contenedores.maniobra",
      "contenedor tipo estatus grado folio solicitud"
    )
    .populate("contenedores.transportista", "razonSocial nombreComercial")
    .exec((err, liberacion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar liberacion",
          errors: err
        });
      }
      if (!liberacion) {
        return res.status(400).json({
          ok: false,
          mensaje: "La liberacion con el id " + id + "no existe",
          errors: { message: "No existe una liberacion con ese ID" }
        });
      }
      res.status(200).json({
        ok: true,
        liberacion: liberacion
      });
    });
});

///actualizar solicitud para transportista /////

app.put(
  "/alta_transportista/:id",
  mdAutenticacion.verificaToken,
  (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Liberaciones.findById(id, (err, liberacion) => {
      console.log(liberacion);
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al actualizar transportista",
          errors: err
        });
      }
      if (!liberacion) {
        return res.status(400).json({
          ok: false,
          mensaje: "La liberacion con el id" + id + "no existe",
          errors: { message: "No exite una liberacion con ese ID " }
        });
      }
      liberacion.contenedores =
        body.contenedores !== "" ? body.contenedores : undefined;
      liberacion.estatus = "NA";
      liberacion.save((err, liberacionGuardado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar liberacion",
            errors: err
          });
        }

        res.status(200).json({
          ok: true,
          liberacion: liberacionGuardado
        });
      });
    });
  }
);

///////// APROBAR SOLICITUD DE LIBERACION /////////////////////////

app.put(
  "/aprobar/aprobaciones_bk/:id",
  mdAutenticacion.verificaToken,
  (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Liberaciones.findById(id, (err, liberacion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar viaje",
          errors: err
        });
      }
      if (!liberacion) {
        return res.status(400).json({
          ok: false,
          mensaje: "La liberacion con el id " + id + " no existe",
          errors: { message: "No existe liberacion con ese ID" }
        });
      }
      //liberacion.contenedores = body.contenedores;
      liberacion.estatus = "APROBADA";
      liberacion.fAprobacion = Date.now();
      liberacion.usuarioAprobo = req.usuario._id;
      liberacion.save((err, liberacionGuardado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar la liberacion",
            errors: err
          });
        }

        res.status(200).json({
          ok: true,
          liberacion: liberacionGuardado
        });
      });
    });
  }
);

// ==========================================
//  Envia correo
// ==========================================
app.get("/liberacion/:id/enviacorreo", (req, res) => {
  var id = req.params.id;
  Liberaciones.findById(id)
    .populate("cliente", "rfc razonSocial nombreComercial")
    // .populate('contenedores.maniobra', 'folio grado transportista')
    .populate({
      path: "contenedores.maniobra",
      select: "folio grado",
      populate: {
        path: "transportista",
        select: "razonSocial nombreComercial correo"
      }
    })
    // .populate('contenedores.maniobra.transportista', 'razonSocial nombreComercial correo')
    .exec((err, liberacion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar liberacion",
          errors: err
        });
      }
      if (!liberacion) {
        return res.status(400).json({
          ok: false,
          mensaje: "La liberacion con el id " + id + "no existe",
          errors: { message: "No existe una liberacion con ese ID" }
        });
      } else {
        if (liberacion.estatus === "APROBADA") {
          var tipo = liberacion.tipo == "C" ? "Carga" : "TIPO";

          //Agrupo por transportista
          var agrupado = varias.groupArray2(
            liberacion.contenedores,
            "maniobra",
            "transportista"
          );

          //for a cada grupo
          for (var g in agrupado) {
            var cuerpoCorreo = `${liberacion.naviera.razonSocial} ha solicitado en nombre de ${liberacion.cliente.razonSocial} las siguientes ${tipo}s: 
            
            `;

            agrupado[g].forEach(contenedor => {
              if (contenedor.maniobra.folio) {
                cuerpoCorreo += `Folio: ${contenedor.maniobra.folio} `;
              }
              if (contenedor.contenedor) {
                cuerpoCorreo += `Contenedor: ${contenedor.contenedor} `;
              }
              if (contenedor.tipo) {
                cuerpoCorreo += `Tipo: ${contenedor.tipo} `;
              }

              if (contenedor.maniobra.grado) {
                cuerpoCorreo += `Grado: ${contenedor.maniobra.grado} 
                `;
              }
              cuerpoCorreo += `http://reimcontainerpark.com.mx/#/liberacion_transportista/${liberacion._id}`;

              cuerpoCorreo += `
            
            `;
            });

            var correos = "";
            var error = "";
            if (liberacion.correo === "" || liberacion.correo === undefined) {
              error += "liberacion - ";
            } else {
              correos += liberacion.correo + ",";
            }

            if (
              agrupado[g][0].transportista.correo === "" ||
              agrupado[g][0].transportista.correo === undefined
            ) {
              error += "Transportista - ";
            } else {
              correos += agrupado[g][0].transportista.correo + ",";
            }

            // if (liberacion.agencia.correo === '' || liberacion.agencia.correo === undefined) {
            //   error += 'Agencia - '
            // } else { correos += liberacion.agencia.correo; }

            if (correos != null) {
              if (correos.endsWith(",")) {
                correos = correos.substring(0, correos.length - 1);
              }

              sentMail(
                agrupado[g][0].maniobra.transportista.razonSocial,
                "rgarcia@tlreim.com.mx",
                "liberacion de " + tipo + " Aprobada",
                cuerpoCorreo,
                "emailAlert"
              );

              // sentMail(agrupado[g][0].maniobra.transportista.razonSocial, correos,
              //   'liberacion de ' + tipo + ' Aprobada', cuerpoCorreo, 'emailAlert');
            }
          }
        }
      }

      if (error != "" && error != undefined) {
        if (error.trim().endsWith("-")) {
          error = error.trim().substring(0, error.length - 3);
        }
      }

      var mensaje = "";
      if (error != "" && error != undefined && error.length > 0) {
        mensaje =
          "No se enviará el correo a " +
          error +
          " por que no cuenta con correo y solo se enviará a " +
          correos;
      }

      res.status(200).json({
        ok: true,
        mensaje: mensaje,
        liberacion: liberacion
      });
    });
});

module.exports = app;
