
var context = require('../lib/context'),
    assert = require('assert');
    
// create context function
    
assert.ok(context.createContext);
assert.equal(typeof context.createContext, "function");

// context get undefined

var ctx = context.createContext();
assert.equal(ctx.get('unknown'), null);

// set and get

var ctx = context.createContext();
ctx.set('one', 1);
assert.equal(ctx.get('one'), 1);

