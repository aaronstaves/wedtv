var fileMonitor = function() {

	var fs       = require('fs');
	var config   = require('config');
	var mongoose = require('mongoose');
	var log4js   = require('log4js');

	var logger = log4js.getLogger();
	var files  = {};

	var self = this;

	this.init = function() {

		fs.readdir( config.imageDir, function(err, files) {

			files.forEach( function( filename ) {
				self.updateFile('initadd', filename );
			});

			fs.watch( config.imageDir, { persistent: true, recursive: false }, self.updateFile );
		});
	}

	/* Events */
	// updateFile -- called when an fs event fires off for a file
	this.updateFile = function( type, filename ) {

		// file already exists and has a timeout, lets clear it before
		// doing anything else
		if ( files[ filename ] && files[ filename ].timeout ) {
			clearTimeout( files[ filename ].timeout );
		}

		// if file was changed/modified
		if( type == 'change' ) {

			logger.debug(type + ' - ' + filename);

			// setup a new timeout, if file hasn't been changed in 5s, add it
			files[ filename ] = { timeout : setTimeout( self.addFile, 5000, filename ) };
		}

		// If it was renamed/deleted
		else if ( type == 'rename' || type == 'initadd' ) {

			logger.info(type + ' - ' + filename);

			fs.exists( config.imageDir + '/' + filename, function( exists ) {

				// no longer exists, remove it
				if ( !exists && files[ filename ]  ) {
					self.removeFile(filename);
				}

				// otherwise we're adding this file
				else {
					files[ filename ] = { timeout : setTimeout( self.addFile, 5000, filename ) };
				}
			});
		}
		else {
			logger.warn('unknown event type "' + type + '" found [fileMonitor.updateFile]');
		}
	}

	/* Methods */
	// addFile -- called when we're (mostly) sure that a file is finished uploading/copying
	this.addFile = function( filename ) {
		logger.info('Adding ' + filename);

		clearTimeout( files[ filename ].timeout );
		delete files[ filename ].timeout;
		files[ filename ].complete = 1;
		logger.debug(files);
	}

	// removeFIle -- called when a file no longer exists
	this.removeFile = function( filename ) {
		logger.info('Removing ' + filename);

		if ( files[ filename ] ) {
			if ( files[ filename ].timeout ) {
				clearTimeout( files[ filename ].timeout );
			}
			delete files[ filename ];
		}
		logger.debug(files);
	}

}

module.exports = new fileMonitor();
