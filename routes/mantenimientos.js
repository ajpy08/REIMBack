// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Mantenimiento = require('../models/mantenimiento');
var variasBucket = require('../public/variasBucket');
const controller = require('../controllers/entradasController');


var entorno = require('../config/config').config();
//var AWS = require('aws-sdk');
var AWS = require('aws-sdk/global');

var fileUpload = require('express-fileupload');
var uuid = require('uuid/v1');
var s3Zip = require('s3-zip');


app.use(fileUpload());


// =======================================
// Obtener Mantenimiento
// =======================================
app.get('/mantenimiento/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Mantenimiento.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, mantenimiento) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el mantenimiento',
          errors: err
        });
      }
      if (!mantenimiento) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El mantenimiento con el id ' + id + ' no existe',
          errors: { message: 'No existe un mantenimiento con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        mantenimiento: mantenimiento
      });
    });
});

app.get('', mdAutenticacion.verificaToken, (req, res) => {

  const mantenimientos = controller.consultaMantenimientos(req, res);
  mantenimientos.then(mantenimientos => {
          res.status(200).json({
              ok: true,
              mantenimientos,
              totalRegistros: mantenimientos.length
          });
  }).catch(error => {
      return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando mantenimientos',
          errors: error
      });
  });

  // var tipoMantenimiento = req.query.tipoMantenimiento || '';
  // var maniobra = req.query.maniobra || '';
  // var finalizado = req.query.finalizado || '';

  // var filtro = '{';
  // if (tipoMantenimiento != 'undefined' && tipoMantenimiento != '')
  //   filtro += '\"tipoMantenimiento\":' + '\"' + tipoMantenimiento + '\",';
  // if (maniobra != 'undefined' && maniobra != '')
  //   filtro += '\"maniobra\":' + '\"' + maniobra + '\",';
  // if (finalizado != 'undefined' && finalizado != '')
  //   if (finalizado !== "TODOS")
  //     if (finalizado === "FINALIZADOS") filtro += '\"finalizado\":' + '\"true\",';
  //     else filtro += '\"finalizado\":' + '\"false\",';


  //     // if (reparacion === 'true') {
  //     //   filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true},';
  //     // }

  //     // if (finillegada != '' && ffinllegada) {
  //     //   fIni = moment(finillegada, 'DD-MM-YYYY', true).utc().startOf('day').format();
  //     //   fFin = moment(ffinllegada, 'DD-MM-YYYY', true).utc().endOf('day').format();
  //     //   filtro += '\"fLlegada\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
  //     // }

  // if (filtro != '{')
  //   filtro = filtro.slice(0, -1);
  // filtro = filtro + '}';
  // var json = JSON.parse(filtro);

  // console.log(json);
  // Mantenimiento.find(json)
  //   .populate('usuario', 'nombre email')
  //   .populate('maniobra', 'contenedor tipo peso')
  //   .exec((err, mantenimientos) => {
  //     if (err) {
  //       return res.status(500).json({
  //         ok: false,
  //         mensaje: 'Error los mantenimientos',
  //         errors: err
  //       });
  //     }
  //     res.status(200).json({
  //       ok: true,
  //       mantenimientos: mantenimientos,
  //       total: mantenimientos.length
  //     });

  //   });
});

// =======================================
// Obtener mantenimientos
// =======================================
//app.get('/xmaniobra/:id', mdAutenticacion.verificaToken, (req, res) => {
app.get('/xmaniobra/:id', (req, res) => {
  var id = req.params.id;

  Mantenimiento.find({ maniobra: id })
    .populate('usuario', 'nombre email')
    .exec((err, mantenimientos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error los mantenimientos',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mantenimientos: mantenimientos,
        total: mantenimientos.length
      });

    });
});

// =======================================
// Obtener mantenimientos x TIPO
// =======================================
app.get('/xtipo/:tipo', mdAutenticacion.verificaToken, (req, res) => {
  //app.get('/xtipo/:tipo', (req, res) => {
  var tipo = req.params.tipo;
  Mantenimiento.find({ tipoMantenimiento: tipo })
    .populate('usuario', 'nombre email')
    .populate('maniobra', 'contenedor tipo peso')
    .exec((err, mantenimientos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error los mantenimientos',
          errors: err
        });
      }
      //console.log(mantenimientos);
      res.status(200).json({
        ok: true,
        mantenimientos: mantenimientos,
        total: mantenimientos.length

      });

    });
});

// ==========================================
// Agregar mantenimiento a la maniobra
// ==========================================

app.post('/mantenimiento', mdAutenticacion.verificaToken, (req, res) => {

  var body = req.body.mantenimiento;
  // console.log(body);
  var mantenimiento = new Mantenimiento({
    maniobra: body.maniobra,
    tipoMantenimiento: body.tipoMantenimiento,
    tipoLavado: body.tipoLavado,
    cambioGrado: body.cambioGrado,
    observacionesGenerales: body.observacionesGenerales,
    izquierdo: body.izquierdo,
    derecho: body.derecho,
    frente: body.frente,
    posterior: body.posterior,
    piso: body.piso,
    techo: body.techo,
    interior: body.interior,
    puerta: body.puerta,
    fechas: body.fechas,
    materiales: body.materiales,
    finalizado: body.finalizado,
    usuarioAlta: req.usuario._id
  });

  mantenimiento.save((err, mantenimientoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al agregar el mantenimiento',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      mantenimiento: mantenimientoGuardado
    });
  });


});


// ==========================================
// Editar mantenimientos de la maniobra
// ==========================================
app.put('/mantenimiento/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body.mantenimiento;

  Mantenimiento.findById(id, (err, mantenimiento) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el mantenimiento',
        errors: err
      });
    }
    if (!mantenimiento) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El mantenimiento con el id ' + id + ' no existe',
        errors: { message: 'No existe mantenimiento con ese ID' }
      });
    }

    // console.log(mantenimiento.materiales);
    // console.log("nadan");
    mantenimiento.tipoMantenimiento = body.tipoMantenimiento,
      mantenimiento.tipoLavado = body.tipoLavado,
      mantenimiento.cambioGrado = body.cambioGrado,
      mantenimiento.observacionesGenerales = body.observacionesGenerales,
      mantenimiento.izquierdo = body.izquierdo,
      mantenimiento.derecho = body.derecho,
      mantenimiento.frente = body.frente,
      mantenimiento.posterior = body.posterior,
      mantenimiento.piso = body.piso,
      mantenimiento.techo = body.techo,
      mantenimiento.interior = body.interior,
      mantenimiento.puerta = body.puerta,
      mantenimiento.fechas = body.fechas,
      mantenimiento.materiales = body.materiales,
      mantenimiento.finalizado = body.finalizado,
      mantenimiento.usuarioMod = req.usuario._id,
      mantenimiento.fMod = new Date();
    // console.log(mantenimiento.materiales);
    mantenimiento.save((err, mantenimientoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el mantenimiento',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mantenimiento: mantenimientoGuardado
      });
    });
  });

});


app.put('/mantenimiento/:id/addMaterial', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body.material;
  console.log(body);
  //REvisar primero si se puede agregar por el stock
  //REchazarlo o darlo de alta en el array

});

// ==========================================
// Remover eventos de la maniobra
// ==========================================

app.delete('/mantenimiento/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Mantenimiento.findByIdAndRemove(id, (err, mantenimientoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el mantenimiento',
        errors: err
      });
    }
    if (!mantenimientoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe mantenimiento con ese id',
        errors: { message: 'No existe mantenimiento con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      mantenimiento: mantenimientoBorrado
    });
  });
});

// ==========================================

// Subir fotos ANTES o DESPUES
// ==========================================
app.put('/mantenimiento/:id/upfoto/:AD', (req, res) => {

  var id = req.params.id;
  var AD = req.params.AD;
  console.log(req.files);
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No selecciono nada',
      errors: { message: 'Debe de seleccionar una imagen' }
    });
  }
  console.log(id);
  console.log(AD);
  // Obtener nombre del archivo
  var archivo = req.files.file;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];
  var nombreArchivo = `${uuid()}.${extensionArchivo}`;
  var path = 'mantenimientos/' + id + '/';

  if (AD === "ANTES")
    path = path + 'fotos_antes/';
  else
  if (AD === "DESPUES")
    path = path + 'fotos_despues/';

  variasBucket.SubirArchivoBucket(archivo, path, nombreArchivo)
    .then((value) => {
      if (value) {
        res.status(200).json({
          ok: true,
          mensaje: 'Archivo guardado!',
        });
      }
    });
});

// RECUPERAR LISTA DE  Fotos antes y despues
app.get('/mantenimiento/:id/fotos/:AD/', (req, res, netx) => {
  var idMantenimiento = req.params.id;
  var antes_despues = req.params.AD;
  var pathFotos = "";

  if (antes_despues === 'ANTES') {
    pathFotos = `mantenimientos/${idMantenimiento}/fotos_antes/`;
  } else {
    if (antes_despues === 'DESPUES') {
      pathFotos = `mantenimientos/${idMantenimiento}/fotos_despues/`;
    }
  }

  var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
  var params = {
    Bucket: entorno.BUCKET,
    Prefix: pathFotos,
  };
  s3.listObjects(params, function(err, data) {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encontraron fotos',
        errors: { message: 'No existen fotos para mantenimiento con ID: ' + idMantenimiento }
      });
    } else {
      // console.log(data.Contents); // successful response
      res.status(200).json({
        ok: true,
        // fotos: JSON.parse(JSON.stringify(array)),
        fotos: data.Contents,
        total: data.Contents.length
      });
    }
  });
});

// Recupera Foto por medio de la ruta completa..
app.get('/mantenimiento/getfoto', (req, res, netx) => {
  var img = req.query.ruta;

  if (!img) {
    res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
  } else {
    var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
    var params = {
      Bucket: entorno.BUCKET,
      Key: img
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        console.error('ERROR EN CALLBACK ' + img);
        res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
      } else {
        res.setHeader('Content-disposition', 'atachment; filename=' + img);
        res.setHeader('Content-length', data.ContentLength);
        res.send(data.Body);
      }
    });
  }
});

// ============================================
//   Borrar Foto de Mantenimiento desde Bucket 
// ============================================
app.get('/mantenimiento/:id/eliminafoto/:AD/:name', (req, res, netx) => {
  var id = req.params.id;
  var a_d = req.params.AD;
  var nameimg = req.params.name;

  var pathfoto;
  if (a_d === 'ANTES') {
    pathfoto = `mantenimientos/${id}/fotos_antes/${nameimg}`;
  } else {
    if (a_d === 'DESPUES') {
      pathfoto = `mantenimientos/${id}/fotos_despues/${nameimg}`;
    }
  }
  console.log(pathfoto);
  variasBucket.BorrarArchivoBucketKey(pathfoto)
    .then((value) => {
      if (value) {
        res.status(200).json({
          ok: true,
          mensaje: 'Foto Eliminada!',
        });
      }
    });
});


//DESCARGAR TODO LA CARPETA DE IMAGENES EN UN ZIP //
// app.get('/mantenimiento/:id/getfotoszip/:AD', (req, res, netx) => {
//   var idMantenimiento = req.params.id;
//   var antes_despues = req.params.AD;
//   var folder = "";
//   folder = `mantenimientos/${idMantenimiento}/`;

//   if (antes_despues === 'ANTES') {
//     folder = `mantenimientos/${idMantenimiento}/fotos_antes/`;

//   } else {
//     if (antes_despues === 'DESPUES') {
//       folder = `mantenimientos/${idMantenimiento}/fotos_despues/`;
//     }
//   }

//   var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
//   var bucket = entorno.BUCKET;
//   var params = {
//     Bucket: entorno.BUCKET,
//     Prefix: folder,
//   }

//   s3.listObjectsV2(params, function(err, data) {
//     if (err) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'No se encontraron fotos',
//         errors: { message: 'No existen fotos para el Mantenimiento con ID ' + idMantenimiento }
//       });
//     } else {
//       const files = [];
//       data.Contents.forEach(d => {
//         const img = d.Key.substr(d.Key.lastIndexOf('/') + 1, d.Key.length - 1);
//         files.push(img);
//       });
//       // const output = fs.createWriteStream(join(res + `${idMantenimiento}.zip`));
//       s3Zip.archive({ s3: s3, bucket: bucket, preserveFolderStructure: true }, folder, files).pipe(res, `${idMantenimiento}.zip`);
//       //s3Zip.archive({ s3: s3, bucket: bucket, debug: true, preserveFolderStructure: true }, folder, files).pipe(res, `${idMantenimiento}.zip`);
//       //  output.on('close', () => {
//       //    console.log('Cerrado');
//       //    res.download(res.path, 'algo.zip');
//       //    return;
//       //  });
//       //  return;
//       //res.send(s3Zip.archive({ region: region, bucket: bucket, debug: true, preserveFolderStructure: true  }, folder, files).pipe(output));
//       // res.setHeader('Content-disposition', 'atachment; filename=algo.zip'); 
//       // res.setHeader('Content-length',data.Contents);
//       // res.status(200).json({
//       //   ok:true,
//       //   archive: output
//       // });
//     }
//   })
// })

app.get('/mantenimiento/:id/getfotoszip/:AD', (req, res, netx) => {
  var idMantenimiento = req.params.id;
  var antes_despues = req.params.AD;
  var folder = "";
  folder = `mantenimientos/${idMantenimiento}/`;
  const files = [];

  var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
  var bucket = entorno.BUCKET;
  var params = {
    Bucket: entorno.BUCKET,
    Prefix: folder
  }
  s3.listObjectsV2(params, function(err, data) {
    if (err) {

      return res.status(400).json({
        ok: false,
        mensaje: 'Hubo un error al consultar las fotos del ANTES',
        errors: { message: 'Hubo un error al consultar las fotos del ANTES ' + idMantenimiento }
      });
    } else {
      data.Contents.forEach(d => {
        const img = d.Key.substr(folder.length);
        if (img.substr(0, 11) === "fotos_antes" && antes_despues !== "DESPUES") files.push(img);
        if (img.substr(0, 13) === "fotos_despues" && antes_despues !== "ANTES") files.push(img);
      });
    }
    if (files.length > 0) s3Zip.archive({ s3: s3, bucket: bucket, preserveFolderStructure: true }, folder, files).pipe(res, `${idMantenimiento}.zip`);
    else {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encontraron fotos.',
        errors: { message: 'No se encontraron fotos del mantenimiento: ' + idMantenimiento }
      });
    }
  });
});

// Migrar fotos de maniobras a mantenimientos (BUCKET)
// ==========================================
app.get('/migracion/fotos',  mdAutenticacion.verificaToken, (req, res, next) => {

  // Mantenimiento.find({maniobra: '5fcbc717461c4f05583690cd'})
  Mantenimiento.find()
    .sort({ fAlta: -1 })
    .exec((err, mantenimientos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar mantenimientos',
          errors: err
        });
      }

      mantenimientos.forEach(async (man) => {
        var LR = man.tipoMantenimiento == 'LAVADO' ? 'fotos_lavado' : 'fotos_reparacion'
        var ruta = 'maniobras/' + man.maniobra + '/' + LR + '/';
        var rutaDestino = 'mantenimientos/' + man._id + '/fotos_despues/';
        variasBucket.ListaArchivosBucket(ruta).then(data => {
          data.forEach(d => {
            const rutaBase = d.Key.substring(0, d.Key.lastIndexOf('/') + 1);
            const nombreArchivo = d.Key.substring(d.Key.lastIndexOf('/') + 1, d.Key.length);
            variasBucket.CopiarArchivoBucket(rutaBase, nombreArchivo, rutaDestino);
          });
        });
      });
      res.status(200).json({
        ok: true,
        mantenimientos,
        total: mantenimientos.length
      });
    });
});



module.exports = app;