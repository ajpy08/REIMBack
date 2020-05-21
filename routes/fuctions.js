var fs = require('fs');
var soap = require('soap');
var moment = require('moment');
const path = require('path');
var KEYS = require('../config/config').KEYS

var ok = false;

let tasaOCuotaR = ''
function punto(valor) { // ! SIRVE PARA EL IVA 
    if (valor < 10) {
        tasaOCuotaR = '0.0' + valor + '0000'
    } else {
        tasaOCuotaR = '0.' + valor + '0000'
    }
    return tasaOCuotaR;
}

let valorUnitarioSplit = ''
let ValorUnitario = '';
let valor = '';
var separador = '';
function splitEnd(valorSplit) { // ! SIRVE PARA VALIDAR SI TIENE DECIMALES Y RELLENR DE 0 A LA DERECHA
    separador = valorSplit.toString().indexOf('.');
    if (separador != -1) {
        valorUnitarioSplit = valorSplit.toString().split('.');
        if (valorUnitarioSplit[1].length > 6) {
            ValorUnitario = valorUnitarioSplit[1].substr(0, 6);
            ValorUnitario = valorUnitarioSplit[0] + '.' + ValorUnitario;
        } else {
            valor = valorUnitarioSplit[1].padEnd(6, 0);
            ValorUnitario = valorUnitarioSplit[0] + '.' + valor
        }
    } else {
        ValorUnitario = valorSplit + '.' + '000000'
    }
    separador = '';
    return ValorUnitario;
}

function totalRedondeo(valor) {
    var resp = valor.toString().indexOf('.');
    if (resp != -1) {
        var valores = valor.toString().split('.');
        if (valores[1].length < 2) {
            resp = valores[0] + '.' + valores[1] + '00000';

        } else {
            var red = redondeo(valor)
            var sep = red.toString().indexOf('.');
            if (sep != -1) {
                var valorCortado = red.toString().split('.');
                if (valorCortado[1].length > 6) {
                    resp = valorCortado[1].substr(0, 6);
                    resp = valorCortado[0] + '.' + resp;
                } else {
                    valor = valorCortado[1].padEnd(6, 0);
                    resp = valorCortado[0] + '.' + valor
                }

            } else {
                resp = red + '.' + '000000';
            }
            separador = '';
        }
    } else {
        resp = valor + '.' + '000000';
    }
    return resp;
}

function redondeo(valor) {
    var final = valor.toFixed(2)
    return final
}

let ValorS = '';
var total = '';
let totalF = '';
function splitStart(valorSplit) { // SIRVE PARA CORTAR A DOS CECIMALES Y SI NO TIENE DECIAL LE COLOCAL 2 00
    separador = valorSplit.toString().indexOf('.');
    if (separador != -1) {
        total = valorSplit.toString().split('.');
        totalF = total[1].substr(0, 2);
        ValorS = total[0] + '.' + totalF;
        if (totalF === '' || totalF.length < 2) {
            ValorS = total[0] + '.' + total[1] + '0';
        }
    } else {
        ValorS = valorSplit + '.00';
    }
    separador = '';
    return ValorS;
}

let cantidadF = '';
function cantidad(cantidad) {
    if (cantidad < 10) {
        cantidadF = '0' + cantidad + '.00'
    } else {
        cantidadF = cantidad + '.00'
    }
    return cantidadF;

}





// let count = 0;

// var resultado = {};

// function timbrado(xml, archivo) {
// var archivXML = fs.readFileSync(archivo, 'utf8');
//     var url = 'https://dev.advans.mx/ws/awscfdi.php?wsdl';
//     var key = KEYS.API_KEY;
//     var args = {
//         key: key,
//         cfdi: xml,
//     };
//     soap.createClient(url,(err, cliente) => {
//         if (err) {
//             return err;
//         } else {
//             cliente.timbrar(args, function (err, result) {
//                 count++
//                 if (err) {
//                     log(err, null, count, null);
//                     count = 0;
//                     return
//                 } else {
//                     if (result.return === undefined) {
//                         if (count < 2) {
//                             timbrado(xml)
//                         } else {
//                             log('No se obtuvo respuesta del PAC', archivo, count, 'Sin respuesta');
//                             count = 0;
//                             return
//                         }
//                     } else {
//                         if (result.return.Code.$value == 200) {
//                             ok = true;
//                              resultado = {
//                                 timbre: result.return.Timbre.$value,
//                                 ok: ok
//                             }
//                             return resultado
//                         }
//                     }
//                 }
//             });
//         };
//     });
// }


function log(mensaje, archivo, intentos, respuesta) {
    var Route = path.resolve(__dirname, `../xmlTemp/logCFDI.txt`);
    let fecha = moment().format('DD/MM/YYYY HH:mm');
    fs.writeFile(Route, `
    Fecha: ${fecha}
    Archivo: ${archivo}
    Mensaje Error: ${mensaje}
    Intentos: ${intentos}
    Respuesta: ${respuesta}
    ..........................................................................................`, { flag: 'a' }, function (err) {
        if (err) {
            console.log('Error al Escribir en el LOG_CFDI');
        }
    });
}


function cadenaOriginalComplemeto(version, uuid, fecha, rfcProvedor, selloDigitalEmisor, NoSerieSat) {
    let cadenaOriginalComplemetoDeCertificadoDigital = `||${version}|${uuid}|${fecha}|${rfcProvedor}|${selloDigitalEmisor}|${NoSerieSat}||`
    return cadenaOriginalComplemetoDeCertificadoDigital;
}



exports.punto = punto;
exports.splitEnd = splitEnd;
exports.splitStart = splitStart;
exports.redondeo = redondeo;
exports.totalRedondeo = totalRedondeo;
exports.cantidad = cantidad;
exports.log = log;
exports.cadenaOriginalComplemeto = cadenaOriginalComplemeto;

