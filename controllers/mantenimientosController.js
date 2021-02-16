const Mantenimiento = require('../models/mantenimiento');

module.exports = {
  getMantenimiento: (req, res) => {
    var id = req.params.id;
    return Mantenimiento.findById(id)
      .populate('usuarioAlta', 'nombre img email')
      .exec();
  },
  consultaMantenimientos: (req, res) => {
    const material = req.params.material;

    const tipoMantenimiento = req.query.tipoMantenimiento || '';
    const maniobra = req.query.maniobra || '';
    const finalizado = req.query.finalizado || '';

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


        // if (reparacion === 'true') {
        //   filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true},';
        // }

        // if (finillegada != '' && ffinllegada) {
        //   fIni = moment(finillegada, 'DD-MM-YYYY', true).utc().startOf('day').format();
        //   fFin = moment(ffinllegada, 'DD-MM-YYYY', true).utc().endOf('day').format();
        //   filtro += '\"fLlegada\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
        // }

    if (filtro != '{')
      filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    const json = JSON.parse(filtro);

        // Busco Material en Mantenimientos

        return Mantenimiento.find(json)
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