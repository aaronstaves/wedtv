var mongoose = require("mongoose");

var log4js   = require('log4js');
var logger   = log4js.getLogger();

var FileSchema = mongoose.Schema({
	filename: String
});

var FileModel = mongoose.model('File', FileSchema);

module.exports = FileModel;
