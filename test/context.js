
var context = require('../lib/context');
    
exports['create context function'] = function (test) {
    test.ok(context.createContext);
    test.equal(typeof context.createContext, "function");
}

exports['context get undefined'] = function (test) {
    var ctx = context.createContext();
    test.equal(ctx.get('unknown'), null);
}

exports['set and get'] = function (test) {
    var ctx = context.createContext();
    ctx.set('one', 1);
    test.equal(ctx.get('one'), 1);
}

// using parent

var parent = context.createContext();
var ctx = context.createContext(parent);
parent.set('one', 1);
assert.equal(ctx.get('one'), 1);
