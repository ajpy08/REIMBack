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
    const material = req.params.material;

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
      .populate('maniobra', 'contenedor tipo peso')
      .exec();
  }
}