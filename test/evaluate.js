
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

exports['evaluate cons'] = function (test) {
    test.strictEqual(sl.evaluate("(cons 1 '(2 3))").asString(), '(1 2 3)');
}

exports['evaluate rest'] = function (test) {
    test.strictEqual(sl.evaluate("(rest '(1 2 3))").asString(), '(2 3)');
}

exports['evaluate list'] = function (test) {
    test.strictEqual(sl.evaluate("(list 1 2 3)").asString(), '(1 2 3)');
}

exports['evaluate listp'] = function (test) {
    test.strictEqual(sl.evaluate("(listp '(1 2 3))"), true);
    test.strictEqual(sl.evaluate("(listp '())"), true);
    test.strictEqual(sl.evaluate("(listp 'a)"), false);
    test.strictEqual(sl.evaluate("(listp 42)"), false);
}

exports['evaluate nilp'] = function (test) {
    test.strictEqual(sl.evaluate("(nilp nil)"), true);
    test.strictEqual(sl.evaluate("(nilp '(1 2 3))"), false);
    test.strictEqual(sl.evaluate("(nilp '())"), false);
    test.strictEqual(sl.evaluate("(listp 'a)"), false);
    test.strictEqual(sl.evaluate("(listp 42)"), false);
}

exports['define and evaluate macro'] = function (test) {
    var ctx = sl.context();
    sl.compile("(defm tolist (fn (x) (cons 'list (cons x nil))))", ctx);
    test.equal(sl.evaluate('(tolist 2)', ctx).asString(), '(2)');
}


