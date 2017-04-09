var config   = require('config');
var log4js   = require('log4js');
var touch    = require('touch');

var FileMonitor = require('./fileMonitor');

var logger   = log4js.getLogger();

module.exports = function( opts ) {

	var io            = opts.io;
	var socket        = opts.socket;
	var current_image = 'loading';
	var interval      = null;

	var fm = new FileMonitor({ io: io });

	var self = this;

	function init() {
		var interval_time = config.interval || 60000;
		logger.debug( 'slideshow init' );
		fm.init();

		io.on('connection', function(socket) {
			socket.emit('show image', current_image);
			socket.emit('update list', fm.completedFiles() );
			socket.emit('slideshow current speed', interval_time );

			socket.on('delete image', function(filename){
				fm.moveImage( filename );
			});
			socket.on('prioritize image', function(filename){
				fm.prioritizeImage( filename );
			});
			socket.on('update speed', function(seconds){
				interval_time = seconds * 1000;
				logger.debug( 'Changing interval to ' + seconds + '( ' + interval_time + ' )' );
				clearInterval( interval );
				interval = setInterval( showImage, interval_time );
			});
		});

		interval = setInterval( showImage, interval_time );
	}

	function showImage() {
		var files = fm.completedFiles();
		if ( files.length == 0 ) { return; }

		logger.info ( 'showing image - ' + files[0].filename );
		current_image = 'images/'+files[0].filename;
		io.emit('show image', current_image);

		// update file to put at end of queue
		var file = config.imageDir + '/' + files[0].filename
		touch( file, { mtime: new Date() }, function(err) { 
			console.dir(err);
		});

	}

	// return public var
	return {
		init: init
	}
};


