
var sl = require('..');

exports['evaluate integer'] = function (test) {
    test.strictEqual(sl.evaluate('42'), 42);
}

exports['evaluate string'] = function (test) {
    test.equal(sl.evaluate('"foo"'), 'foo');
}

