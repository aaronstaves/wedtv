var fileMonitor = require('./lib/fileMonitor');
var config      = require('config');

console.dir(config);


// start file monitor 
fileMonitor.init();
