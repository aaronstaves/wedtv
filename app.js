var express = require('express');
var app     = express();
var config      = require('config');
var http        = require('http').Server(app);
var io          = require('socket.io')(http);

var SlideShow = require('./lib/slideShow');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/slidemin', function(req, res){
	res.sendFile(__dirname + '/admin.html');
});
app.use(express.static('static'));


io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

var slideShow = new SlideShow({ io: io });
slideShow.init();

http.listen(3000, function(){
	console.log('listening on *:3000');
});
