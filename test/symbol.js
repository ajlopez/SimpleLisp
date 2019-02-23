
const symbol = require('../lib/symbol');
const context = require('../lib/context');
    
exports['create symbol function'] = function (test) {
    test.ok(symbol.createSymbol);
    test.equal(typeof symbol.createSymbol, "function");
}

exports['create symbol'] = function (test) {
    const mysymbol = symbol.createSymbol('a');

    test.ok(mysymbol);
}

exports['as string'] = function (test) {
    const mysymbol = symbol.createSymbol('a');

    test.equal(mysymbol.asString(), 'a');
}

exports['is symbol'] = function (test) {
    const mysymbol = symbol.createSymbol('a');

    test.ok(symbol.isSymbol(mysymbol));
    test.equal(symbol.isSymbol(10), false);
    test.equal(symbol.isSymbol('a'), false);
    test.equal(symbol.isSymbol(null), false);
}

exports['evaluate in context'] = function (test) {
    const mysymbol = symbol.createSymbol('a');
    const ctx = context.createContext();

    test.equal(mysymbol.evaluate(null, ctx), null);

    ctx.set('a', 'b');
    test.equal(mysymbol.evaluate(null, ctx), 'b');
}
