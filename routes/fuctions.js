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
    return cadenaOriginalComplemetoDeCertificadoDigital.replace(/(\r\n|\n|\r)/gm, "");
}


//  CONVERTIR NUMERO A LETRAS //

var numeroALetras = (function() {

    // Código basado en https://gist.github.com/alfchee/e563340276f89b22042a
        function Unidades(num){
    
            switch(num)
            {
                case 1: return 'UN';
                case 2: return 'DOS';
                case 3: return 'TRES';
                case 4: return 'CUATRO';
                case 5: return 'CINCO';
                case 6: return 'SEIS';
                case 7: return 'SIETE';
                case 8: return 'OCHO';
                case 9: return 'NUEVE';
            }
    
            return '';
        }//Unidades()
    
        function Decenas(num){
    
            let decena = Math.floor(num/10);
            let unidad = num - (decena * 10);
    
            switch(decena)
            {
                case 1:
                    switch(unidad)
                    {
                        case 0: return 'DIEZ';
                        case 1: return 'ONCE';
                        case 2: return 'DOCE';
                        case 3: return 'TRECE';
                        case 4: return 'CATORCE';
                        case 5: return 'QUINCE';
                        default: return 'DIECI' + Unidades(unidad);
                    }
                case 2:
                    switch(unidad)
                    {
                        case 0: return 'VEINTE';
                        default: return 'VEINTI' + Unidades(unidad);
                    }
                case 3: return DecenasY('TREINTA', unidad);
                case 4: return DecenasY('CUARENTA', unidad);
                case 5: return DecenasY('CINCUENTA', unidad);
                case 6: return DecenasY('SESENTA', unidad);
                case 7: return DecenasY('SETENTA', unidad);
                case 8: return DecenasY('OCHENTA', unidad);
                case 9: return DecenasY('NOVENTA', unidad);
                case 0: return Unidades(unidad);
            }
        }//Unidades()
    
        function DecenasY(strSin, numUnidades) {
            if (numUnidades > 0)
                return strSin + ' Y ' + Unidades(numUnidades)
    
            return strSin;
        }//DecenasY()
    
        function Centenas(num) {
            let centenas = Math.floor(num / 100);
            let decenas = num - (centenas * 100);
    
            switch(centenas)
            {
                case 1:
                    if (decenas > 0)
                        return 'CIENTO ' + Decenas(decenas);
                    return 'CIEN';
                case 2: return 'DOSCIENTOS ' + Decenas(decenas);
                case 3: return 'TRESCIENTOS ' + Decenas(decenas);
                case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
                case 5: return 'QUINIENTOS ' + Decenas(decenas);
                case 6: return 'SEISCIENTOS ' + Decenas(decenas);
                case 7: return 'SETECIENTOS ' + Decenas(decenas);
                case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
                case 9: return 'NOVECIENTOS ' + Decenas(decenas);
            }
    
            return Decenas(decenas);
        }//Centenas()
    
        function Seccion(num, divisor, strSingular, strPlural) {
            let cientos = Math.floor(num / divisor)
            let resto = num - (cientos * divisor)
    
            let letras = '';
    
            if (cientos > 0)
                if (cientos > 1)
                    letras = Centenas(cientos) + ' ' + strPlural;
                else
                    letras = strSingular;
    
            if (resto > 0)
                letras += '';
    
            return letras;
        }//Seccion()
    
        function Miles(num) {
            let divisor = 1000;
            let cientos = Math.floor(num / divisor)
            let resto = num - (cientos * divisor)
    
            let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
            let strCentenas = Centenas(resto);
    
            if(strMiles == '')
                return strCentenas;
    
            return strMiles + ' ' + strCentenas;
        }//Miles()
    
        function Millones(num) {
            let divisor = 1000000;
            let cientos = Math.floor(num / divisor)
            let resto = num - (cientos * divisor)
    
            let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
            let strMiles = Miles(resto);
    
            if(strMillones == '')
                return strMiles;
    
            return strMillones + ' ' + strMiles;
        }//Millones()
    
        return function NumeroALetras(num, currency) {
            currency = currency || {};
            let data = {
                numero: num,
                enteros: Math.floor(num),
                centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
                letrasCentavos: '',
                letrasMonedaPlural: currency.plural || 'PESOS',//'PESOS', 'Dólares', 'Bolívares', 'etcs'
                letrasMonedaSingular: currency.singular || 'PESO ', //'PESO', 'Dólar', 'Bolivar', 'etc'
                letrasMonedaCentavoPlural: currency.centPlural || 'PESOS ',
                letrasMonedaCentavoSingular: currency.centSingular || 'PESO'
            };
    
            if (data.centavos > 0) {
                data.letrasCentavos = 'CON ' + (function () {
                        if (data.centavos == 1)
                            return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
                        else
                            return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
                    })();
            };
    
            if(data.enteros == 0)
                return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
            if (data.enteros == 1)
                return Millones(data.enteros) + ' ' + data.letrasMonedaSingular ;
            else
                return Millones(data.enteros) + ' ' + data.letrasMonedaPlural;
        };
    
    })();


exports.punto = punto;
exports.splitEnd = splitEnd;
exports.splitStart = splitStart;
exports.redondeo = redondeo;
exports.totalRedondeo = totalRedondeo;
exports.cantidad = cantidad;
exports.log = log;
exports.numeroALetras = numeroALetras;
exports.cadenaOriginalComplemeto = cadenaOriginalComplemeto;

