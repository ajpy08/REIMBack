const Maniobra = require('../models/maniobra');
const mongoose = require('mongoose');
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
        //regresa un objeto con esta estructura { n: 1, nModified: 0, ok: 1 }
        return Maniobra.updateOne({ '_id': new mongoose.Types.ObjectId(idManiobra) }, {
            $set: { 'estatus': estatus }
        });
    },
    updateGrado: (idManiobra, grado) => {
        //regresa un objeto con esta estructura { n: 1, nModified: 0, ok: 1 }
        return Maniobra.updateOne({ '_id': new mongoose.Types.ObjectId(idManiobra) }, {
            $set: { 'grado': grado }
        });
    }
}