## CFDi33 para NodeJS

Fork de @blacktrue para la generacion de cfdi 3.3, ¡un excelente trabajo! 

En mi version se hicieron correcciones de un par de errores de rutas dinamicas y agregado de complemento de pago 2018. 

## Instalación 

```
npm i @alexotano/cfdi33
```

## Ejemplo de uso Factura

```javascript
'use strict'

const CFDI = require('@alexotano/cfdi33').CFDI
const Emisor = require('@alexotano/cfdi33').Emisor
const Receptor = require('@alexotano/cfdi33').Receptor
const Concepto = require('@alexotano/cfdi33').Concepto
const CuentaPredial = require('@alexotano/cfdi33').CuentaPredial
const InformacionAduanera = require('@alexotano/cfdi33').InformacionAduanera
const CfdiRelacionado = require('@alexotano/cfdi33').CfdiRelacionado
const Traslado = require('@alexotano/cfdi33').Traslado
const Retencion = require('@alexotano/cfdi33').Retencion

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

cfdi.cer = './test/resources/XXXXXXXXXXXX.cer.pem'
cfdi.key = './test/resources/XXXXXXXXXXXX.key.pem'
cfdi.withOutCerts = false

/*
cfdi.add(new CfdiRelacionado({
  'UUID': 'A39DA66B-52CA-49E3-879B-5C05185B0EF7'
}, {
  'TipoRelacion': '01'
}))
*/

cfdi.add(new Emisor({
  'Rfc': 'XXXXXXXX',
  'Nombre': 'NOMBRE APELLIDO',
  'RegimenFiscal': '601'
}))

cfdi.add(new Receptor({
  'Rfc': 'ZZZZZZZZZZZ',
  //'Nombre': 'NOMBRE APELLIDO',
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
.catch(e => console.log(e.toString(), '---> error'));

```

## Ejemplo de uso Complemento de Pago

```javascript
'use strict'

const CFDI = require('@alexotano/cfdi33').CFDI
const Emisor = require('@alexotano/cfdi33').Emisor
const Receptor = require('@alexotano/cfdi33').Receptor
const Concepto = require('@alexotano/cfdi33').Concepto
const CuentaPredial = require('@alexotano/cfdi33').CuentaPredial
const InformacionAduanera = require('@alexotano/cfdi33').InformacionAduanera
const CfdiRelacionado = require('@alexotano/cfdi33').CfdiRelacionado
const Traslado = require('@alexotano/cfdi33').Traslado
const Retencion = require('@alexotano/cfdi33').Retencion

const cfdi = new CFDI({
  //'Serie': 'A',
  //'Folio': '167ABC',
  'Fecha': '2018-06-11T08:09:23',
  'NoCertificado': '20001000000300022815',
  'SubTotal': '1000',
  'Moneda': 'MXN',
  'Total': '1160',
  'TipoDeComprobante': 'P',
  'FormaPago': '01',
  'MetodoPago': 'PUE',
  //'CondicionesDePago': 'CONDICIONES',
  'TipoCambio': '1',
  'LugarExpedicion': '45079',
});

cfdi.cer = './test/resources/LAN7008173R5.cer.pem'
cfdi.key = './test/resources/LAN7008173R5.key.pem'
cfdi.withOutCerts = false

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
  'ClaveProdServ': '84111506',
  'ClaveUnidad': 'ACT',
  'Cantidad': 1,
  'Descripcion': 'Pago',
  'ValorUnitario': 0,
  'Importe': 0
})
		
cfdi.add(concepto)

let complemento = new Complemento()


//SE PUEDE HACER UN CICLO PARA AGREGAR TODOS LOS COMPROBANTES AQUI

let comprobante = {
  IdDocumento: 'A39DA66B-52CA-49E3-879B-OTROCFDI##',
  MonedaDR: 'MXN',
  MetodoDePagoDR: 'PPD',
  NumParcialidad: '1',
  ImpSaldoAnt: 200,
  ImpPagado: 80,
  ImpSaldoInsoluto: 120
}

let pago = {
  MonedaP: 'MXN',
  FormaDePagoP: '01',
  FechaPago: '01-07-2019T22:01:21',
  Monto: 80
}

let version = { Version: "1.0" }

complemento.add(new Pago(comprobante, pago, version))

//------------------


cfdi.add(complemento)

cfdi.getXml()
.then(xml => console.log(xml))
.catch(e => console.log(e.toString(), '---> error'));

```
