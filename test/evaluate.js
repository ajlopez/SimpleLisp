
var sl = require('..');

exports['evaluate integer'] = function (test) {
    test.strictEqual(sl.evaluate('42'), 42);
}

exports['evaluate string'] = function (test) {
    test.equal(sl.evaluate('"foo"'), 'foo');
}

exports['evaluate quoted list'] = function (test) {
    test.equal(sl.evaluate("'(1 2 3)").asString(), '(1 2 3)');
}

exports['evaluate first'] = function (test) {
    test.strictEqual(sl.evaluate("(first '(1 2 3))"), 1);
}


