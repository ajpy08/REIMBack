var express = require('express');
var entorno = require('../config/config').config();
var app = express();
var path = require('path');
var AWS = require('aws-sdk');
var AWS = require('aws-sdk/global');
var variasBucket = require('../public/variasBucket');
var s3Zip = require('s3-zip');
const fs = require('fs')
const join = require('path').join;

app.get('/documentoxtipo/:tipo/:nombre', (req, res, netx) => {
  var tipo = req.params.tipo;
  var nombreArchivo = req.params.nombre;
  var s3 = new AWS.S3(entorno.CONFIG_BUCKET);

  if (tipo === 'cfdi') {
    tipo += '/xml'
  }
  if (nombreArchivo === 'xxx') {
    res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
  } else {
    var params = {
      Bucket: entorno.BUCKET,
      Key: tipo + '/' + nombreArchivo
    };
    s3.getObject(params, (err, data) => {
      if (err) {
        console.error('ERROR EN CALLBACK ' + tipo + '/' + nombreArchivo);
        res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
      } else {
        res.setHeader('Content-disposition', 'atachment; filename=' + nombreArchivo);
        res.setHeader('Content-length', data.ContentLength);
        res.send(data.Body);
      }
    });
  }
});

// Recupera Foto de Maniobra (Lavado o Reparacion) por medio de la ruta completa..
app.get('/maniobra/lavado_reparacion', (req, res, netx) => {
  var img = req.query.ruta;

  if (!img) {
    res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
  } else {
    var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
    var params = {
      Bucket: entorno.BUCKET,
      Key: img
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        console.error('ERROR EN CALLBACK ' + img);
        res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
      } else {
        res.setHeader('Content-disposition', 'atachment; filename=' + img);
        res.setHeader('Content-length', data.ContentLength);
        res.send(data.Body);
      }
    });
  }
});


//DESCARGAR TODO LA CARPETA DE IMAGENES COMPRIMIDA //
app.get('/maniobra/:id/zipLR/:LR', (req, res, netx) => {
  var idManiobra = req.params.id;
  var lavado_reparacion = req.params.LR;
  var folder = "";

  if (lavado_reparacion === 'L') {
    folder = `maniobras/${idManiobra}/fotos_lavado/`;

  } else {
    if (lavado_reparacion === 'R') {
      folder = `maniobras/${idManiobra}/fotos_reparacion/`;
    }
  }
  var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
  


  var bucket = entorno.BUCKET;

  var params = {
    Bucket: entorno.BUCKET,
    Prefix: folder,
  }

  s3.listObjectsV2(params, function (err, data) {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encontraron fotos',
        errors: { message: 'No existen fotos para la maniobra con ID ' + idManiobra }
      });
    } else {

      const files = [];
      data.Contents.forEach(d => {
        const img = d.Key.substr(d.Key.lastIndexOf('/') + 1, d.Key.length - 1);
        files.push(img);
      });
      // const output = fs.createWriteStream(join(res + `${idManiobra}.zip`));

       s3Zip.archive({ s3: s3 , bucket: bucket , debug: true }, folder, files ).pipe(res, `${idManiobra}.zip`);
      

      
      //  output.on('close', () => {
      //    console.log('Cerrado');
      //    res.download(res.path, 'algo.zip');
      //    return;
      //  });
      //  return;

      //res.send(s3Zip.archive({ region: region, bucket: bucket, debug: true, preserveFolderStructure: true  }, folder, files).pipe(output));
      // res.setHeader('Content-disposition', 'atachment; filename=algo.zip'); 
      // res.setHeader('Content-length',data.Contents);

      // res.status(200).json({
      //   ok:true,
      //   archive: output
      // });
    }
  })
})



// Fotos Lavados y Reparaciones de la carpeta
app.get('/maniobra/:Id/listaImagenes/:LR/', (req, res, netx) => {
  var idManiobra = req.params.Id;
  var lavado_reparacion = req.params.LR;
  var pathFotos = "";
  var array = [];

  if (lavado_reparacion === 'L') {
    pathFotos = `maniobras/${idManiobra}/fotos_lavado/`;
  } else {
    if (lavado_reparacion === 'R') {
      pathFotos = `maniobras/${idManiobra}/fotos_reparacion/`;
    }
  }

  var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
  var params = {
    Bucket: entorno.BUCKET,
    Prefix: pathFotos,
  };

  s3.listObjects(params, function (err, data) {
    if (err) {
      // console.log(err, err.stack);
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encontraron fotos',
        errors: { message: 'No existen fotos para maniobra con ID: ' + idManiobra }
      });
    } else {
      // console.log(data.Contents); // successful response
      res.status(200).json({
        ok: true,
        // fotos: JSON.parse(JSON.stringify(array)),
        fotos: data.Contents,
        total: data.Contents.length
      });
    }
  });
});

// ============================================
//   Borrar Foto de Maniobra LR desde Bucket 
// ============================================
app.get('/maniobra/eliminaFoto', (req, res, netx) => {
  var key = req.query.key;
  variasBucket.BorrarArchivoBucketKey(key)
    .then((value) => {
      if (value) {
        res.status(200).json({
          ok: true,
          mensaje: 'Foto Eliminada!',
        });
      }
    });
});

module.exports = app;