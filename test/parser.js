
var parser = require('../lib/parser');
var list = require('../lib/list');
var symbol = require('../lib/symbol');

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
    
    test.equal(myparser.parse(), null);
}

exports['parse quoted symbol'] = function (test) {
    var myparser = parser.createParser("'a");
    var result = myparser.parse();
    
    test.ok(result);
    test.equal(result.asString(), '(quote a)');
    
    test.equal(myparser.parse(), null);
}

exports['parse integer'] = function (test) {
    var myparser = parser.createParser('42');
    var result = myparser.parse();
    
    test.ok(result);
    test.ok(!symbol.isSymbol(result));
    test.equal(result, 42);
    
    test.equal(myparser.parse(), null);
}

exports['parse double quoted string'] = function (test) {
    var myparser = parser.createParser('"foo"');
    var result = myparser.parse();
    
    test.ok(result);
    test.ok(!symbol.isSymbol(result));
    test.equal(result, "foo");
    
    test.equal(myparser.parse(), null);
}

exports['parse two symbols'] = function (test) {
    var myparser = parser.createParser('a b');
    var result = myparser.parse();
    
    test.ok(result);
    test.ok(symbol.isSymbol(result));
    test.equal(result.asString(), 'a');
    
    result = myparser.parse();
    
    test.ok(result);
    test.ok(symbol.isSymbol(result));
    test.equal(result.asString(), 'b');

    test.equal(myparser.parse(), null);
}

exports['parse list'] = function (test) {
    var myparser = parser.createParser('(a b)');
    var result = myparser.parse();
    
    test.ok(result);
    test.ok(list.isList(result));
    test.equal(result.asString(), '(a b)');
    
    test.equal(myparser.parse(), null);
}
