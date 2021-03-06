var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var Maniobra = require('./maniobra');

var solicitudScheme = new Schema({

  agencia: { type: Schema.Types.ObjectId, ref: 'Cliente', requiered: [true, 'La Agencia Aduanal es necesaria'] },
  naviera: { type: Schema.Types.ObjectId, ref: 'Cliente', requiered: [true, 'La Naviera es necesaria'] },
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', requiered: [true, 'El Cliente es necesario'] },
  buque: { type: Schema.Types.ObjectId, ref: 'Buque' },
  nombreBuque: { type: String },
  blBooking: { type: String },
  viaje: { type: Schema.Types.ObjectId, ref: 'Viaje' },
  noViaje: { type: String },
  observaciones: { type: String },
  rutaBL: { type: String },
  rutaBooking: { type: String },
  credito: { type: Boolean, default: 'false', required: true },
  rutaComprobante: { type: String },
  correo: { type: String, requiered: [true, 'El correo es necesario'] },
  contenedores: [{
    maniobra: { type: Schema.Types.ObjectId, ref: 'Maniobra' },
    patio: { type: String, default: 'POLIGONO INDUSTRIAL' },
    transportista: { type: Schema.Types.ObjectId, ref: 'Transportista' },
    contenedor: { type: String },
    tipo: { type: String },
    peso: { type: String },
    grado: { type: String }
  }],
  tipo: { type: String, default: 'D' },
  estatus: { type: String, default: 'NA' },
  facturarA: { type: String },
  // rfc: { type: String, required: [true, 'El RFC para Facturación es necesario'] },
  rfc: { type: String },
  razonSocial: { type: String, requiered: [true, 'La razon social para Facturacion es necesaria'] },
  calle: { type: String },
  noExterior: { type: String },
  noInterior: { type: String },
  colonia: { type: String },
  municipio: { type: String },
  ciudad: { type: String },
  estado: { type: String, requiered: [true, 'El estado para Facturación es necesaria'] },
  cp: { type: String, requiered: [true, 'El codigo postal para Facturación es necesario'] },
  correoFac: { type: String, requiered: [true, 'El correo de facturación es necesario'] },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  usuarioAprobo: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAprobacion: { type: Date },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
}, { collection: 'solicitudes' });

solicitudScheme.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

solicitudScheme.pre('save', function (next) {
  var doc = this;
  if (doc.estatus === 'APROBADA' && doc.tipo === 'C') {
    doc.contenedores.forEach(function (element, index) {
      if (element.maniobra == null || element.maniobra == undefined || element.maniobra == '') {
        var maniobra;
        maniobra = new Maniobra({
          solicitud: doc._id,
          cargaDescarga: doc.tipo,
          cliente: doc.cliente,
          agencia: doc.agencia,
          naviera: doc.naviera,
          transportista: element.transportista,
          correo: doc.correo,
          tipo: element.tipo,
          peso: element.peso,
          grado: element.grado,
          estatus: 'TRANSITO',
          patio: element.patio,
          usuarioAlta: doc.usuarioAprobo
        });
        doc.contenedores[index].maniobra = maniobra._id;
        maniobra.save((err) => {
          if (err) {
            // console.log(err);
            return next(err);
          }
        });
      }
    });
  }
  next();
});

solicitudScheme.pre('remove', function (next) {
  if (this.tipo == 'C') {
    Maniobra.remove({ 'solicitud': this._id }).exec()
    next();
  } else {
    if (this.tipo == 'D') {
      Maniobra.updateMany({'solicitud': this._id }, {$unset: {'solicitud': this._id}} ).exec();
      next();
    } else {
      next();
    }
  }
});


module.exports = mongoose.model('Solicitud', solicitudScheme);