const Material = require('../models/material');

module.exports = {
  getMateriales: (req) => {
    const descripcion = req.query.descripcion || '';
    const activo = req.query.activo || '';
    const tipo = req.query.tipo || '';

    var filtro = '{';
    if (descripcion != 'undefined' && descripcion != '')
      filtro += '\"descripcion\":' + '\"' + descripcion + '\",';
    if (activo != 'undefined' && activo != '')
      filtro += '\"activo\":' + '\"' + activo + '\",';
    if (tipo != 'undefined' && tipo != '')
      filtro += '\"tipo\":' + '\"' + tipo + '\",';
    if (filtro != '{')
      filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse(filtro);
    return Material.find(json)
      .populate('usuarioAlta', 'nombre email')
      .populate('usuarioMod', 'nombre email')
      .populate('unidadMedida', 'descripcion abreviacion')
      .sort({ fAlta: -1 })
      .exec();
  },
  getMaterialById: (req) => {
    const id = req.params.idMaterial;
    return Material.findById(id).exec();
  }
}