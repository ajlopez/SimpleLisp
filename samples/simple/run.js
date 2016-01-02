
var sl = require('../..');

for (var k = 2; k < process.argv.length; k++)
    sl.evaluateFile(process.argv[k]);