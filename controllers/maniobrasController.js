const Maniobra = require('../models/maniobra');
const moment = require('moment');
module.exports = {
  getManiobra: (req, res) => {
    var id = req.params.id;
    return Maniobra.findById(id)
      .populate('solicitud', 'blBooking')
      .populate('naviera', 'nombreComercial')
      .exec();
  },
  updateEstatus: (idManiobra, estatus) => {
    return Maniobra.updateOne({ '_id': new mongoose.Types.ObjectId(idManiobra) }, {
      $set: { 'estatus': estatus }
    });
  },
}