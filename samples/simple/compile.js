
var sl = require('../..');

for (var k = 2; k < process.argv.length; k++)
    console.log(sl.compileFile(process.argv[k]));