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
var dataPacket;

app.use(express.static(path.join(__dirname, '/client')));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/main.html'));
});

// store game variables
var world_data;

initialize();

//initialize server data, and set event handlers
function initialize(){
	var sAngle1 =-90;
	var sAngle2 =0;
	var sAngle3 =0;
	var delay = false;
	dataPacket = [sAngle1, sAngle2, sAngle3, masterBool, delay];
	
	//set event handlers
	io.on("connection", function(socket){
		console.log("ClientID: "+ socket.id+" has joined.");
		//mapping names to functions called on server and client
		socket.on("newClient", newClient);
		socket.on("disconnect", clientDisconnect);
		socket.on("syncData", syncData);
	}
}

function newClient(){
	clientCount+=1;
	//if first client, it is now master
	masterBool = (clientCount == 1);
	dataPacket[3] = masterBool;
	//emit dataSync to client with current initialization
	this.emit("syncData", dataPacket);
}

function clientDisconnect(){
	console.log("ClientID: "+this.id+" has disconnected");
	if(clientCount > 0){
		clientCount--;
	}
	else{
		console.log("Negative clients... ignoring");
	}
}

function syncData(data){
	//sync server data with incoming client data
	dataPacket = data;
	//emit server data to both clients
	this.broadcast.emit("syncData", dataPacket);
}

http.listen(3000, function(){
	//local listen for now...
    console.log('listening on *:3000');
});