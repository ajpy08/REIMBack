var fs = require('fs');

var Maniobra = require('../models/maniobra');
var maniobras = require('../routes/maniobras');

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

//Función para agrupa desde un array siempre y cuando agrupes por _id de alguna entidad.
// exports.agrupaArray = function agrupaArray(array) {
//   const arrayAgrupado =  array.reduce((acc, item) => {
//     (acc[item._id] = acc[item._id] || []).push(item);
//     return acc;
//   }, {});

//   return arrayAgrupado;
// }

//Función para agrupa desde un array pasando data y el campo a filtrar, si es un objeto puede pasar el objeto completo
exports.groupArray = function groupArray(dataSource, field) {
  return dataSource.reduce(function(groups, x) {
    (groups[x[field]] = groups[x[field]] || []).push(x);
    return groups;
  }, {});
};