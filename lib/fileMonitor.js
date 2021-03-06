var fs       = require('fs');
var config   = require('config');
var mkdirp   = require('mkdirp');
var touch    = require('touch');
var lwip     = require('lwip');

var log4js   = require('log4js');
var logger   = log4js.getLogger();

module.exports = function( opts ) {

	var io     = opts.io;
	var rmdir  = 'deleted';
	var tndir  = config.imageDir + '/tn';
	var tnflag = false;

	var files  = {};

	// create deleted dir if it doesn't already exist
	fs.stat( rmdir, function( err, exists ) {
		if ( err ) {
			logger.debug( 'creating ' + rmdir );
			mkdirp( rmdir );
		}
	});

	// create thumbnail dir if it doesn't already exist
	fs.stat( tndir, function( err, exists ) {
		if ( err ) {
			logger.debug( 'creating ' + tndir );
			mkdirp( tndir );
		}
	});

	var self = this;

	function init() {

		fs.readdir( config.imageDir, function(err, files) {

			files.forEach( function( filename ) {
				updateFile('initadd', filename );
			});

			fs.watch( config.imageDir, { persistent: true, recursive: false }, updateFile );
			logger.debug('monitoring ' + config.imageDir + '/' );
		});

	}

	function moveImage ( filename ) {
		var oldFile = config.imageDir + '/' + filename;
		var newFile = rmdir + '/' + filename;
		fs.rename( oldFile, newFile, function(err) {
			if ( err ) {
				logger.error( err );
			}
		});
	}

	function prioritizeImage ( filename ) {
		var file = config.imageDir + '/' + filename;
		touch( file, { mtime: new Date(2014, 1, 1) }, function(err) { });
	}

	/* Events */
	// updateFile -- called when an fs event fires off for a file
	function updateFile( type, filename, info ) {

		if ( filename.match('^tn') ) {
			return;
		}

		// file already exists and has a timeout, lets clear it before
		// doing anything else
		if ( files[ filename ] && files[ filename ].timeout ) {
			clearTimeout( files[ filename ].timeout );
		}

		// if file was changed/modified
		if( type == 'change' ) {

			logger.debug(type + ' - ' + filename);

			// setup a new timeout, if file hasn't been changed in 5s, add it
			files[ filename ] = { timeout : setTimeout( addFile, 5000, filename ) };
		}

		// If it was renamed/deleted
		else if ( type == 'rename' || type == 'initadd' ) {

			logger.info(type + ' - ' + filename);

			fs.exists( config.imageDir + '/' + filename, function( exists ) {

				// no longer exists, remove it
				if ( !exists && files[ filename ]  ) {
					removeFile(filename);
				}

				// otherwise we're adding this file
				else {
					files[ filename ] = { timeout : setTimeout( addFile, 5000, filename ) };
				}
			});
		}
		else {
			logger.warn('unknown event type "' + type + '" found [fileMonitor.updateFile]');
		}
	}

	/* Methods */
	// addFile -- called when we're (mostly) sure that a file is finished uploading/copying
	function addFile( filename ) {
		logger.info('Adding ' + filename);

		// remove timeout
		clearTimeout( files[ filename ].timeout );
		delete files[ filename ].timeout;

		// populate file info in our hash
		fs.stat( config.imageDir + '/' + filename, function (err, info) {
			files[ filename ] = info;
			files[ filename ].complete = 1;
			files[ filename ].filename = filename;
		});

		var thumbnail = tndir + '/' + filename;
		fs.stat( thumbnail, function( err, exists ) {

			// create thumbnail for the file if it doesn't exist
			if ( !exists ) {
				if ( tnflag === true ) {
					logger.debug( 'already creating thumbnail, putting off ' + config.imageDir + '/' + filename );
					files[ filename ] = { timeout : setTimeout( addFile, 250, filename ) }
					return;
				}
				tnflag = true;
				logger.debug( 'creating thumbnail for ' + config.imageDir + '/' + filename );
				lwip.open( config.imageDir + '/' + filename, function(err, image) {

					if ( err ) {
						logger.error( err );
					}
					else {
					image.batch()
						.scale(0.10)
						.writeFile(thumbnail, function(err){
							if ( err ) {
								logger.error ( 'Error creating ' + thumbnail );
								logger.error( err )
							}
						});
					}
					tnflag = false;
				});
			}

		});

		io.emit('update list', completedFiles() );

	}

	// removeFIle -- called when a file no longer exists
	function removeFile( filename ) {
		logger.info('Removing ' + filename);

		if ( files[ filename ] ) {
			if ( files[ filename ].timeout ) {
				clearTimeout( files[ filename ].timeout );
			}
			delete files[ filename ];
		}
		io.emit('update list', completedFiles() );
	}

	function completedFiles( ) {
		var completed = [];
		for ( var filename in files ) {
			if ( files[ filename ].complete && files[ filename ].complete == 1 ) {
				completed.push( files[ filename ] );
			}
		}

		completed.sort( function(a,b) {
			return new Date(a.mtime) - new Date(b.mtime);
		});
		return completed;
	}

	// return public var
	return {
		init: init,
		addFile: addFile,
		updateFile: updateFile,
		removeFile: removeFile,
		completedFiles: completedFiles,
		files: files,
		moveImage: moveImage,
		prioritizeImage: prioritizeImage
	}
};


