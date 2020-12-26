var fs = require('fs');

var Maniobra = require('../models/maniobra');
var maniobras = require('../routes/maniobras');

exports.ParamsToJSON = function ParamsToJSON(req) {
  var json;
  var filtro = '{';
  // console.log(req.params)
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
    console.log(filtro)
    var json = JSON.parse(filtro);
    //console.log(json)
    //console.log(req.params);
  } else {
    // console.log('La URL no tiene parametros');
    return;
  }

  return json;
}

//Función para agrupa desde un array pasando data y el campo a filtrar, si es un objeto puede pasar el objeto completo
exports.groupArray = function groupArray(dataSource, field) {
  return dataSource.reduce(function (groups, x) {
    (groups[x[field]] = groups[x[field]] || []).push(x);
    return groups;
  }, {});
};

//Función para agrupa desde un array pasando data, el campo padre y un subcampo hijo, si es un objeto el campo hijo
//se puede pasar el objeto completo. (Este metodo sirve para cuando tienes que agrupar por un campo que esta un populate dentro de otro populate)
// Ej. solicitud.maniobra.transportista (datasource, maniobra, transportista).
exports.groupArray2 = function groupArray(dataSource, field, subfield) {
  return dataSource.reduce(function (groups, x) {
    (groups[x[field][subfield]] = groups[x[field][subfield]] || []).push(x);
    return groups;
  }, {});
};

exports.zFill = function zfill(number, width) {
  var numberOutput = Math.abs(number); /* Valor absoluto del número */
  var length = number.toString().length; /* Largo del número */
  var zero = "0"; /* String de cero */

  if (width <= length) {
    if (number < 0) {
      return ("-" + numberOutput.toString());
    } else {
      return numberOutput.toString();
    }
  } else {
    if (number < 0) {
      return ("-" + (zero.repeat(width - length)) + numberOutput.toString());
    } else {
      return ((zero.repeat(width - length)) + numberOutput.toString());
    }
  }
}

exports.creaArchivoTXT = function creaArchivoTXT(ruta, contenido) {
  return new Promise((resolve, reject) => {
    fs.writeFile(ruta, contenido, function (err) {
      if (err) {
        reject(err);
      }
      else {
        resolve(ok = true)
      }
    });
  });
}
// getGaps(BinaryArray, [])
exports.getGaps = function getGaps(BinaryArray, gaps) {
  console.log('BinaryArray ' + BinaryArray);

  // finding the first one via its index
  const firstOne = BinaryArray.indexOf("1");
  console.log("firstOne " + firstOne);
  if (firstOne > -1) {
    // new array created taking a slice of original array 
    // from the index of the firstOne + 1 index
    let NewBinaryArray = BinaryArray.slice(firstOne + 1);
    console.log("NewBinaryArray " + NewBinaryArray);
    // finding second one via its index in new array slice
    const secondOne = NewBinaryArray.indexOf("1");
    console.log("secondOne " + secondOne);
    // accounting for no zeros
    if (secondOne > 0) {
      // adding 2 to our gaps array
      gaps.push(secondOne);
      console.log("gaps " + gaps);
    }

    // Pass array minus second one and gaps array
    return getGaps(NewBinaryArray.slice(secondOne + 1), gaps);
  }

  // if gaps array length is empty return 0
  // otherwise return largest value in array
  return (gaps.length > 0) ? Math.max.apply(Math, gaps) : 0;
}
