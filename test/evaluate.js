
var sl = require('..');
var path = require('path');

exports['evaluate integer'] = function (test) {
    test.strictEqual(sl.evaluate('42'), 42);
}

exports['evaluate two integers'] = function (test) {
    test.strictEqual(sl.evaluate('1 42'), 42);
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
    var code = [
        "(defm tolist (lambda (x) (cons 'list (cons x nil))))",
        '(tolist 2)'
    ].join('\n');
    test.equal(sl.evaluate(code).asString(), '(2)');
}

exports['define and evaluate second'] = function (test) {
    var code = [
        "(def second (lambda (x) (first (rest x))))",
        "(second '(1 2 3))"
    ].join('\n');
    test.equal(sl.evaluate(code), 2);
}

exports['define and evaluate second file'] = function (test) {
    var filename = path.join(__dirname, 'second.lsp');
    test.equal(sl.evaluateFile(filename), 2);
}

exports['define and evaluate tolist file using context'] = function (test) {
    var filename = path.join(__dirname, 'tolist.lsp');
    var ctx = sl.context();
    test.equal(sl.evaluateFile(filename, ctx).asString(), '(2)');
    test.ok(ctx.macros.tolist);
}

exports['evaluate varargs'] = function (test) {
    test.equal(sl.evaluate('((lambda (& z) z) 1 2 3)').asString(), '(1 2 3)');
}

exports['evaluate string native methods'] = function (test) {
    test.equal(sl.evaluate('(.toUpperCase "foo")'), 'FOO');
    test.equal(sl.evaluate('(.substring "foo" 1 2)'), 'o');
}

exports['evaluate string native property'] = function (test) {
    test.equal(sl.evaluate('(:length "foo")'), 3);
}

exports['evaluate new object'] = function (test) {
    test.deepEqual(sl.evaluate('(newobj)'), { });
}

exports['evaluate new object with properties'] = function (test) {
    test.deepEqual(sl.evaluate('(let ((x (newobj))) (:name x "Adam") (:age x 800) x)'), { name: "Adam", age: 800 });
}
