// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var bcrypt = require('bcryptjs');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();

// =======================================
// Obtener Usuarios
// =======================================
app.get('/', (req, res, netx) => {
  Usuario.find({})
    .populate('empresas', 'razonSocial')
    .exec(
      (err, usuarios) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error obteniendo los usuarios',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          usuarios: usuarios,
          total: usuarios.length
        });
      });
});

// ==========================================
//  Obtener usuario por ID
// ==========================================
app.get('/usuario/:id', (req, res) => {
  var id = req.params.id;
  Usuario.findById(id)
    .exec((err, usuario) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar usuario',
          errors: err
        });
      }
      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La usuario con el id ' + id + 'no existe',
          errors: { message: 'No existe un usuario con ese ID' }
        });
      }
      res.status(200).json({
        usuario: usuario
      });
    });
});

// =======================================
// Crear Usuarios
// =======================================


app.post('/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role,
    empresas: body.empresas,
    img: body.img,
    usuarioAlta: req.usuario._id
  });

  if (fs.existsSync('./uploads/temp/' + usuario.img)) {
    console.log('The file exists.');
    fs.rename('./uploads/temp/' + usuario.img, './uploads/usuarios/' + usuario.img, (err) => {
      if (err) { console.log(err); }
    });
  }
  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear usuario',
        errors: err
      });
    }
    usuarioGuardado.password = '=)';
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });
});


// =======================================
// Actualizar Usuarios
// =======================================
app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_o_MismoUsuario], (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    }
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id ' + id + ' no existe',
        errors: { message: 'No existe un usuario con ese ID' }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    //usuario.role = body.role;
    //usuario.password = body.password;
    if (body.empresas)
      usuario.empresas = body.empresas;
    usuario.usuarioMod = req.usuario._id;
    usuario.fMod = new Date();

    if (usuario.img != body.img) {
      if (fs.existsSync('./uploads/temp/' + body.img)) {
        if (usuario.img != undefined || usuario.img != '' && usuario.img != null && fs.existsSync('./uploads/usuarios/' + usuario.img)) {
          fs.unlink('./uploads/usuarios/' + usuario.img, (err) => {
            if (err) console.log(err);
            else
              console.log('path/file.txt was deleted');
          });
        }
        fs.rename('./uploads/temp/' + body.img, './uploads/usuarios/' + body.img, (err) => {
          if (err) { console.log(err); }
        });
      }
      usuario.img = body.img;
    }
    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          errors: err
        });
      }
      usuarioGuardado.password = '=)';
      res.status(200).json({
        ok: true,
        mensaje: 'Usuario Actualizado con éxito',
        usuario: usuarioGuardado
      });
    });
  });
});


// =======================================
// Actualizar Usuarios
// =======================================
app.put('/usuario/:id/habilita_deshabilita', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_o_MismoUsuario], (req, res) => {
  var id = req.params.id;
  var body = req.body;
  console.log('habilitadeshabilita');
  console.log(body);
  console.log(id);
  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    }
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id ' + id + ' no existe',
        errors: { message: 'No existe un usuario con ese ID' }
      });
    }


    usuario.activo = body.activo;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mensaje: 'Usuario Actualizado con éxito',
        usuario: usuarioGuardado
      });
    });
  });
});

// // =======================================
// // Borrar Usuarios
// // =======================================
// app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_ROLE], (req, res) => {
//   var id = req.params.id;
//   Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

//     if (err) {
//       return res.status(500).json({
//         ok: false,
//         mensaje: 'Error al borrar usuario',
//         errors: err
//       });
//     }

//     if (!usuarioBorrado) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'No existe un usuario con ese id',
//         errors: { message: 'No existe un usuario con ese id' }
//       });
//     }

//     res.status(200).json({
//       ok: true,
//       usuario: usuarioBorrado
//     });
//   });
// });

// export
module.exports = app;