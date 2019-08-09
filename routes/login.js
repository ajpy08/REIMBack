// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

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
        icono: 'mdi mdi-gauge',
        submenu: [
          { titulo: 'Dashboard', url: '/dashboard' }
        ]
      },
      {
        titulo: 'Catálogos',
        icono: 'mdi mdi-folder-lock-open',
        submenu: []
      },
      {
        titulo: 'Agencia',
        icono: 'mdi mdi-folder-lock-open',
        submenu: [

        ]
      },
      {
        titulo: 'Naviera',
        icono: 'mdi mdi-folder-lock-open',
        submenu: [

        ]
      },
      {
        titulo: 'Transportista',
        icono: 'mdi mdi-folder-lock-open',
        submenu: [

        ]
      },
    ];
    menu[0].submenu.unshift({ titulo: 'Vacios', url: '/vacios' });
    menu[0].submenu.unshift({ titulo: 'Cont. X Cargar', url: '/xcargar' });
    menu[0].submenu.unshift({ titulo: 'Contenedores Disponibles', url: '/disponibles' });
    menu[0].submenu.unshift({ titulo: 'Lavado / Reparación', url: '/lavado_reparacion' });
    menu[0].submenu.unshift({ titulo: 'Revision', url: '/revision' });
    menu[0].submenu.unshift({ titulo: 'Espera', url: '/espera' });
    menu[0].submenu.unshift({ titulo: 'Transito', url: '/transito' });
    menu[0].submenu.unshift({ titulo: 'Solicitudes', url: '/solicitudes_aprobaciones' });
    menu[0].submenu.unshift({ titulo: 'Viajes', url: '/viajes' });
    menu[0].submenu.unshift({ titulo: 'Maniobras', url: '/maniobras' });
    //menu[0].submenu.unshift({ titulo: 'Buques2', url: '/buques2' });

    menu[1].submenu.unshift({ titulo: 'Reparaciones', url: '/reparaciones' });
    menu[1].submenu.unshift({ titulo: 'Clientes', url: '/clientes' });
    menu[1].submenu.unshift({ titulo: 'Operadores', url: '/operadores' });
    menu[1].submenu.unshift({ titulo: 'Camiones', url: '/camiones' });
    menu[1].submenu.unshift({ titulo: 'Transportistas', url: '/transportistas' });
    menu[1].submenu.unshift({ titulo: 'Agencias', url: '/agencias' });
    menu[1].submenu.unshift({ titulo: 'Buques', url: '/buques2' });
    menu[1].submenu.unshift({ titulo: 'Navieras', url: '/navieras' });
    menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    

    menu[2].submenu.unshift({ titulo: 'Solicitud de carga', url: '/solicitudes_carga' });
    menu[2].submenu.unshift({ titulo: 'Solicitud de descarga', url: '/solicitudes_descarga' });
    menu[2].submenu.unshift({ titulo: 'Reporte de contenedores reparación / lavado', url: '/reportesRL' });
    menu[2].submenu.unshift({ titulo: 'Contenedores en reparación / lavado', url: '/contenedoresRL' });

    return menu;

  }
  if (ROLE === 'AA_ROLE') {
    let menu = [{
        titulo: 'Principal',
        icono: 'mdi mdi-gauge',
        submenu: [
          { titulo: 'Dashboard', url: '/dashboard' }
        ]
      },
      {
        titulo: 'Agencia',
        icono: 'mdi mdi-folder-lock-open',
        submenu: [

        ]
      },
    ];

    menu[1].submenu.unshift({ titulo: 'Solicitud de carga', url: '/solicitudes_carga' });
    menu[1].submenu.unshift({ titulo: 'Solicitud de descarga', url: '/solicitudes_descarga' });
    menu[1].submenu.unshift({ titulo: 'Clientes', url: '/clientes' });

    return menu;
  }
  if (ROLE === 'NAVIERA_ROLE') {
    let menu = [{
        titulo: 'Principal',
        icono: 'mdi mdi-gauge',
        submenu: [
          { titulo: 'Dashboard', url: '/dashboard' }
        ]
      },
      {
        titulo: 'Naviera',
        icono: 'mdi mdi-folder-lock-open',
        submenu: [

        ]
      },
    ];
    menu[1].submenu.unshift({ titulo: 'Buques', url: '/buques' });
    menu[1].submenu.unshift({ titulo: 'Reporte de contenedores reparación / lavado', url: '/reportesRL' });
    menu[1].submenu.unshift({ titulo: 'Contenedores en reparación / lavado', url: '/contenedoresRL' });
    menu[1].submenu.unshift({ titulo: 'Contenedores Disponibles', url: '/contenedoresDisponibles' });
    menu[1].submenu.unshift({ titulo: 'Viajes', url: '/viajes' });

    return menu;
  }
  if (ROLE === 'TRANSPORTISTA_ROLE') {
    let menu = [{
        titulo: 'Principal',
        icono: 'mdi mdi-gauge',
        submenu: [
          { titulo: 'Dashboard', url: '/dashboard' }
        ]
      },
      {
        titulo: 'Transportista',
        icono: 'mdi mdi-folder-lock-open',
        submenu: [

        ]
      },
    ];
    menu[1].submenu.unshift({ titulo: 'Operadores', url: '/operadores' });
    menu[1].submenu.unshift({ titulo: 'Camiones', url: '/camiones' });

    return menu;
  }


}

// export
module.exports = app;