// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var configuracion = require('./config/config');

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
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar Rutas
var appRoutes = require('./routes/app');
var exceltojson = require('./routes/exceltojson');
var uploadFileTemp = require('./routes/uploadFileTemp');
var loginRoutes = require('./routes/login');
var usuariosRoutes = require('./routes/usuarios');
var reparacionesRoutes = require('./routes/reparaciones');
var navieraRoutes = require('./routes/naviera');
var agenciaRoutes = require('./routes/agencia');
var transportistaRoutes = require('./routes/transportista');
var operadorRoutes = require('./routes/operador');
var camionRoutes = require('./routes/camion');
var buqueRoutes = require('./routes/buque');
var tiposContenedorRoutes = require('./routes/tiposContenedor');

var uploadRoutes = require('./routes/upload');
var dropzoneRoutes = require('./routes/dropzone');
var imagenesRoutes = require('./routes/imagenes');
var maniobraRoutes = require('./routes/maniobra');
var maniobrasRoutes = require('./routes/maniobras');
var clienteRoutes = require('./routes/cliente');
var viajesRoutes = require('./routes/viajes');
// var buesquedaRoutes = require('./routes/busqueda');
var forgotpass = require('./routes/forgotpass');
var resetpass = require('./routes/resetpass');
var UploadFile = require('./routes/uploadfile');
var solicitudRoute = require('./routes/solicitud');
var solicitudesRoute = require('./routes/solicitudes');


// Conexión a la base de datos Mongoose
mongoose.Promise = Promise;
mongoose.connection.on('connected', () => {
  console.log('Base de datos Mongoose: \x1b[32m%s\x1b[0m', 'online');
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

  await mongoose.connect(configuracion.CONEXION_MONGO, {
    autoReconnect: true,
    reconnectTries: 1000000,
    reconnectInterval: 3000,
    useCreateIndex: true,
    useNewUrlParser: true
  });
};

run().catch(error => console.error(error));

// Rutas
app.use('/login', loginRoutes);
app.use('/uploadFileTemp', uploadFileTemp);
app.use('/exceltojson', exceltojson);
app.use('/usuarios', usuariosRoutes); //ANGELUS
app.use('/reparaciones', reparacionesRoutes);
app.use('/navieras', navieraRoutes);
app.use('/agencias', agenciaRoutes);
app.use('/transportistas', transportistaRoutes);
app.use('/buques', buqueRoutes);
app.use('/operadores', operadorRoutes);
app.use('/camiones', camionRoutes);
app.use('/tipos_contenedores', tiposContenedorRoutes);

app.use('/uploadFile', UploadFile);
app.use('/reset_password', resetpass);
app.use('/forgot_password', forgotpass);
// app.use('/busqueda', buesquedaRoutes);
app.use('/viajes', viajesRoutes);
app.use('/cliente', clienteRoutes);
app.use('/maniobra', maniobraRoutes);
app.use('/maniobras', maniobrasRoutes);
app.use('/solicitudes', solicitudesRoute);
app.use('/solicitud', solicitudRoute);
app.use('/img', imagenesRoutes);
app.use('/dropzone', dropzoneRoutes);
app.use('/upload', uploadRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
  console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});