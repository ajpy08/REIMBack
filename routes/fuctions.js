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
        } else {
            valor = valorUnitarioSplit[1].padEnd(6, 0);
            ValorUnitario = valorUnitarioSplit[0] + '.' + valor
        }
    }
    separador = '';
    return ValorUnitario;
}

let ValorS = '';
let total = '';
let totalF = '';
function splitStart(valorSplit) { // SIRVE PARA CORTAR A DOS CECIMALES Y SI NO TIENE DECIAL LE COLOCAL 2 00
    separador = valorSplit.toString().indexOf('.');
    if (separador != -1) {
        total = valorSplit.toString().split('.');
        totalF = total[1].substr(0, 2);
        ValorS = total[0] + '.' + totalF;
        if (totalF === '' || totalF.length < 2) {
            totalF = total.padStart(2, 0);
            ValorS = total[0] + '.' + totalF
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

exports.punto = punto;
exports.splitEnd = splitEnd;
exports.splitStart = splitStart;
exports.cantidad = cantidad;