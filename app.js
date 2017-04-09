var express = require('express');
var app     = express();
var path    = require('path');
var config  = require('config');
var http    = require('http').Server(app);
var io      = require('socket.io')(http);

var SlideShow = require('./lib/slideShow');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/slidemin', function(req, res){
	res.sendFile(__dirname + '/admin.html');
});

app.get('/images', function(req, res){
	res.sendFile(__dirname + '/xxx.html');
});
console.log(__dirname + '/' + config.imageDir );
app.use(express.static('static'));
app.use('/images', express.static(config.imageDir));



io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

var slideShow = new SlideShow({ io: io });
slideShow.init();

http.listen(config.port, function(){
	console.log('listening on *:' + config.port);
});
