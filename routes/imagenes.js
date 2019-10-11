// Requires
var express = require('express');
var varias = require('../public/varias');
var configuracion = require('../config/config');
var app = express();
var path = require('path');
var fs = require('fs');
const AWS = require('aws-sdk');



app.get('/:tipo/:img', (req, res, netx) => {

  var tipo = req.params.tipo;
  var img = req.params.img;
  var s3 = new AWS.S3(configuracion.CONFIG_BUCKET);
  const params = {
    Bucket: "bucketcontainerpark",
    Key: tipo + '/' + img
  };

  s3.getObject(params, (err, data) => {
    if (err) {
      console.error('ERROR EN CALLBACK ' + tipo + '/' + img);
      var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
      res.sendFile(pathNoImagen);
    } else {
      res.setHeader('Content-disposition', 'atachment; filename=' + img);
      res.setHeader('Content-length', data.ContentLength);
      res.send(data.Body);
    }
  });
});

// // Recupera Fotos de Maniobra (Lavado o Reparacion)
// app.get('/:id/:LR/:img', (req, res, netx) => {
//   var id = req.params.id;
//   var img = req.params.img;
//   var LR = req.params.LR;

//   var pathImagen = path.resolve(__dirname, `../uploads/maniobras/${id}/${LR}/${img}`);
//   if (fs.existsSync(pathImagen)) {
//     res.sendFile(pathImagen);
//   } else {
//     var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
//     res.sendFile(pathNoImagen);
//   }
// });

// Recupera Fotos de Maniobra (Lavado o Reparacion)
app.get('/maniobra', (req, res, netx) => {

  var img = req.query.ruta;

  console.error('buscando foto lavado reparacion');
  var s3 = new AWS.S3(configuracion.CONFIG_BUCKET);
  const params = {
    Bucket: "bucketcontainerpark",
    Key: img
  };

  s3.getObject(params, (err, data) => {
    if (err) {
      console.error('ERROR EN CALLBACK ' + img);
      var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
      res.sendFile(pathNoImagen);
    } else {
      res.setHeader('Content-length', data.ContentLength);
      res.send(data.Body);
    }
  });


});

// Fotos Lavados y Reparaciones de la carpeta
app.get('/maniobra/:Id/listaImagenes/:LR/', (req, res, netx) => {
  var idManiobra = req.params.Id;
  var lavado_reparacion = req.params.LR;
  var pathFotos = "";
  var array = [];
  console.log('buscando fotos');
  if (lavado_reparacion === 'L') {
    pathFotos = `maniobras/${idManiobra}/fotos_lavado/`;

  } else {
    if (lavado_reparacion === 'R') {
      pathFotos = `maniobras/${idManiobra}/fotos_reparacion/`;
    }
  }

  var s3 = new AWS.S3(configuracion.CONFIG_BUCKET);
  const params = {
    Bucket: "bucketcontainerpark",
    // Delimiter: 'STRING_VALUE',
    // EncodingType: url,
    // Marker: 'STRING_VALUE',
    // MaxKeys: 'NUMBER_VALUE',
    Prefix: pathFotos,
    // RequestPayer: requester
  };

  s3.listObjects(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encontraron fotos',
        errors: { message: 'No existen fotos para maniobra con ID: ' + idManiobra }
      });
    } else {
      //console.log(data.Contents); // successful response
      res.status(200).json({
        ok: true,
        //fotos: JSON.parse(JSON.stringify(array)),
        fotos: data.Contents,
        total: data.Contents.length
      });
    }
  });
});


// // Fotos Lavados y Reparaciones de la carpeta
// app.get('/:maniobra&:LR', (req, res, netx) => {
//   var idManiobra = req.params.maniobra;
//   var lavado_reparacion = req.params.LR;
//   var pathFotos = "";
//   var array = [];

//   pathFotos = varias.DevuelveRutaFotosLR(idManiobra, lavado_reparacion);

//   if (pathFotos !== "" && fs.existsSync(pathFotos)) {
//     fs.readdir(pathFotos, function(err, files) {
//       var allowedExtensions = /(.jpg|.jpeg|.png|.gif)$/i;
//       var a = files.filter(function(file) { return allowedExtensions.exec(file); })
//       a.forEach(foto => {
//         var data = {
//           name: foto,
//           source: pathFotos + '\\' + foto
//         };
//         array.push(data)
//       });

//       res.status(200).json({
//         ok: true,
//         fotos: JSON.parse(JSON.stringify(array)),
//         total: array.length
//       });
//       // res.json(array)
//     });
//   } else {
//     // return res.status(400).json({
//     //     ok: false,
//     //     mensaje: 'No se encontraron fotos',
//     //     errors: { message: 'No existen fotos para ' + lavado_reparacion }
//     // });
//   }
// });

// export
module.exports = app;