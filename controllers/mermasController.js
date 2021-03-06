const Merma = require('../models/merma');
const mongoose = require('mongoose');
const moment = require('moment');

module.exports = {
  consultaMermas: (req) => {
    const material = req.params.idMaterial;
    let filtroMermas = '{';
    if (material != undefined && material != '') {
      filtroMermas += '\"materiales.material\":' + '\"' + material + '\",';
    }

    if (filtroMermas != '{')
      filtroMermas = filtroMermas.slice(0, -1);
    filtroMermas = filtroMermas + '}';
    const jsonMermas = JSON.parse(filtroMermas);

    return Merma.find(jsonMermas)
      .populate('usuarioAprobacion', 'nombre email')
      .populate('usuarioAlta', 'nombre email')
      .populate('usuarioMod', 'nombre email')
      .populate('materiales.material', 'descripcion tipo fAlta ')
      .exec();
  },
  consultaMermasAprobadas: (req) => {
    const material = req.params.idMaterial;
    const fInicial = req.query.fInicial || '';
    const fFinal = req.query.fFinal || '';
    let filtroMermas = '{';
    filtroMermas += '\"fAprobacion\":{\"$exists\":' + '\"true\"},';
    if (material != undefined && material != '') {
      filtroMermas += '\"materiales.material\":' + '\"' + material + '\",';
    }
    if (fInicial != '' && fFinal != '') {
      fIni = moment(fInicial, 'DD-MM-YYYY', true).startOf('day').format();
      fFin = moment(fFinal, 'DD-MM-YYYY', true).endOf('day').format();
      filtroMermas += '\"fAprobacion\":{\"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
    }

    if (filtroMermas != '{')
      filtroMermas = filtroMermas.slice(0, -1);
    filtroMermas = filtroMermas + '}';
    const jsonMermas = JSON.parse(filtroMermas);

    return Merma.find(jsonMermas)
      .populate('usuarioAprobacion', 'nombre email')
      .populate('usuarioAlta', 'nombre email')
      .populate('usuarioMod', 'nombre email')
      .populate('materiales.material', 'descripcion tipo fAlta ')
      .exec();
  },
  consultaMermaById: (req) => {
    const id = req.params.id;
    return Merma.findById(id)
      .populate('materiales.material', 'descripcion')
      .exec();
  },
  creaMerma: (req) => {
    const body = req.body;
    const merma = new Merma({
      motivo: body.motivo,
      materiales: body.materiales,
      usuarioAlta: req.usuario._id
    });

    return merma.save();
  },
  actualizaMerma: (req) => {
    const body = req.body;
    let merma = req.body.merma;

    merma.motivo = body.motivo;
    merma.materiales = body.materiales;
    merma.usuarioMod = req.usuario._id;
    merma.fMod = new Date();
    return merma.save();
  },
  eliminarMerma: (req) => {
    let merma = req.body.merma;
    return merma.remove();
  },
  aprobarMerma: (req) => {
    const id = req.params.id;
    const fAprobacion = new Date();
    const comentario = req.body.comentarioAprobacion;
    return Merma.updateOne({ "_id": new mongoose.Types.ObjectId(id) }, {
      $set: {
        "usuarioAprobacion": new mongoose.Types.ObjectId(req.usuario._id),
        "fAprobacion": fAprobacion,
        "comentarioAprobacion": comentario
      }
    });
  },
  desaprobarMerma: (req) => {
    const id = req.params.id;
    return Merma.updateOne({ "_id": id }, { $unset: { "usuarioAprobacion": undefined, "fAprobacion": undefined, "comentarioAprobacion": undefined } });
  }
}