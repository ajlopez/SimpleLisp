
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

exports['evaluate in context'] = function (test) {
    var mysymbol = symbol.createSymbol('a');
    var ctx = context.createContext();
    test.equal(mysymbol.evaluate(null, ctx), null);

    ctx.set('a', 'b');
    test.equal(mysymbol.evaluate(null, ctx), 'b');
}
