'use strict'

const CFDI = require('./index').CFDI
const Emisor = require('./index').Emisor
const Receptor = require('./index').Receptor
const Concepto = require('./index').Concepto
const CuentaPredial = require('./index').CuentaPredial
const InformacionAduanera = require('./index').InformacionAduanera
const CfdiRelacionado = require('./index').CfdiRelacionado
const Traslado = require('./index').Traslado
const Retencion = require('./index').Retencion
const Parte = require('./index').Parte

const cfdi = new CFDI({
  //'Serie': 'A',
  //'Folio': '167ABC',
  'Fecha': '2018-06-11T08:09:23',
  'NoCertificado': '20001000000300022815',
  'SubTotal': '1000',
  'Moneda': 'MXN',
  'Total': '1160',
  'TipoDeComprobante': 'I',
  'FormaPago': '01',
  'MetodoPago': 'PUE',
  //'CondicionesDePago': 'CONDICIONES',
  'TipoCambio': '1',
  'LugarExpedicion': '45079',
});

cfdi.cer = './test/resources/LAN7008173R5.cer.pem'
cfdi.key = './test/resources/LAN7008173R5.key.pem'
cfdi.withOutCerts = false

/*cfdi.add(new CfdiRelacionado({
  'UUID': 'A39DA66B-52CA-49E3-879B-5C05185B0EF7'
}, {
  'TipoRelacion': '01'
}))*/

/*cfdi.add(new CfdiRelacionado({
  'UUID': 'A39DA66B-52CA-49E3-879B-5C05185B0EF7'
}, {
  'TipoRelacion': '01'
}))*/

cfdi.add(new Emisor({
  'Rfc': 'LAN7008173R5',
  'Nombre': 'CESAR RENE AGUILERA ARREOLA',
  'RegimenFiscal': '601'
}))

cfdi.add(new Receptor({
  'Rfc': 'HEPR930322977',
  //'Nombre': 'RAFAEL ALEJANDRO HERNÁNDEZ PALACIOS',
  //'ResidenciaFiscal': 'MEX',
  //'NumRegIdTrib': '0000000000000',
  'UsoCFDI': 'G01'
}))

const concepto = new Concepto({
  'ClaveProdServ': '01010101',
  'ClaveUnidad': 'F52',
  'NoIdentificacion': '00001',
  'Cantidad': '1',
  'Unidad': 'TONELADA',
  'Descripcion': 'ACERO',
  'ValorUnitario': '1000',
  'Importe': '1000'
})

concepto.add(new Traslado({
  'Base': '1000',
  'Impuesto': '002',
  'TipoFactor': 'Tasa',
  'TasaOCuota': '0.16',
  'Importe': '160'
}))

/*
concepto.add(new Retencion({
  'Base': '17000',
  'TipoFactor': 'Tasa',
  'TasaOCuota': '0.530000',
  'Impuesto': '002',
  'Importe': '2720'
}))
*/

/*concepto.add(new CuentaPredial({
  'Numero': '00156789'
}))

const parte = new Parte ({
  'ClaveProdServ': '01010101',
  'NoIdentificacion': '00001',
  'Cantidad': '1.5',
  'Unidad': 'TONELADA',
  'Descripcion': 'ACERO',
  'ValorUnitario': '1500000',
  'Importe': '2250000'
})

parte.add(new InformacionAduanera({
  'NumeroPedimento': '10  00  1231  0034567'
}))
*/
//concepto.add(parte)

cfdi.add(concepto)

cfdi.add(new Traslado({
  'Impuesto': '002',
  'TipoFactor': 'Tasa',
  'TasaOCuota': '0.16',
  'Importe': '160'
}, {}, {
  'TotalImpuestosTrasladados': '160.00'
}))

cfdi.getXml()
.then(xml => console.log(xml))
.catch(e => console.log(e.toString(), '---> e'));

/*
cfdi.getCadenaOriginal()
  .then(data => {
    console.log('OK' + data)
  })
  .catch(err => {
    console.log('ERR' + err)
  })
  */