var MetodoPago = require('../models/facturacion/metodo-pago');
var UsoCFDI = require('../models/facturacion/uso-CFDI');
var ClaveUnidad = require('../models/facturacion/claveUnidad');
var CFDIS = require('../models/facturacion/cfdi');
var TipoRelacion = require('../models/facturacion/tipoRelacion');

module.exports = {
    cfdi: async (req, res, next) => {
        id = req;
        try {
            const pdfcfdi = await CFDIS.findById(id);
            return pdfcfdi;
        } catch (e){
            const mensaje = 'Error al obtener cfdi'
            return {mensaje: mensaje, ok: false};
        }
    },

    Metodo: async (req, res, next) => {
        metodo = req;
        let filtro = '{' + '\"metodoPago\":' + '\"' + metodo + '\"' + '}';
        const json = JSON.parse(filtro)
        try {
            const pdfMetodo = await MetodoPago.find(json)
            for (const Mt of pdfMetodo) {
                return Mt.descripcion;
            }
        }catch(e) {
            const mensaje = 'Error al obtener cfdi'
            return {mensaje: mensaje, ok: false};
        }
    }, 
    Clave: async (req, res, next) => {
        const clave = req;
        let claves = []

        for (const cl of clave) {
            let filtro = '{' + '\"claveUnidad\":' + '\"' + cl.claveUnidad + '\"' + '}';
            let json = JSON.parse(filtro);
            try {
                const pdfClaveU = await ClaveUnidad.find(json)
                for (const des of pdfClaveU) {
                    claves.push(des.nombre)
                }
                
                
            } catch (e) {
                const mensaje = 'Error al obtener clave Unidad'
                return {
                    mensaje: mensaje,
                    ok: false
                }
            }
            
        }
        return claves;
    }, 
    Usos: async (req, res, next) => {
        let uso = req;
        let filtro = '{' +  '\"usoCFDI\":' + '\"' + uso + '\"' + '}';
        let json = JSON.parse(filtro);

        try {
            const pdfUso = await UsoCFDI.find(json)
            for (const uso of pdfUso) {
                return uso.descripcion
            }
        } catch (e) {
            return false
        }
    },
    Tipo: async (req, res, next) => {
        let tipo = req;
        try {
            const tipos = await TipoRelacion.find({'clave': tipo})
            return tipos;
        } catch(e) {
            return {
                ok: false,
                mensaje: 'Error al buscar Tipo Relacion PDF Nota de Credito'
            }
        }
    }


}
