var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
//var server = http.createServer(app);
var io = require('socket.io')(http);
//var serverPacket = require("./serverPacket");

var clients = {};
var clientCount = 0;
var masterBool = false;
app.use(express.static(path.join(__dirname, '/client')));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/main.html'));
});

io.on('connection', function(socket){
    socket.on('disconnect', function(){
        console.log('user disconnected');
        clientCount-=1;
        delete clients[socket.id];
    });
    socket.on('angles', function(msg){
        console.log('message: ' + msg);
    });
    console.log('a user connected');
    clientCount+=1;
    //IF THIS IS THE FIRST IT NOW BECOMES THE MASTER
    masterBool = clientCount == 1;

    clients[socket.id] = masterBool;


});

http.listen(3000, function(){
    console.log('listening on *:3000');
});