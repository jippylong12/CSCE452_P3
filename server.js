//var http = require("http")
var express = require('express');
var app = express();
var path = require('path');
//var server = http.createServer(app);
//var io = require("socket.io").listen(server);
//var serverPacket = require("./serverPacket");

app.use(express.static(path.join(__dirname, '/client')));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/main.html'));
});

app.listen(8080);