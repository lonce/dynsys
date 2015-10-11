// The server only needs to register for msgs it needs to intercept
// Otherwise, msgs between clients just get passed right through. 

var express = require("express")
, app = express()
, server = require('http').createServer(app)
, WebSocketServer = require('ws').Server
, wss = new WebSocketServer({server: server});

//-------------------------------------------------------------

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

//****************************************************************************
app.use(express.static(__dirname + "/www"));

wss.on('connection', function (ws) {
    ws.id = id++;
    console.log("got a connection at time " + Date.now() + ", assigning ID = " + ws.id);
    ws.on('close', function() {        
        callbacks['unsubscribe'].call(ws, ws.room);
    });
});

exports.server = server;

