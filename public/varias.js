var fs = require('fs');

exports.MoverArchivoFromTemp = function MoverArchivoFromTemp(rutaTmp, nametmp, rutaDestino, nameActual) {
  if (nametmp != null && nametmp != undefined && nametmp != '' && fs.existsSync(rutaTmp + nametmp)) {
    if (nameActual != null && nameActual != undefined && nameActual != '' && fs.existsSync(rutaDestino + nameActual)) {
      fs.unlink(rutaDestino + nameActual, (err) => {
        if (err) {
          // console.log(err);
        } else {
          // console.log('Documento anterior borrado con éxito');
        }
      });
    }
    if (!fs.existsSync(rutaDestino)) { // CHECAMOS SI EXISTE LA CARPETA CORRESPONDIENTE.. SI NO, LO CREAMOS.
      fs.mkdirSync(rutaDestino);
    }
    fs.rename(rutaTmp + nametmp, rutaDestino + nametmp, (err) => {
      if (err) { console.log(err); throw err; }
    });
    return (true);
  }
  return false;
};

exports.BorrarArchivo = function BorrarArchivo(ruta, nameFile) {
  if (nameFile != null && nameFile != undefined && nameFile != '' && fs.existsSync(ruta + nameFile)) {
    fs.unlink(ruta + nameFile, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Documento borrado con éxito');
      }
    });
  }
};




// exports.ParamsToJSON = function ParamsToJSON(req) {
//   var json;
//   var filtro = '{';
//   if (req.params) {
//     for (var param in req.params) {
//       if (req.params.hasOwnProperty(param)) {
//         //console.log(param, req.params[param]);
//         if (req.params[param] != '' && req.params[param] != null && req.params[param] != 'undefined') {
//           filtro += '\"' + param + '\"' + ':' + '\"' + req.params[param] + '\"' + ',';
//         } else {
//           // console.log('No se agrego el param ' + param + ' al JSON');
//         }
//       } else {
//         // console.log('No se pudo el hasOwnProperty');
//         // return;
//       }
//     }

//     if (filtro != '{') {
//       filtro = filtro.slice(0, -1);
//       filtro = filtro + '}';
//     } else {
//       filtro = filtro + '}';
//       //return;
//     }
//     //console.log(filtro)
//     var json = JSON.parse(filtro);
//     //console.log(json)
//     //console.log(req.params);
//   } else {
//     // console.log('La URL no tiene parametros');
//     return;
//   }

//   return json;
// }