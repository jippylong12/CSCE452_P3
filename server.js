var express = require('express');
var app = express();
var path = require('path');
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var serverPacket = require("./serverPacket");



// Serve static files from client directory to html
app.use(express.static(path.join(__dirname, '/client')));

// viewed at http://localhost:8080
//var socket = server.listen(8080); <-- Use this when running locally
var socket = server.listen(process.env.PORT, process.env.IP);

init();
var servPack; //what we are sending back and forth

// Initializes our serverPacket object and sets event handlers
function init() {
    servPack = new serverPacket(-90, 0, 0, false, "serverID", true);
	setEventHandlers();
};


//NOTE:: change function names here to more accurately represent refactored code in game.js
// Event Handlers for handling different events sent from our clients
function setEventHandlers() {
	io.on("connection", function(client) {
		console.log("New user has joined session - " + client.id);
		client.on("new client", onNewClient);
		client.on("connect", onConnect);
		client.on("disconnect", onClientDisconnect);
		client.on("move", onMove);
		client.on("paint", onPaint);
		client.on("setup", onSetup);
	});
};

function onConnect(){
    this.emit("connect"); //NOTE:: ping client that we are connected?
}



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/main.html'));
});

io.on('connection', function(client) {
    console.log('Client connected...');
    
    client.on('join', function (data) {
        console.log(data);
    })
})

app.listen(8080);