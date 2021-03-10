const Mantenimiento = require('../models/mantenimiento');
const moment = require('moment');
module.exports = {
  getMantenimiento: (req, res) => {
    var id = req.params.id;
    return Mantenimiento.findById(id)
      .populate('usuarioAlta', 'nombre img email')
      .exec();
  },
  getMantenimientos: (req, res) => {
    const material = req.query.idMaterial;
    const tipoMantenimiento = req.query.tipoMantenimiento || '';
    const maniobra = req.query.maniobra || '';
    const finalizado = req.query.finalizado || '';
    const fInicial = req.query.fInicial || '';
    const fFinal = req.query.fFinal || '';
    let filtro = '{';
    if (material != undefined && material != '') {
      filtro += '\"materiales.material\":' + '\"' + material + '\",';
    }
    if (tipoMantenimiento != 'undefined' && tipoMantenimiento != '')
      filtro += '\"tipoMantenimiento\":' + '\"' + tipoMantenimiento + '\",';
    if (maniobra != 'undefined' && maniobra != '')
      filtro += '\"maniobra\":' + '\"' + maniobra + '\",';
    if (finalizado != 'undefined' && finalizado != '')
      if (finalizado !== "TODOS")
        if (finalizado === "FINALIZADOS") filtro += '\"finalizado\":' + '\"true\",';
        else filtro += '\"finalizado\":' + '\"false\",';
    if (fInicial != '' && fFinal != '') {
      fIni = moment(fInicial, 'DD-MM-YYYY', true).startOf('day').format();
      fFin = moment(fFinal, 'DD-MM-YYYY', true).endOf('day').format();
      filtro += '\"fechas.fIni\":{\"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
    }
    if (filtro != '{')
      filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    const json = JSON.parse(filtro);
    // Busco Material en Mantenimientos

    return Mantenimiento.find(json)
      .populate('usuarioAlta', 'nombre email')
      .populate('materiales.material', 'tipo')
      .populate({
        path: 'maniobra',
        select: 'contenedor tipo peso fLlegada grado fAlta',
        populate: {
          path: 'viaje',
          select: 'viaje',

          populate: {
            path: 'buque',
            select: 'nombre'
          }
        }
      })
      .populate({
        path: 'maniobra',
        select: 'contenedor tipo peso fLlegada grado fAlta',
        populate: {
          path: 'viaje',
          select: 'viaje',

          populate: {
            path: 'naviera',
            select: 'nombreComercial'
          }
        },
      })
      .exec();
  },
  getMantenimientosConMaterial: (req, res) => {
    const material = req.query.idMaterial;
    const tipoMantenimiento = req.query.tipoMantenimiento || '';
    const maniobra = req.query.maniobra || '';
    const finalizado = req.query.finalizado || '';
    const fInicial = req.query.fInicial || '';
    const fFinal = req.query.fFinal || '';
    const fAltaInicial = req.query.fAltaInicial || '';
    const fAltaFinal = req.query.fAltaFinal || '';
    let filtro = '{';
    if (material != undefined && material != '') {
      filtro += '\"materiales.material\":' + '\"' + material + '\",';
    } else {
      filtro += '\"materiales\":{\"$exists\":' + '\"true\"' + '}, \"$where\":' + '\"this.materiales.length > 0\"' + ',';
    }
    if (tipoMantenimiento != 'undefined' && tipoMantenimiento != '')
      filtro += '\"tipoMantenimiento\":' + '\"' + tipoMantenimiento + '\",';
    if (maniobra != 'undefined' && maniobra != '')
      filtro += '\"maniobra\":' + '\"' + maniobra + '\",';
    if (finalizado != 'undefined' && finalizado != '')
      if (finalizado !== "TODOS")
        if (finalizado === "FINALIZADOS") filtro += '\"finalizado\":' + '\"true\",';
        else filtro += '\"finalizado\":' + '\"false\",';
    if (fInicial != '' && fFinal != '') {
      fIni = moment(fInicial, 'DD-MM-YYYY', true).startOf('day').format();
      fFin = moment(fFinal, 'DD-MM-YYYY', true).endOf('day').format();
      filtro += '\"fechas.fIni\":{\"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
    }
    if (fAltaInicial != '' && fAltaFinal != '') {
      fIni2 = moment(fAltaInicial, 'DD-MM-YYYY', true).startOf('day').format();
      fFin2 = moment(fAltaFinal, 'DD-MM-YYYY', true).endOf('day').format();
      filtro += '\"fAlta\":{\"$gte\":' + '\"' + fIni2 + '\"' + ', \"$lte\":' + '\"' + fFin2 + '\"' + '},';
    }
    if (filtro != '{')
      filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    const json = JSON.parse(filtro);
    // Busco Material en Mantenimientos

    return Mantenimiento.find(json)
      .populate('usuarioAlta', 'nombre email')
      .populate('materiales.material', 'tipo')
      .populate({
        path: 'maniobra',
        select: 'contenedor tipo peso fLlegada grado fAlta',
        populate: {
          path: 'viaje',
          select: 'viaje',

          populate: {
            path: 'buque',
            select: 'nombre'
          }
        }
      })
      .populate({
        path: 'maniobra',
        select: 'contenedor tipo peso fLlegada grado fAlta',
        populate: {
          path: 'viaje',
          select: 'viaje',

          populate: {
            path: 'naviera',
            select: 'nombreComercial'
          }
        },
      })
      .exec();
  }
}