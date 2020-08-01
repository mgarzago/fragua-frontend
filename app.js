const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var json = [];
var NPs = [];
const URL = process.env.URL || 'http://i-ordenes-evals23-fuse.apps.cluster-fragua-4913.fragua-4913.example.opentlc.com';
const URL_PROC = process.env.URL_PROC || 'http://rest-to-amq-integracion.apps.cluster-fragua-4913.fragua-4913.example.opentlc.com/camel/order';
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';



app.listen(server_port, server_ip_address, function () {

  console.log( "Listening on " + server_ip_address + ", port " + server_port );

});

app.use(express.json());
app.use('/css',express.static(__dirname + '/public/'));
app.use('/figures',express.static(__dirname + '/assets/images/'));

app.use(bodyParser.urlencoded({extended:true}));

// EJS
app.engine('html',require('ejs').renderFile);


app.get('/',(req,res)=>{
    recibeOrdenes(res);
});

app.get('/ordenes/NP',(req,res)=>{
    recibeOrdenesNP(res);
});

app.get('/procesar/:orden',(req,res)=>{
    recibeOrdenAProcesar(req.params.orden);
});

app.post('/procesar',(req,res)=>{
    res.redirect('/procesar/'+req.body.orden);
});

app.post('/',(req,res)=>{
    agregaOrden(req.body.orden,req.body.estatus,req.body.emailcliente,req.body.telefonocliente);
    res.redirect('/');
});

function recibeOrdenes (res) {
    var request = require("request");
    
    var options = { method: 'GET',
      url: `${URL}` + '/ordenes/',
      headers: 
       { 'cache-control': 'no-cache',
         Connection: 'keep-alive',
         Cookie: 'd8220d0b1aa98b14f41fe885508ab737=35c291b67b3347fce0848d18ff21b6b9',
         'Accept-Encoding': 'gzip, deflate',
         Host: 'i-ordenes-evals23-fuse.apps.cluster-fragua-4913.fragua-4913.example.opentlc.com',
         'Postman-Token': '25022a6e-ec14-4a5f-ae3d-d144c9334745,e3034f60-dd66-46eb-a6a3-6d02a642b749',
         'Cache-Control': 'no-cache',
         Accept: '*/*',
         'User-Agent': 'PostmanRuntime/7.19.0',
         'Content-Type': 'application/json' } };
    
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    
      //console.log(body);
      body = body.replace('[','');
      body = body.replace(']','');
      var split = body.split('},{');
      console.log(split);
      for(var i = 0; i < split.length; i++){
        if(i == 0){
            split[i] = split[i] + '}';
        } 
        else{
            if(i == split.length-1){
                split[i]= '{' + split[i];
            }
            else {
                split[i] = '{' + split[i] + '}';
            }
        }
      }
      console.log(split);
      split.forEach(element => json.push(JSON.parse(element)));
      res.render('main.html',{ordenes : json});
      json = [];
      split = '';
    });
}

function recibeOrdenesNP(res){
    var request = require("request");

    var options = { method: 'GET',
      url: `${URL}` + '/ordenes/NP',
      headers: 
       { 'cache-control': 'no-cache',
         Connection: 'keep-alive',
         Cookie: 'd8220d0b1aa98b14f41fe885508ab737=c8b433581e18efe041b4192fa0577669',
         'Accept-Encoding': 'gzip, deflate',
         Host: 'i-ordenes-evals23-fuse.apps.cluster-fragua-4913.fragua-4913.example.opentlc.com',
         'Postman-Token': '4ba5f0de-d4a7-4513-94dd-682b7feec5c7,cb443d70-3869-4304-bbae-c4415a5f83a5',
         'Cache-Control': 'no-cache',
         Accept: '*/*',
         'User-Agent': 'PostmanRuntime/7.19.0',
         'Content-Type': 'application/json' } };
    
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    
      //console.log(body);
      body = body.replace('[','');
      body = body.replace(']','');
      var split = body.split('},{');
      //console.log(split);
      for(var i = 0; i < split.length; i++){
        if(i == 0){
            split[i] = split[i] + '}';
        } 
        else{
            if(i == split.length-1){
                split[i]= '{' + split[i];
            }
            else {
                split[i] = '{' + split[i] + '}';
            }
        }
      }
      console.log(split);
      split.forEach(element => NPs.push(JSON.parse(element)));
      res.render('ordenesNP.html',{ordenes : NPs});
      NPs = [];
      split = '';
    });
}

function recibeOrdenAProcesar(orden){
    var request = require("request");

    var options = { method: 'GET',
      url: `${URL}` + '/procesar/' + orden,
      headers: 
       { 'cache-control': 'no-cache',
         Connection: 'keep-alive',
         Cookie: 'd8220d0b1aa98b14f41fe885508ab737=c8b433581e18efe041b4192fa0577669',
         'Accept-Encoding': 'gzip, deflate',
         Host: 'i-ordenes-evals23-fuse.apps.cluster-fragua-4913.fragua-4913.example.opentlc.com',
         'Postman-Token': '4ba5f0de-d4a7-4513-94dd-682b7feec5c7,cb443d70-3869-4304-bbae-c4415a5f83a5',
         'Cache-Control': 'no-cache',
         Accept: '*/*',
         'User-Agent': 'PostmanRuntime/7.19.0',
         'Content-Type': 'application/json' } };
    
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    
      //console.log(body);
      var ordenJson = JSON.parse(body);
      console.log(ordenJson);
      procesarOrden(ordenJson);
    });
}

function agregaOrden (orden, estatus, emailCliente, telefonoCliente){
    const request = require('request');
    
    request.post( `${URL}` + '/ordenes', {
      json: {
        orden: orden,
        estatus: estatus,
        emailCliente: emailCliente,
        telefonoCliente: telefonoCliente
      }
    }, (error, res, body) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`statusCode: ${res.statusCode}`);
      console.log(body);
    });
}


function procesarOrden (ordenCompleta){
    const request = require('request');
    
    request.post( `${URL_PROC}` /* url de la API que procesará la orden individual*/, {
      json: ordenCompleta
    }, (error, res, body) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`statusCode: ${res.statusCode}`);
      console.log(body);
    });
}
