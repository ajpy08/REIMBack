// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
// var CronJob = require('cron').CronJob;
var entorno = require('./config/config').config();
// var server = require('http').createServer(app);
// var io = require('socket.io')(server);

// Inicializar variables
var app = express();

var corsOptions = {
  origin: '*',
  methods: ['POST, GET, PUT, DELETE, OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'contentType', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser
// parse application/x-www-form-urlencoded
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Importar Rutas
var appRoutes = require('./routes/app');
var exceltojson = require('./routes/exceltojson');
var uploadFileTemp = require('./routes/uploadFileTemp');
var uploadFileTempBucket = require('./routes/uploadFileTempBucket');
var documentosRoutes = require('./routes/documentos');
var reparacionesRoutes = require('./routes/reparaciones');
var reportesRoutes = require('./routes/reportes');
var loginRoutes = require('./routes/login');
var usuariosRoutes = require('./routes/usuarios');
var navieraRoutes = require('./routes/navieras');
var agenciaRoutes = require('./routes/agencias');
var transportistaRoutes = require('./routes/transportistas');
var buqueRoutes = require('./routes/buques');
var vigenciasRoutes = require('./routes/vigencias');
var operadorRoutes = require('./routes/operadores');
var camionRoutes = require('./routes/camiones');
var tiposContenedorRoutes = require('./routes/tiposContenedor');
var registroRoutes = require('./routes/registros');
var uploadRoutes = require('./routes/upload');
var dropzoneRoutes = require('./routes/dropzone');
var imagenesRoutes = require('./routes/imagenes');
var maniobraRoutes = require('./routes/maniobra');
var maniobrasRoutes = require('./routes/maniobras');
var clienteRoutes = require('./routes/clientes');
var viajesRoutes = require('./routes/viajes');
var forgotpass = require('./routes/forgotpass');
var resetpass = require('./routes/resetpass');
var UploadFile = require('./routes/uploadfile');
var solicitudRoute = require('./routes/solicitud');
var solicitudesRoute = require('./routes/solicitudes');
var coordenadasRoutes = require('./routes/coordenadas');
var liberacionesRoute = require('./routes/liberacionesBL');
var EDIRoutes = require('./routes/EDIs');
var StatusRoutes = require('./routes/status');
var ProdServRoutes = require('./routes/productos-servicios');
var ClaveProdSerRoutes = require('./routes/clave-productos-servicios');
var ClaveUnidad = require('./routes/clave-unidades');
var FacturacionRoutes = require('./routes/facturacion');
var CFDIRoutes = require('./routes/cfdis');
var NOTASRoutes = require('./routes/notas-de-credito');
// var jobsRoutes = require('./routes/jobs');
var pdfFacturacionRoutes = require('./routes/pdfFacturacion');
var materialesRoutes = require('./routes/materiales');
var unidadesRoutes = require('./routes/unidades');
var entradasRoutes = require('./routes/entradas');

var proveedorRoutes = require('./routes/proveedores');

// Rutas
app.use('/login', loginRoutes);
app.use('/uploadFile', UploadFile);
app.use('/uploadFileTemp', uploadFileTemp);
app.use('/uploadBucketTemp', uploadFileTempBucket);
app.use('/exceltojson', exceltojson);
app.use('/documentos', documentosRoutes);
app.use('/usuarios', usuariosRoutes); //ANGELUS
app.use('/reparaciones', reparacionesRoutes);
app.use('/navieras', navieraRoutes);
app.use('/agencias', agenciaRoutes);
app.use('/transportistas', transportistaRoutes);
app.use('/buques', buqueRoutes);
app.use('/vigencias', vigenciasRoutes);
app.use('/operadores', operadorRoutes);
app.use('/registros', registroRoutes);
app.use('/camiones', camionRoutes);
app.use('/tipos_contenedores', tiposContenedorRoutes);
app.use('/reset_password', resetpass);
app.use('/forgot_password', forgotpass);
app.use('/viajes', viajesRoutes);
app.use('/clientes', clienteRoutes);
app.use('/maniobra', maniobraRoutes);
app.use('/maniobras', maniobrasRoutes);
app.use('/solicitudes', solicitudesRoute);
app.use('/solicitud', solicitudRoute);
app.use('/img', imagenesRoutes);
app.use('/dropzone', dropzoneRoutes);
app.use('/upload', uploadRoutes);
app.use('/coordenadas', coordenadasRoutes);
app.use('/liberaciones', liberacionesRoute);
app.use('/EDI', EDIRoutes);
app.use('/status', StatusRoutes);
app.use('/clave-productos-servicios', ClaveProdSerRoutes);
app.use('/clave-unidades', ClaveUnidad);
app.use('/productos-servicios', ProdServRoutes);
app.use('/facturacion', FacturacionRoutes);
app.use('/cfdis', CFDIRoutes);
app.use('/notas', NOTASRoutes);
app.use('/reportes', reportesRoutes);
// app.use('/jobs', jobsRoutes);
app.use('/pdfFacturacion', pdfFacturacionRoutes);
app.use('/proveedores', proveedorRoutes);
app.use('/materiales', materialesRoutes);
app.use('/unidades', unidadesRoutes);
app.use('/entradas', entradasRoutes);
app.use('/', appRoutes);

// Conexión a la base de datos Mongoose
mongoose.Promise = Promise;
mongoose.connection.on('connected', () => {
  console.log('Base de datos Mongoose: \x1b[32m%s\x1b[0m', 'ONLINE');
});
mongoose.connection.on('reconnected', () => {
  console.log('Connection Reestablished');
});

mongoose.connection.on('disconnected', () => {
  console.log('Connection Disconnected');
});

mongoose.connection.on('close', () => {
  console.log('Connection Closed');
});

mongoose.connection.on('error', (error) => {
  console.log('ERROR: ' + error);
});

const run = async() => {
  await mongoose.connect(entorno.CONEXION_MONGO, {
    autoReconnect: true,
    reconnectTries: 1000000,
    reconnectInterval: 3000,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
  });
};

run().catch(error => console.error(error));

// Escuchar peticiones
var server = app.listen(3000, () => {
  console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE');
  console.log('Server Socket.io 3000: \x1b[32m%s\x1b[0m', 'ONLINE');
  console.log(entorno.CONEXION_MONGO);
  if (process.env.NODE_ENV) {
    console.log('\x1b[34m', process.env.NODE_ENV);
  } else {
    console.log('\x1b[31m%s\x1b[0m', 'SIN NODE_ENV')
  }
});

/* #region  Socket IO */
var io = require('socket.io').listen(server, {
  log: false,
  agent: false,
  origins: '*:*',
  transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
});

/* #region  SOCKETS */
io.on('connection', function(socket) {
  // ! USERS
  socket.on('loginuser', function(data) {
    io.emit('login-user', { data: data });
    // console.log('Alguien inicio sesion!!! =D');
  });
  socket.on('logoutuser', function(data) {
    io.emit('logout-user', { data: data });
    // console.log('Alguien cerró sesion!!! =(');
  });
  //! BUQUES
  socket.on('newbuque', function(data) {
    io.emit('new-buque', { data: data });
    // console.log('Agregaste un buque!!! =D ');
  });
  socket.on('updatebuque', function(data) {
    io.emit('update-buque', { data: data });
    // console.log('Actualizaste un buque!!! =) ');
  });
  socket.on('deletebuque', function(data) {
    io.emit('delete-buque', { data: data });
    // console.log('Eliminaste un buque!!! =( ');
  });

  // ! SOLICITUDES

  socket.on('newsolicitud', function(data) {
    io.emit('new-solicitud', { data: data });
    // console.log('nueva solicitud');
  });
  socket.on('updatesolicitud', function(data) {
    io.emit('update-solicitud', { data: data });
    // console.log('actualizacion solicitud');
  });
  socket.on('deletesolicitud', function(data) {
    io.emit('delete-solicitud', { data: data });
    // console.log('eliminar solicitud');
  });
  socket.on('aprobarsolicitud', function(data) {
    io.emit('aprobar-solicitud', { data: data });
  });
  socket.on('deletemaniobra', function(data) {
    io.emit('delete-maniobra', { data: data });
  });
  socket.on('deletemaniobradescarga', function(data) {
    io.emit('delete-maniobra-descarga', { data: data });
  });

  // ! SOCKET PARA TRANSPORTISTA 

  socket.on('newcamion', function(data) {
    io.emit('new-camion', { data: data });
    // console.log('SE AGREGO UN NUEVO CAMION');
  });
  socket.on('updatecamion', function(data) {
    io.emit('update-camion', { data: data });
    // console.log('UPDATE CAMION');
  });
  socket.on('deletecamion', function(data) {
    io.emit('delete-camion', { data: data });
    // console.log('DELETE CAMION');
  });

  socket.on('newoperador', function(data) {
    io.emit('new-operador', { data: data });

  });
  socket.on('updateoperador', function(data) {
    io.emit('update-operador', { data: data });

  });
  socket.on('deleteoperador', function(data) {
    io.emit('delete-operador', { data: data });
  });


  // ! SOCKET PARA PAPELETA

  socket.on('updatepapeleta', function(data) {
    io.emit('update-papeleta', { data: data });
  });

  socket.on('asignacionpapeleta', function(data) {
    io.emit('asignacion-papeleta', { data: data });
  });

  // ! SOCKET PARA CFDI
  socket.on('updatecfdi', function(data) {
    io.emit('update-cfdi', { data: data });
  });
  socket.on('deletecfdi', function(data) {
    io.emit('delete-cfdi', { data: data });
  });
  socket.on('newcfdi', function(data) {
    io.emit('new-cfdi', { data: data });
  });
  socket.on('timbradocfdi', function(data) {
    io.emit('timbrado-cfdi', { data: data });
  });
  socket.on('alerttimbre', function(data) {
      io.emit('alert-timbre', { data: data })
    })
    // ! SOCKET PARA NOTAS

  socket.on('alertimbreNota', function(data) {
    io.emit('alerttimbre-Nota', { data: data });

    socket.on('timbrandoNota', function(data) {
      io.emit('timbrado-Nota', { data: data });
    });
  })

  // ! SOCKET PARA CLIENTES


  socket.on('newcliente', function(data) {
    io.emit('new-cliente', { data: data });
  });
  socket.on('updatecliente', function(data) {
    io.emit('update-cliente', { data: data });
  });
  socket.on('deletecliente', function(data) {
    io.emit('delete-cliente', { data: data });
  });

  // ! SOCKET NOTAS DE CREDITO 

  socket.on('notaTimbre', function(data) {
    io.emit('nota-Timbre', { data: data });
  });

  //! SOCKET MANIOBRAS 

  socket.on('cambiomaniobra', function(data) {
    io.emit('cambio-maniobra', { data: data });
  });

  /* #endregion */

  /* #region  SOCKET USUARIO */
  socket.on('actualizarperfil', function(data) {
    io.emit('actualizar-perfil', { data: data });
  });
  /* #endregion */

  /* #region  SOCKET VIGENCIA */
  socket.on('newvigencia', function(data) {
    io.emit('new-vigencia', { data: data });
    // console.log('Agregaste un buque!!! =D ');
  });
  socket.on('updatevigencia', function(data) {
    io.emit('update-vigencia', { data: data });
    // console.log('Actualizaste un buque!!! =) ');
  });
  socket.on('deletevigencia', function(data) {
    io.emit('delete-vigencia', { data: data });
    // console.log('Eliminaste un buque!!! =( ');
  });
  /* #endregion */


  /* #region  SOCKET Proveedores */
  socket.on('newproveedor', function(data) {
    io.emit('new-proveedor', { data: data });
    // console.log('Agregaste un buque!!! =D ');
  });
  socket.on('updateproveedor', function(data) {
    io.emit('update-proveedor', { data: data });
    // console.log('Actualizaste un buque!!! =) ');
  });
  socket.on('deleteproveedor', function(data) {
    io.emit('delete-proveedor', { data: data });
    // console.log('Eliminaste un buque!!! =( ');
  });
  /* #endregion */


  /* #region  SOCKET MATERIALES */
  socket.on('newmaterial', function(data) {
    io.emit('new-material', { data: data });
    // console.log('Agregaste un material!!! =D ');
  });
  socket.on('updatematerial', function(data) {
    io.emit('update-material', { data: data });
    // console.log('Actualizaste un material!!! =) ');
  });
  socket.on('deletematerial', function(data) {
    io.emit('delete-material', { data: data });
    // console.log('Eliminaste un material!!! =( ');
  });
  /* #endregion */

  /* #region  SOCKET ENTRADAS */
  socket.on('newentrada', function(data) {
    io.emit('new-entrada', { data: data });
    // console.log('Agregaste una entrada!!! =D ');
  });
  socket.on('updateentrada', function(data) {
    io.emit('update-entrada', { data: data });
    // console.log('Actualizaste una entrada!!! =) ');
  });
  socket.on('deleteentrada', function(data) {
    io.emit('delete-entrada', { data: data });
    // console.log('Eliminaste una entrada!!! =( ');
  });
  /* #endregion */

});
/* #endregion */



/* #endregion */