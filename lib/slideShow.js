var config   = require('config');
var log4js   = require('log4js');
var touch    = require('touch');

var FileMonitor = require('./fileMonitor');

var logger   = log4js.getLogger();

module.exports = function( opts ) {

	var io     = opts.io;

	var fm = new FileMonitor({ io: io });

	var self = this;

	function init() {
		logger.debug( 'slideshow init' );
		fm.init();

		setInterval( showImage, 6000 );
	}

	function showImage() {
		var files = fm.completedFiles();
		if ( files.length == 0 ) { return; }

		logger.info ( 'showing image - ' + files[0].filename );
		var file = config.imageDir + '/' + files[0].filename
		touch( file, { mtime: new Date() }, function(err) { });
	}

	// return public var
	return {
		init: init
	}
};


