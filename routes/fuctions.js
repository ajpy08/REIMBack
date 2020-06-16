var fs = require('fs');
var moment = require('moment');
const path = require('path');
const ti = require('../config/config').correosTI
const sentMail = require('../routes/sendAlert');

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
                    valor = valorCortado[1].padEnd(2, '0');
                    resp = valorCortado[0] + '.' + valor
                }

            } else {
                resp = red + '.' + '00';
            }
            separador = '';
        }
    } else {
        resp = valor + '.' + '00';
    }
    return resp;
}




let ValorS = '';
var total = '';
let totalF = '';
function splitStart(valorSplit) { // SIRVE PARA CORTAR A DOS DECIMALES Y SI NO TIENE DECIAL LE COLOCAL 2 00
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

function cortado(valor, truc, coma) {
    let totalCor = valor.toString().indexOf('.')
    let resultado = '';
    if (totalCor != -1) {
        totalCor = valor.toString().split('.')
        let total = totalCor[1].substr(0, 2);
        if (truc === 6) {
            resultado = totalCor[0] + '.' + total.substr(0, 6).padEnd(6, '0');
        } else if (truc === 2) {
            if (coma !== undefined) {
                if (totalCor[0] >= '1000') {
                    resultado = totalCor[0].substr(0, 1) + ',' + totalCor[0].substr(1) + '.' + total.substr(0, 2).padStart(2, '0');
                } else if (totalCor[0] >= '10000') {
                    resultado = totalCor[0].substr(0, 2) + ',' + totalCor[0].substr(2) + '.' + total.substr(0, 2).padStart(2, '0')
                } else if (totalCor[0] >= '100000') {
                    resultado = totalCor[0].substr(0, 3) + ',' + totalCor[0].substr(3) + '.' + total.substr(0, 2).padStart(2, '0');
                }
            } else {
                resultado = totalCor[0] + '.' + total.substr(0, 2);
            }
        }
        return resultado
    } else {
        if (coma !== undefined) {
            let value = valor.toString()
            let result = '';
            if (valor < 999) {
                return value + '.' + '00';
            } else if (valor >= 1000) {
                result = value.substr(0, 1) + ',' + value.substr(1) + '.' + '00';
            } else if (valor >= 10000) {
                result = value.substr(0, 2) + ',' + value.substr(2) + '.' + '00';
            } else if (valor >= 100000) {
                result = value.substr(0, 3) + ',' + value.substr(3) + '.' + '00';
            }
            return result;
        } else {
            return valor + '.' + '00'
        }
    }
}


function envioCooreo(mensaje, archivo) {
    let fecha = moment().format('DD/MM/YYYY HH:mm');
    mensaje = `Fecha: ${fecha}
        Archivo: ${archivo}
        Mensaje Error: ${mensaje}`
    sentMail('TI', ti, 'LOG_FACTURACION_TIMBRADO', mensaje, 'emailAlert');
    console.log('correo enviado');
}

async function CorreoFac(mensaje, archivo) {
    await envioCooreo(mensaje, archivo);
    fs.unlink(path.resolve(__dirname, `../xmlTemp/${archivo}`), (err) => {
        if (err) {
            console.log('Error al eliminar archivo sin timbrar XML');
        }
    });
}


function cadenaOriginalComplemeto(version, uuid, fecha, rfcProvedor, selloDigitalEmisor, NoSerieSat) {
    let cadenaOriginalComplemetoDeCertificadoDigital = `||${version}|${uuid}|${fecha}|${rfcProvedor}|${selloDigitalEmisor}|${NoSerieSat}||`
    cadenaOriginalComplemetoDeCertificadoDigital.replace(/(\r\n|\n|\r)/gm, "");
    cadenaOriginalComplemetoDeCertificadoDigital.trim();
    return cadenaOriginalComplemetoDeCertificadoDigital
}
function cadenaOriginalComplemetoPDF(cadena, num) {
    let cadenaOriginalComplemetoDeCertificadoDigital = cadena;
    let cort = '';
    if (num == 1) {
        cort = cadenaOriginalComplemetoDeCertificadoDigital.match(/.{1,126}/g)
    }
    if (num == 2) {
        cort = cadenaOriginalComplemetoDeCertificadoDigital.match(/.{1,100}/g)
    }
    return cort;

}
function QrG(uuid, rfcEmisor, rfcReceptor, total, selloEmisor) {
    const url = 'https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx',
        dataT = QrT_C(total),
        dataS = QrT_C(null, selloEmisor);
    let QrString = '';

    QrString = `${url}${uuid}${rfcEmisor}${rfcReceptor}${dataT}${dataS}`;
    return QrString
}

function QrT_C(valor, cadena) {
    if (valor && !cadena) {
        let total = valor.toString();
        const decimal = valor.toString().indexOf('.');
        if (decimal !== -1) {
            total = total.split('.');
            total = total[0].padStart(10, '0') + '.' + total[1].padStart(6, '0');
        } else {
            total = valor.toString().padStart(10, '0') + '.' + '000000';
        }
        return total;
    } else if (cadena && !valor) {
        let selloEmisorCortado = '';
        if (cadena) {
            selloEmisorCortado = cadena.substr(-8);
        }
        return selloEmisorCortado;
    }
}

//  CONVERTIR NUMERO A LETRAS //
var numeroALetras = (function () {

    // Código basado en https://gist.github.com/alfchee/e563340276f89b22042a
    function Unidades(num) {

        switch (num) {
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

    function Decenas(num) {

        let decena = Math.floor(num / 10);
        let unidad = num - (decena * 10);

        switch (decena) {
            case 1:
                switch (unidad) {
                    case 0: return 'DIEZ';
                    case 1: return 'ONCE';
                    case 2: return 'DOCE';
                    case 3: return 'TRECE';
                    case 4: return 'CATORCE';
                    case 5: return 'QUINCE';
                    default: return 'DIECI' + Unidades(unidad);
                }
            case 2:
                switch (unidad) {
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

        switch (centenas) {
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

        if (strMiles == '')
            return strCentenas;

        return strMiles + ' ' + strCentenas;
    }//Miles()

    function Millones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
        let strMiles = Miles(resto);

        if (strMillones == '')
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

        if (data.enteros == 0)
            return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
        if (data.enteros == 1)
            return Millones(data.enteros) + ' ' + data.letrasMonedaSingular;
        else
            return Millones(data.enteros) + ' ' + data.letrasMonedaPlural;
    };

})();

function impuestos(impuesto) {
    let impuestos = 0;
    if (impuesto >= 10) {
        impuestos = 0 + '.' + impuesto;
    } else {
        impuestos = 0 + '.' + 0 + impuesto;
    }
    return impuestos;
}

function letraT(letra, numero) {
    let letras = '';
    let centavos = numero.toString().indexOf('.')
    if (centavos !== -1) {
        let punto = numero.toString().split('.');
        let valid = punto[1].substr(0, 2)
        if (valid >= '10') {
            centavos = punto[1].substr(0, 2);
        } else {
            centavos =  '0' + punto[1].substr(0, 1)
        }
    } else {
        centavos = '00'
    }
    letras = `${letra}   ${centavos}/100 M.N.`
    return letras
}


exports.punto = punto;
exports.splitEnd = splitEnd;
exports.splitStart = splitStart;
exports.QrG = QrG;
exports.totalRedondeo = totalRedondeo;
exports.cantidad = cantidad;
exports.letraT = letraT;
exports.impuestos = impuestos;
exports.CorreoFac = CorreoFac;
exports.cortado = cortado;
exports.numeroALetras = numeroALetras;
exports.cadenaOriginalComplemeto = cadenaOriginalComplemeto;
exports.cadenaOriginalComplemetoPDF = cadenaOriginalComplemetoPDF;




