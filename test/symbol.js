
var symbol = require('../lib/symbol'),
    context = require('../lib/context');
    
exports['create symbol function'] = function (test) {
    test.ok(symbol.createSymbol);
    test.equal(typeof symbol.createSymbol, "function");
}

exports['create symbol'] = function (test) {
    var mysymbol = symbol.createSymbol('a');
    test.ok(mysymbol);
}

exports['as string'] = function (test) {
    var mysymbol = symbol.createSymbol('a');
    test.equal(mysymbol.asString(), 'a');
}

exports['is symbol'] = function (test) {
    var mysymbol = symbol.createSymbol('a');
    test.ok(symbol.isSymbol(mysymbol));
    test.equal(symbol.isSymbol(10), false);
    test.equal(symbol.isSymbol('a'), false);
    test.equal(symbol.isSymbol(null), false);
}

exports['evaluate in context'] = function (test) {
    var mysymbol = symbol.createSymbol('a');
    var ctx = context.createContext();
    test.equal(mysymbol.evaluate(null, ctx), null);

    ctx.set('a', 'b');
    test.equal(mysymbol.evaluate(null, ctx), 'b');
}

exports['compile'] = function (test) {
    var mysymbol = symbol.createSymbol('a');
    var ctx = context.createContext();
    test.equal(mysymbol.compile(), 'a');
}
