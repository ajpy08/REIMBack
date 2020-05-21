var express = require('express');
var app = express();
const path = require('path');
var CronJob = require('cron').CronJob;
const sentMail = require('../routes/sendAlert');
var ti = require('../config/config').correosTI
var fs = require('fs');
var TRoute = path.resolve(__dirname, `../xmlTemp/logCFDI.txt`);

// 00 59 23 * * 1-6' se ejecutara alas 11:59 pm de lunes a sabado 
console.log('INICIANDO TRABAJO PROGRAMADO DE ENVIO DE LOG DE FACTURACION CFDI VIA CORREO ');
const job = new CronJob('00 59 23 * * 1-6', function() {
var exist = fs.existsSync(TRoute);
	if (exist != false) {
		var log = fs.readFileSync(TRoute, 'utf8')
		sentMail('TI', ti,  'LOG_FACTURACION_TIMBRADO',log, 'emailAlert');
		console.log('Correo Enviado')
	} else {
		console.log('Archivo CFDI_FACTURACION.TXT IS NOT FOUND');
	}
});

job.start();


module.exports = app;