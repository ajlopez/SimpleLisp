
var symbol = require('../lib/symbol'),
    context = require('../lib/context'),
    assert = require('assert');    
    
// create symbol function

assert.ok(symbol.createSymbol);
assert.equal(typeof symbol.createSymbol, "function");

// create symbol

var symbol = symbol.createSymbol('a');
assert.ok(symbol);

// as string

assert.equal(symbol.asString(), 'a');

// evaluate in context

var ctx = context.createContext();
assert.equal(symbol.evaluate(null, ctx), null);

ctx.set('a', 'b');
assert.equal(symbol.evaluate(null, ctx), 'b');
