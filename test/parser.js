
var parser = require('../lib/parser'),
    symbol = require('../lib/symbol');

exports['create parser function'] = function (test) {
    test.ok(parser.createParser);
    test.equal(typeof parser.createParser, "function");
}

exports['parse symbol'] = function (test) {
    var myparser = parser.createParser('a');
    var result = myparser.parse();
    
    test.ok(result);
    test.ok(symbol.isSymbol(result));
    test.equal(result.asString(), 'a');
}