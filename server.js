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

// store game variables
var world_data;

io.on('connection', function(socket){

    socket.on('join', function(data){
       console.log("Client joined");

        clientCount+=1;

        //IF THIS IS THE FIRST IT NOW BECOMES THE MASTER
        masterBool = (clientCount == 1);

        clients[socket.id] = masterBool;

        console.log("masterBool = " + masterBool);

        socket.emit('master', masterBool);

    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
        clientCount-=1;
        delete clients[socket.id];
        console.log('clientCount: ' + clientCount);
    });
    socket.on('angles', function(msg){
        console.log('message: ' + msg);
    });
    socket.on('world data', function(data){
        console.log("angle 1: " + data.angle1);
        console.log("angle 2: " + data.angle2);
        console.log("angle 3: " + data.angle3);

        world_data = data;

        socket.emit('update_vars', world_data);
    });



});

http.listen(3000, function(){
    console.log('listening on *:3000');
});