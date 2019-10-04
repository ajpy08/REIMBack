//var fs = require('fs');
//var path = require('path');

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

//cconfigurar AWS con las claves de acceso
AWS.config.update({
  accessKeyId: "",
  secretAccessKey: "",
  region: 'us-east-1'
});


var s3 = new AWS.S3();

exports.ParamsToJSON = function ParamsToJSON(req) {
  var json;
  var filtro = '{';
  if (req.params) {
    for (var param in req.params) {
      if (req.params.hasOwnProperty(param)) {
        //console.log(param, req.params[param]);
        if (req.params[param] != '' && req.params[param] != null && req.params[param] != 'undefined') {
          filtro += '\"' + param + '\"' + ':' + '\"' + req.params[param] + '\"' + ',';
        } else {
          // console.log('No se agrego el param ' + param + ' al JSON');
        }
      } else {
        // console.log('No se pudo el hasOwnProperty');
        // return;
      }
    }

    if (filtro != '{') {
      filtro = filtro.slice(0, -1);
      filtro = filtro + '}';
    } else {
      filtro = filtro + '}';
      //return;
    }
    //console.log(filtro)
    var json = JSON.parse(filtro);
    //console.log(json)
    //console.log(req.params);
  } else {
    // console.log('La URL no tiene parametros');
    return;
  }

  return json;
}

// exports.MoverArchivoFromTemp = function MoverArchivoFromTemp(rutaTmp, nametmp, rutaDestino, nameActual) {
//   if (nametmp != null && nametmp != undefined && nametmp != '' && fs.existsSync(rutaTmp + nametmp)) {
//     if (nameActual != null && nameActual != undefined && nameActual != '' && fs.existsSync(rutaDestino + nameActual)) {
//       fs.unlink(rutaDestino + nameActual, (err) => {
//         if (err) {
//           // console.log(err);
//         } else {
//           // console.log('Documento anterior borrado con éxito');
//         }
//       });
//     }
//     if (!fs.existsSync(rutaDestino)) { // CHECAMOS SI EXISTE LA CARPETA CORRESPONDIENTE.. SI NO, LO CREAMOS.
//       fs.mkdirSync(rutaDestino);
//     }
//     fs.rename(rutaTmp + nametmp, rutaDestino + nametmp, (err) => {
//       if (err) { console.log(err); throw err; }
//     });
//     return (true);
//   }
//   return false;
// }


exports.MoverArchivoFromTemp = function MoverArchivoFromTemp(rutaTmp, nametmp, rutaDestino, nameActual) {
  if (nametmp != null && nametmp != undefined && nametmp != '' && fs.existsSync(rutaTmp + nametmp)) {
    // if (nameActual != null && nameActual != undefined && nameActual != '' && fs.existsSync(rutaDestino + nameActual)) {
    //   fs.unlink(rutaDestino + nameActual, (err) => {
    //     if (err) {
    //       // console.log(err);
    //     } else {
    //       // console.log('Documento anterior borrado con éxito');
    //     }
    //   });
    // }
    // if (!fs.existsSync(rutaDestino)) { // CHECAMOS SI EXISTE LA CARPETA CORRESPONDIENTE.. SI NO, LO CREAMOS.
    //   fs.mkdirSync(rutaDestino);
    // }
    // fs.rename(rutaTmp + nametmp, rutaDestino + nametmp, (err) => {
    //   if (err) { console.log(err); throw err; }
    // });

    //configuring parameters
    var params = {
      Bucket: 'bucketcontainerpark',
      Body: fs.createReadStream(rutaTmp + nametmp),
      Key: rutaDestino + nametmp
    };

    s3.upload(params, function(err, data) {
      //handle error
      if (err) {
        console.log("Error", err);
      }

      //success
      if (data) {
        console.log("Uploaded in:", data.Location);
      }
    });

    return (true);
  }
  return false;
}

exports.BorrarArchivo = function BorrarArchivo(ruta, nameFile) {
  if (nameFile != null && nameFile != undefined && nameFile != '' && fs.existsSync(ruta + nameFile)) {
    fs.unlink(ruta + nameFile, (err) => {
      if (err) {
        // console.log(err);
      } else {
        // console.log('Documento borrado con éxito');
      }
    });
  }
}


exports.DevuelveRutaFotosLR = function DevuelveRutaFotosLR(idManiobra, lavado_reparacion) {
  var pathFotos = "";
  if (lavado_reparacion === 'L') {
    pathFotos = path.resolve(__dirname, `../uploads/maniobras/${idManiobra}/fotos_lavado/`);
    return pathFotos;
  } else {
    if (lavado_reparacion === 'R') {
      pathFotos = path.resolve(__dirname, `../uploads/maniobras/${idManiobra}/fotos_reparacion/`);
      return pathFotos;
    }
    return pathFotos;
  }
}