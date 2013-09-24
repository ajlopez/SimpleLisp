
var parser = require('../lib/parser');

exports['create parser function'] = function (test) {
    test.ok(parser.createParser);
    test.equal(typeof parser.createParser, "function");
}
