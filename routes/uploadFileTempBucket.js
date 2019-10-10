// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var configuracion = require('../config/config');
const uuid = require('uuid/v1');
const AWS = require('aws-sdk');

AWS.config.update(configuracion.CONFIG_BUCKET);
var s3 = new AWS.S3();

// Inicializar variables
var app = express();
app.use(fileUpload());

app.put('/', (req, res) => {

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No selecciono nada',
      errors: { message: 'Debe de seleccionar un archivo' }
    });
  }

  var archivo = req.files.file;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];
  var extensionesValidas = ['pdf', 'png', 'jpg', 'gif', 'jpeg'];
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extension no válida',
      errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
    });
  }
  var nombreArchivo = `${uuid()}.${extensionArchivo}`;

  console.log('subiendo: ' + nombreArchivo);

  var params = {
    Bucket: 'bucketcontainerpark',
    Body: archivo.data,
    Key: 'temp/' + nombreArchivo,
    ContentType: archivo.mimetype
  };



  s3.upload(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al Subir archivo',
        errors: err
      });
    }
    if (data) {
      console.log("Uploaded in:", data.Location);
      res.status(200).json({
        ok: true,
        mensaje: 'Archivo guardado en tmp',
        nombreArchivo: nombreArchivo,
        path: data.Location
      });
    }
  });

});

module.exports = app;