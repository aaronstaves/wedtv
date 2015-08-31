var app         = require('express')();
var config      = require('config');
var http        = require('http').Server(app);
var io          = require('socket.io')(http);

var SlideShow = require('./lib/slideShow');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
	});
});

var slideShow = new SlideShow({ io: io });
slideShow.init();

http.listen(3000, function(){
	console.log('listening on *:3000');
});
