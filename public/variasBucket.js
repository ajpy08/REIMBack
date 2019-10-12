var AWS = require('aws-sdk');
var configuracion = require('../config/config');

exports.SubirArchivoBucket = function SubirArchivoBucket(archivo, rutaDestino, nombreArchivo) {
  return new Promise((resolve, reject) => {
    var s3 = new AWS.S3(configuracion.CONFIG_BUCKET);
    var params = {
      Bucket: configuracion.BUCKET,
      Body: archivo.data,
      Key: rutaDestino + nombreArchivo,
      ContentType: archivo.mimetype
    };

    s3.upload(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      }
      if (data) {
        console.log("Uploaded in:", data.Location);
        resolve(true);
      }
    });
  });
};

exports.MoverArchivoBucket = function MoverArchivoBucket(rutaTmp, nameTmp, rutaDestino) {
  if (nameTmp != null && nameTmp != undefined && nameTmp != '') {
    var s3 = new AWS.S3(configuracion.CONFIG_BUCKET);
    var params = {
      Bucket: configuracion.BUCKET,
      CopySource: configuracion.BUCKET + '/' + rutaTmp + nameTmp,
      Key: rutaDestino + nameTmp
    };
    s3.copyObject(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        console.log('Archivo movido ' + rutaDestino + nameTmp);
        //Si se mueve, borro el original
        var paramsDelete = {
          Bucket: configuracion.BUCKET,
          Key: rutaTmp + nameTmp
        };
        s3.deleteObject(paramsDelete, function(err, data) {
          if (err) {
            console.log("Error", err);
          }
          if (data) {
            console.log("Elemento eliminado:", rutaTmp + nameTmp);
          }
        });
      }
    });
  }
  return (true);
};

exports.BorrarArchivoBucket = function BorrarArchivoBucket(ruta, name) {
  if (name != null && name != undefined && name != '') {
    var s3 = new AWS.S3(configuracion.CONFIG_BUCKET);
    var paramsDelete = {
      Bucket: configuracion.BUCKET,
      Key: ruta + name
    };
    s3.deleteObject(paramsDelete, function(err, data) {
      if (err) {
        console.log("Error", err);
      }
      if (data) {
        console.log("Elemento eliminado:", ruta + name);
      }
    });
  }
};