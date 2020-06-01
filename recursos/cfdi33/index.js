'use strict'

const CFDI = require('./lib/CFDI');
const Emisor = require('./lib/Node/Emisor');
const Receptor = require('./lib/Node/Receptor');
const Concepto = require('./lib/Node/Concepto');
const CfdiRelacionado = require('./lib/Node/CfdiRelacionado');
const Traslado = require('./lib/Node/Impuesto/Traslado');
const Retencion = require('./lib/Node/Impuesto/Retencion');
const CuentaPredial = require('./lib/Node/CuentaPredial');
const InformacionAduanera = require('./lib/Node/InformacionAduanera');
const Parte = require('./lib/Node/Parte');
const Pago = require('./lib/Node/Pago');
const Impuestos = require('./lib/Node/Impuestos');
const ImpTraslado = require('./lib/Node/ImpTraslado');
const ImpRetencion = require('./lib/Node/ImpRetencion');
const Complemento = require('./lib/Node/Complemento');

module.exports = {
  CFDI,
  Emisor,
  Receptor,
  Concepto,
  CfdiRelacionado,
  Traslado,
  Retencion,
  CuentaPredial,
  InformacionAduanera,
  Parte,
  Impuestos,
  ImpTraslado,
  ImpRetencion,
  Pago,
  Complemento
};
