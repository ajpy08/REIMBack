// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');
const sentMail = require('./sendAlert');

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');

// ==========================================
//  Renovar De Token
// ==========================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {
  var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // 4 horas
  res.status(200).json({
    ok: true,
    token: token
  });
});

// ==========================================
//  Autenticación normal
// ==========================================
app.post('/', (req, res) => {
  var body = req.body;
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas = email',
        errors: err
      });
    }
    //console.log(usuarioDB)
    if (usuarioDB.activo === false) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario se encuentra deshabilitado',
        errors: err
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - password',
        errors: err
      });
    }
    // Crear token
    usuarioDB.password = '=)';
    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4hrs
    //sentMail(usuarioDB.nombre, usuarioDB.email, 'Prueba de Correo');
    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB._id,
      menu: obtenerMenu(usuarioDB.role)
    });

  }).populate('empresas', 'razonSocial');


});

function obtenerMenu(ROLE) {


  //console.log('ROLE', ROLE);

  if (ROLE === 'ADMIN_ROLE') {
    let menu = [{
        titulo: 'Principal',

        icono: 'fas fa-home',

        submenu: [
          { titulo: 'Dashboard', url: '/dashboard' }
        ]
      },
      {
        titulo: 'Catálogos',
        icono: 'fas fa-ellipsis-v',
        submenu: []
      },
      {
        titulo: 'Agencia',
        icono: 'far fa-bookmark',
        submenu: []
      },
      {
        titulo: 'Naviera',
        icono: 'fas fa-ship',
        submenu: []
      },
      {
        titulo: 'Transportista',
        icono: 'fas fa-truck-moving',
        submenu: []
      },
      {
        titulo: 'Facturación',
        icono: 'fas fa-dollar-sign',
        submenu: []
      }
    ];
    menu[0].submenu.unshift({ titulo: 'Lavado / Reparación', url: '/contenedoresLR' });
    menu[0].submenu.unshift({ titulo: 'Inventario', url: '/inventario' });
    menu[0].submenu.unshift({ titulo: 'Viajes', url: '/viajes' });
    menu[0].submenu.unshift({ titulo: 'Maniobras', url: '/maniobras' });
    menu[0].submenu.unshift({ titulo: 'Solicitudes', url: '/solicitudes/aprobaciones' });

    menu[1].submenu.unshift({ titulo: 'Clientes', url: '/clientes' });
    menu[1].submenu.unshift({ titulo: 'Reparaciones', url: '/reparaciones' });
    menu[1].submenu.unshift({ titulo: 'Operadores', url: '/operadores' });
    menu[1].submenu.unshift({ titulo: 'Camiones', url: '/camiones' });
    menu[1].submenu.unshift({ titulo: 'Buques', url: '/buques' });
    menu[1].submenu.unshift({ titulo: 'Transportistas', url: '/transportistas' });
    menu[1].submenu.unshift({ titulo: 'Agencias', url: '/agencias' });
    menu[1].submenu.unshift({ titulo: 'Navieras', url: '/navieras' });
    menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });

    //AGENCIA ADUANAL

    menu[2].submenu.unshift({ titulo: 'Solicitudes', url: '/solicitudes' });
    menu[2].submenu.unshift({ titulo: 'Clientes', url: '/clientes' });

    //NAVIERA

    menu[3].submenu.unshift({ titulo: 'Lavado / Reparación', url: '/contenedoresLR' });
    menu[3].submenu.unshift({ titulo: 'Inventario', url: '/inventario' });

    //TRANSPORTISTA
    menu[4].submenu.unshift({ titulo: 'Solicitudes', url: '/solicitudes_transportista' });
    menu[4].submenu.unshift({ titulo: 'Operadores', url: '/operadores' });
    menu[4].submenu.unshift({ titulo: 'Camiones', url: '/camiones' });

    menu[5].submenu.unshift({ titulo: 'Facturación Vacios', url: '/vacios' });
    menu[5].submenu.unshift({ titulo: 'Facturación Maniobras', url: '/facturacion-maniobras' });
    return menu;

  }

  if (ROLE === 'AA_ROLE') {
    let menu = [{
        titulo: 'Principal',
        icono: 'fas fa-home',
        submenu: [
          { titulo: 'Dashboard', url: '/dashboard' }
        ]
      },
      {
        titulo: 'Agencia',
        icono: 'far fa-bookmark',
        submenu: [

        ]
      },
    ];

    menu[1].submenu.unshift({ titulo: 'Solicitudes', url: '/solicitudes' });
    menu[1].submenu.unshift({ titulo: 'Clientes', url: '/clientes' });
    return menu;
  }

  if (ROLE === 'NAVIERA_ROLE') {
    let menu = [{
        titulo: 'Principal',
        icono: 'fas fa-home',
        submenu: [
          { titulo: 'Dashboard', url: '/dashboard' }
        ]
      },
      {
        titulo: 'Naviera',
        icono: 'fas fa-ship',
        submenu: [

        ]
      },
    ];

    menu[1].submenu.unshift({ titulo: 'Lavado / Reparación', url: '/contenedoresLR' });
    menu[1].submenu.unshift({ titulo: 'Inventario', url: '/inventario' });
    return menu;
  }
  if (ROLE === 'TRANSPORTISTA_ROLE') {
    let menu = [{
        titulo: 'Principal',
        icono: 'fas fa-home',
        submenu: [
          { titulo: 'Dashboard', url: '/dashboard' }
        ]
      },
      {
        titulo: 'Transportista',
        icono: 'fas fa-truck-moving',
        submenu: [

        ]
      },
    ];
    menu[1].submenu.unshift({ titulo: 'Solicitudes', url: '/solicitudes_transportista' });
    menu[1].submenu.unshift({ titulo: 'Operadores', url: '/operadores' });
    menu[1].submenu.unshift({ titulo: 'Camiones', url: '/camiones' });


    return menu;
  }


}

// export
module.exports = app;