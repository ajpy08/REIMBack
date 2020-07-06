var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var UsoCFDI = require('../models/facturacion/uso-CFDI');
var ClaveUnidad = require('../models/facturacion/claveUnidad');
var funcion = require('../routes/fuctions');
var ConsultaPDF = require('../routes/PDFMongo');
var MetodoPago = require('../models/facturacion/metodo-pago');
const path = require('path');
var PdfPrinter = require('pdfmake');
var CONTADOR = require('../models/contador');
var printer = new PdfPrinter();
const { DATOS_REIM, DATOS } = require('../config/config')



var fs = require('fs');
const fuctions = require('../routes/fuctions');
const { auto } = require('async');
const { request } = require('./cfdis');

// ===========================================
//  OBTINE EL USO DE CADA FACTURA 
// ===========================================

app.get('/uso/:uso',mdAutenticacion.verificaToken, (req, res, next) => {
    var uso = req.query.uso || '';
    var filtro = '{';

    if (uso != 'undefined' && uso != '')
        filtro += '\"usoCFDI\":' + '\"' + uso + '\"' + '}';

    var json = JSON.parse(filtro);
    UsoCFDI.find(json)
        .exec((err, uso) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar UsoCFDI',
                    errors: { mensage: 'Error al buscar UsoCFDI' }
                });
            }
            res.status(200).json({
                ok: true,
                usoCFDI: uso
            });
        });
});

// ===========================================
//  OBTINE EL METODO PAGO DE CADA FACTURA 
// ===========================================
app.get('/metodoPago/:metodoPago',mdAutenticacion.verificaToken, (req, res) => {
    let metod = req.query.metodoPago || '';
    let filtro = '{';
    if (metod !== undefined && metod !== '') {
        filtro += '\"metodoPago\":' + '\"' + metod + '\"' + '}';
    }
    let json = JSON.parse(filtro);
    MetodoPago.find(json).exec((err, metodo) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Metodo Pago',
                errors: { message: 'Error al buscar Metodo Pago' }
            });
        }
        res.status(200).json({
            ok: true,
            MetodoPago: metodo
        });
    });
});

// ===========================================
//  OBTINE EL CLAVE UNIDAD DE CADA FACTURA 
// ===========================================

app.get('/clave/unidad/:unidad',mdAutenticacion.verificaToken, (req, res, next) => {
    var unidad = req.params.unidad || '';
    var filtro = '{';
    if (unidad != 'undefined' || unidad != '') {
        filtro += '\"claveUnidad\":' + '\"' + unidad + '\"' + '}';
    }
    var json = JSON.parse(filtro);
    ClaveUnidad.find(json).exec((err, clave) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar clave Unidad',
                errors: { mensage: 'Error al buscar clave Unidad' }
            });
        }
        res.status(200).json({
            ok: true,
            claveUnidad: clave
        });
    });
});

// ===========================================
//  OBTINE EN LETRAS EL TOTAL
// ===========================================
app.get('/numerosLetras/:total',mdAutenticacion.verificaToken, (req, res) => {
    var total = req.params.total;

    if (total === undefined || total === '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al convertir Numero a Letras',
            errors: { message: 'Error al convertir Numero a Letras' }
        });
    } else {
        var letra = funcion.numeroALetras(total, {
        });

        var centavos = total.indexOf('.')
        if (centavos !== -1) {
            var punto = total.toString().split('.');
            centavos = punto[1].padStart(2, '0');
        } else {
            centavos = '00'
        }

        letra = `${letra}   ${centavos}/100 M.N.`

        res.status(200).json({
            ok: true,
            numeroLetras: letra
        });
    }
});


// ===========================================
//  GENERAR PDF CFDI
// ===========================================
app.get('/pdfCFDI/:id',mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let nombrePdf = '';
    let DTO = 0;
    async function ok() {
        const Cf = await ConsultaPDF.cfdi(id);
        if (Cf === null) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al obtener CFDI para generar PDF',
                errors: { message: 'Error al obtener CFDI para generar PDF' }
            });
        } else {
            const Mt = await ConsultaPDF.Metodo(Cf.metodoPago);
            if (Mt === null) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al obtener Metodo de Pago para generar PDF',
                    errors: { message: 'Error al obtener Metodo de Pago para generar PDF' }
                });
            } else {
                const Cl = await ConsultaPDF.Clave(Cf.conceptos);

                if (Cl === null) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al obtener Clave Unidad para generar PDF',
                        errors: { message: 'Error al obtener Clave Unidad para generar PDF' }
                    });
                } else {
                    const Us = await ConsultaPDF.Usos(Cf.usoCFDI);
                    if (Us === null) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al obtener Uso CFDI para generar PDF',
                            errors: { message: 'Error al obtener Uso CFDI para generar PDF' }
                        });
                    } else {
                        const SubT = await funcion.cortado(Cf.subtotal, 2, true);
                        const Total_I_R = await funcion.cortado(Cf.totalImpuestosRetenidos, 2, true);
                        const Total_I_T = await funcion.cortado(Cf.totalImpuestosTrasladados, 2, true);
                        const Total = await funcion.cortado(Cf.total, 2, true);
                        const ImpLetra = await funcion.numeroALetras(Cf.total);
                        const letraT = await funcion.letraT(ImpLetra, Cf.total);
                        const cadena = await funcion.cadenaOriginalComplemetoPDF(Cf.cadenaOriginalSat, 1);
                        const QrG = await funcion.QrG(Cf.uuid, DATOS_REIM.RFC, Cf.rfc, Cf.total, Cf.selloEmisor);
                        const selloE = await funcion.cadenaOriginalComplemetoPDF(Cf.selloEmisor, 2);
                        const selloT = await funcion.cadenaOriginalComplemetoPDF(Cf.selloSat, 2);
                        return {
                            Cf, Mt, Cl, Us, SubT, Total_I_R, Total_I_T, Total, letraT, cadena, QrG, selloE, selloT
                        }
                    }
                }
            }
        }


    }

    ok().then(ress => {
        let fechaCert = ress.Cf.fechaCertificacion.toISOString().slice(0, -5);
        fechaCert = fechaCert.replace('T', ' ');
        let c = '';
        let s = '';
        let selloSat = '';

        for (let i = 0; i < ress.cadena.length; i++) {
            const e = ress.cadena[i];
            c += e + '\n'
        }
        for (let i = 0; i < ress.selloE.length; i++) {
            const e = ress.selloE[i];
            s += e + '\n'
        }
        for (let i = 0; i < ress.selloT.length; i++) {
            const e = ress.selloT[i];
            selloSat += e + '\n'
        }

        let dataPDF = {
            pageMargins: [15, 52, 15, 20],
            pageSize: 'LETTER',
            header: {
                columns: [{
                    image: 'assets/logo_reim_container_park.jpg',
                    width: 150,
                    margin: [13, 9]
                },
                {
                    type: 'none',
                    ul: [
                        DATOS_REIM.NOMBRE_EMPRESA,
                        DATOS_REIM.RFC,
                        DATOS_REIM.REGIMEN_FISCAL,
                        DATOS_REIM.DOMICILIO_FISCAL
                    ], style: 'header'
                }]
            },
            content: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 590, y2: 0, lineWidth: 2, lineColor: '#c5a227' }] },
                '\n',
                {
                    style: 'lugar',
                    text: 'LUGAR DE EXPEDICIÓN 97320 - Yucatán',
                },
                {
                    style: 'moneda',
                    text: [ress.Cf.moneda = 'MXN' ? ' MXN - Peso Mexicano' : 'USD - Dolar Americano'],
                },
                {
                    style: 'tableDatos',
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', 'auto', 'auto', '*'],
                        fillColor: '#bada55',
                        body: [
                            [{ text: 'FOLIO FISCAL (UUID)', fillColor: '#b2b4b5' }, { text: 'N. SERIE EMISOR\n N. SERIE CSD SAT', fillColor: '#b2b4b5' }, { text: 'METODO DE PAGO', fillColor: '#b2b4b5' },
                            { text: 'FECHA EMISION\n FECHA CERTIFICADO', fillColor: '#b2b4b5' }, { text: 'SERIE - FOLIO\n TIPO COM', fillColor: '#b2b4b5' }],
                            [ress.Cf.uuid, [DATOS.NoCertificado, ress.Cf.NoSerieSat], ress.Mt, [ress.Cf.fechaEmision, fechaCert], [{ text: [ress.Cf.serie, ' - ', ress.Cf.folio, '\n', ress.Cf.tipoComprobante = 'I' ? ' I - Ingreso' : ' E - Egreso'] }]]

                        ]
                    },
                    layout: 'noBorders'
                },
                {
                    style: 'tableDatos',
                    table: {
                        headerRows: 1,
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'RECEPTOR', fillColor: '#b2b4b5', alignment: 'left' }, { text: '', fillColor: '#b2b4b5', alignment: 'right' }],
                            [
                                {
                                    type: 'none',
                                    ul: [
                                        { text: ['R.F.C: ', ress.Cf.rfc] },
                                        { text: ['Nombre: ', ress.Cf.nombre] },
                                        { text: ['Dirección: ', ress.Cf.direccion] }
                                    ], alignment: 'left', fontSize: 8
                                },
                                {
                                    text: ['uso CFDI: ', ress.Us], alignment: 'right', margin: [18, 15, 10, 0]
                                }
                            ]
                        ]
                    }, layout: 'noBorders'
                },
                table(ress.Cf.conceptos, [{ text: 'CÓDIGO', style: 'conceptos' }, { text: 'CANT', style: 'conceptos' }, { text: 'UNIDAD', style: 'conceptos' },
                { text: 'DESCRIPCIÓN', style: 'conceptos' }, { text: 'IMPUESTOS', style: 'conceptos' }, { text: 'IMPORTE', style: 'conceptos' }, {text: 'DTO', style: 'conceptos'}
                ]),
                {
                    style: 'tablaTotales',
                    table: {
                        headerRows: 1,
                        widths: [115, '*'],
                        body: [

                            [{ text: ['SUBTOTAL: $ '] }, { text: ress.SubT, margin: [-2, 0] }],
                            [{ text: ['TOTAL IMPT. RETENIDOS: $ '] }, { text: ress.Total_I_R ? ress.Total_I_R : 0, margin: [-2, 0] }],
                            [{ text: ['TOTAL IMPT. TRASLADADOS: $ '] }, { text: ress.Total_I_T, margin: [-2, 0] }],
                            [{ text: ['DESCUENTO: $ '] }, { text: DTO, margin: [-2, 0] }],
                            [{ text: ['TOTAL: $'] }, { text: ress.Total, margin: [-2, 0] }]

                        ]
                    }, layout: 'noBorders'
                },
                {
                    style: 'tablaLetras',
                    table: {
                        headerRows: 1,
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'INFORMACIÓN ADICIONAL', fillColor: '#b2b4b5', alignment: 'left' }, { text: '', fillColor: '#b2b4b5', alignment: 'right' }],
                            [
                                {
                                    type: 'none',
                                    ul: [
                                        { text: [ress.Cf.informacionAdicional ? ress.Cf.informacionAdicional: '' ] },
                                    ], alignment: 'left', fontSize: 8
                                },
                                {
                                    text: [''], alignment: 'right', margin: [18, 15, 10, 0]
                                }
                            ]
                        ]
                    }, layout: 'noBorders'
                },
                {
                    style: 'tablaLetras',
                    table: {
                        headerRows: 1,
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'IMPORTE CON LETRAS', fillColor: '#b2b4b5', alignment: 'left' }, { text: '', fillColor: '#b2b4b5', alignment: 'right' }],
                            [
                                {
                                    type: 'none',
                                    ul: [
                                        { text: [ress.letraT] },
                                    ], alignment: 'left', fontSize: 8
                                },
                                {
                                    text: [''], alignment: 'right', margin: [18, 15, 10, 0]
                                }
                            ]
                        ]
                    }, layout: 'noBorders'
                },
                {
                    style: 'tablaLetras',
                    table: {
                        headerRows: 1,
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'CADENA ORIGINAL DEL COMPLEMENTO DE CERTIFICACIÓN DIGITAL DEL SAT', fillColor: '#b2b4b5', alignment: 'left' }, { text: '', fillColor: '#b2b4b5', alignment: 'right' }],
                        ]
                    }, layout: 'noBorders'
                },
                {
                    columns: [
                        {
                            width: '*',
                            alignment: 'left',
                            text: c
                        }
                    ]
                },
                {
                    style: 'QR',
                    columns: [

                        {
                            qr: `${ress.QrG}`, fit: 100, alignment: 'center'
                        },
                        [
                            {
                                columns: [
                                    {
                                        margin: [-120, 8, 0, 0],
                                        table: {
                                            headerRows: 1,
                                            widths: ['*'],
                                            body: [
                                                [{ text: 'SELLO DIGITAL DEL EMISOR', fillColor: '#b2b4b5', alignment: 'left' }],
                                                [s],
                                            ]
                                        },
                                        layout: 'noBorders',
                                        alignment: 'left',
                                    },

                                ]
                            },
                            {
                                columns: [
                                    {
                                        margin: [-120, 13, 0, 0],
                                        table: {
                                            dontBreakRows: true,
                                            // headerRows: 1,
                                            widths: ['*'],
                                            body: [
                                                [{ text: 'SELLO DIGITAL DEL SAT', fillColor: '#b2b4b5', alignment: 'left' }],
                                                [selloSat],
                                            ]
                                        },
                                        layout: 'noBorders',
                                        alignment: 'left',
                                    }
                                ]
                            }
                        ]
                    ]
                },
            ],
            footer: function (currentPage, pageCount) {
                return {
                    alignment: 'center',
                    text: 'ESTE DOCUMENTO ES UNA REPRESENTACIÓN IMPRESA DE UN CFDI V3.3.',
                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 590, y2: 0, lineWidth: 2, lineColor: '#c5a227' }],
                    // text: currentPage.toString() + ' of ' + pageCount,
                    fontSize: 8
                }
            },

            styles: {
                header: {
                    fontSize: 8,
                    margin: [0, 11, 20, 0],
                    alignment: 'right',
                },
                QR: {
                    widths: ['auto', 300],
                    margin: [-120, 5, 0, 0]
                },
                sello: {
                    widths: ['auto', 300],
                    margin: [-120, 8, 0, 0]
                },
                conceptos: {
                    fontSize: 8,
                    alignment: 'left',
                    fillColor: '#b2b4b5'
                },
                tablaLetras: {
                    margin: [0, 5, 0, 0]
                },
                tablaSello: {
                    margn: [100, 5, 0, 0]
                },
                tableDatos: {
                    fontSize: 8,
                    margin: [0, 0],
                    alignment: 'center',

                },
                tablaTotales: {
                    fontSize: 8,
                    margin: [400, 0],
                    // alignment: 'center',

                },
                tablaConceptos: {
                    bold: true,
                    margin: [100, 2, 0, 0]
                },
                moneda: {
                    alignment: 'right',
                    margin: [0, -10, 1, 0],
                    fontSize: 9
                },
                lugar: {
                    alignment: 'left',
                    fontSize: 9,
                    width: 3,
                    margin: [0, -8, 0, 0]
                },
            },
            defaultStyle: {
                fontSize: 8,
                bold: false,
                alignment: 'left'
            }

        }

        function table(data, columns) {
            return {
                table: {
                    headerRows: 1,
                    widths: ['auto', 25, '*', '*', '*', '*', '*'],
                    style: 'tablaConceptos',
                    body: builTable(data, columns)
                }, layout: 'lightHorizontalLines'
            };
        }
        function builTable(data, columns) {
            let body = [];
            let claveDes = [];
            let c = [];
            // let descuento = 0;

            // data.forEach(function(dpt) {
                
            //     descuento = dpt.descuento.toFloat()
            //     console.log(descuento)
            // });
            body.push(columns);

            for (const clave of data) {
                c.push(clave.claveUnidad)
            }

            data.forEach(function (row) {
                let dataRow = [];
                let impuesto = '';
                let claveUnidad = '';
                let importePipe = '';

                let imp = '';
                let tr = '';
                let TC = '';
                let F = '';
                let imps = [];
                importePipe = `$ ${funcion.cortado(row.importe, 2, true)}`
               let descuento = parseFloat(row.descuento);
                row.impuestos.forEach(function (TR) {

                    tr = TR.TR == 'TRASLADO' ? '(T)' : '(R)';
                    TC = funcion.impuestos(TR.tasaCuota);
                    imp = `${tr} | ${TR.impuesto} | ${TC} | $ ${TR.importe}`;
                    imps.push(imp)

                    c.forEach((cv, index, array) => {
                        claveUnidad = cv + '-' + ress.Cl[index]
                    });
                });

                DTO = DTO + descuento;

                dataRow.push(row.noIdentificacion, row.cantidad, claveUnidad, row.descripcion, imps, importePipe, descuento);

                body.push(dataRow);
            });
            return body;
        }
        const nombre = `${ress.Cf.serie}-${ress.Cf.folio}-${ress.Cf._id}.pdf`;
        const PdfRout = path.resolve(__dirname, `../archivosTemp/${nombre}`);
        nombrePdf = nombre;

        let pdfDoc = new PdfPrinter({
            Roboto: { normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'), bold: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Medium.ttf'], 'base64') }
        }).createPdfKitDocument(dataPDF);
        pdfDoc.pipe(fs.createWriteStream(PdfRout));
        pdfDoc.end();

        res.status(200).json({
            ok: true,
            pdfCFDI: ress.Cf
        });

    });
});

app.get('/envioCorreo/:correo&:archivo&:nombre', mdAutenticacion.verificaToken,(req, res) => {
    let correo = req.params.correo,
        archivoPDF = `${req.params.archivo}.pdf`,
        archivoXML = `${req.params.archivo}.xml`,
        nombre = req.params.nombre;

    const archivos = [];
    archivos.push(archivoXML, archivoPDF);

    async function envio() {
        await funcion.envioArchivoCfdi(nombre, correo, archivos);
    }
    envio().then(() => {
        res.status(200).json({
            ok: true,
            archivos: archivos
        });
    });
});


app.get('/envioCorreoB/:correo&:archivo&:nombre',mdAutenticacion.verificaToken, (req, res) => {
    let correo = req.params.correo,
        archivos = req.params.archivo,
        nombre = req.params.nombre;
    let archivo = archivos.split('-'),
        id = archivo[2],
        archivoPDF = `${req.params.archivo}.pdf`,
        archivoXML = `${req.params.archivo}.xml`;

    const archivosB = [];
    archivosB.push(archivoXML, archivoPDF);

    async function cfdiXml() {
        const xml = await ConsultaPDF.cfdi(id);
        return xml;
    }

    async function createFile(serie, folio, xml) {
        // let nombreArchivoCorreo = nombreFile.substr(0, 30);
        const xmlRout = path.resolve(__dirname, `../archivosTemp/${archivosB[0]}`);
        fs.writeFileSync(xmlRout, xml, 'utf8');
        funcion.envioArchivoCfdi(nombre, correo, archivosB, true);
    }

    cfdiXml().then(ress => {
        createFile(ress.serie, ress.folio, ress.xmlTimbrado).then(resFile => {
            res.status(200).json({
                ok: true
            })
        });
    });



    // const archivos = [];
    // archivos.push(archivoXML, archivoPDF);

    // async function envio() {
    //     await funcion.envioArchivoCfdi(nombre, correo, archivos);
    // }
    // envio().then(() => {
    //     res.status(200).json({
    //         ok: true,
    //         archivos: archivos
    //     });
    // });
});

// ===========================================
//  SUBIR ARCHIVOS A BOCKET
// ===========================================

app.get('/booket/:archivos&:subir',mdAutenticacion.verificaToken, (req, res) => {
    let archivos = req.params.archivos;
    let subir = req.params.subir;
    let archivo = archivos.split(',');

    if (subir === 'true') {
        archivo.forEach(async ext => {
            extencion = ext.split('.');
            extencion = extencion[1]

            if (extencion === 'pdf') {
                ruta = 'cfdi/pdf/'
            } else {
                ruta = 'cfdi/xml/'
            }
            let uploadXML = await funcion.subirArchivoBooket(ruta, ext);
        });
    } else {
        archivo.forEach(NombreArchivo => {
            funcion.BorrarArchivosTemp(NombreArchivo)
        });
    }

    res.status(200).json({
        ok: true
    })
});

// ===========================================
//  QUITA UN CREDITO DE TIMBRES
// ===========================================

app.get('/QuitCredito/', mdAutenticacion.verificaToken,(req, res) => {
    CONTADOR.findByIdAndUpdate({_id: 'CreditosTimbre'}, {$inc: {seq: -1}}, (err, creditos) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR AL RESTAR CREDITOS',
                errors: err
            });
        }
        res.status(200).json({
            ok: true
        });
    });
});
module.exports = app;