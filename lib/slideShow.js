var config   = require('config');
var log4js   = require('log4js');
var touch    = require('touch');

var FileMonitor = require('./fileMonitor');

var logger   = log4js.getLogger();

module.exports = function( opts ) {

	var io            = opts.io;
	var current_image = 'loading';

	var fm = new FileMonitor({ io: io });

	var self = this;

	function init() {
		logger.debug( 'slideshow init' );
		fm.init();

		io.on('connection', function(socket) {
			socket.emit('show image', current_image);
		});
		setInterval( showImage, 6000 );
	}

	function showImage() {
		var files = fm.completedFiles();
		if ( files.length == 0 ) { return; }

		logger.info ( 'showing image - ' + files[0].filename );
		current_image = 'images/'+files[0].filename;
		io.emit('show image', current_image);

		// update file to put at end of queue
		var file = config.imageDir + '/' + files[0].filename
		touch( file, { mtime: new Date() }, function(err) { });

	}

	// return public var
	return {
		init: init
	}
};


