var mongoose = require("mongoose");

var log4js   = require('log4js');
var logger   = log4js.getLogger();

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', function(err) {
	logger.error( 'Unable to connect to mongo: ' + err.message );
	process.exit();
});

// Schemas
var FileModel = require('./models/file');

// Exports
module.exports.File = FileModel;
