
const sl = require('..');
const path = require('path');

exports['compile symbol'] = function (test) {
    test.equal(sl.compile('a'), 'a');
}

exports['compile two symbols'] = function (test) {
    test.equal(sl.compile('a b'), '(function () { a; return b; })()');
}

exports['compile nil'] = function (test) {
    test.equal(sl.compile('nil'), 'null');
}

exports['compile booleans'] = function (test) {
    test.strictEqual(sl.compile('false'), 'false');
    test.strictEqual(sl.compile('true'), 'true');
}

exports['compile integer'] = function (test) {
    test.equal(sl.compile('42'), '42');
}

exports['compile string'] = function (test) {
    test.equal(sl.compile('"foo"'), '"foo"');
}

exports['compile quoted integer'] = function (test) {
    test.equal(sl.compile("'42"), '42');
}

exports['compile quoted string'] = function (test) {
    test.equal(sl.compile("'\"foo\""), '"foo"');
}

exports['compile quoted list'] = function (test) {
    const ctx = sl.context();
    test.equal(sl.compile("'(1 2 3)", ctx), '$values[0]');
    test.ok(ctx.values);
    test.equal(ctx.values.length, 1);
    test.equal(ctx.values[0].asString(), "(1 2 3)");
}

exports['compile list with integers'] = function (test) {
    test.equal(sl.compile('(add 1 2)'), 'add(1, 2)');
}

exports['compile list with native method and one argument'] = function (test) {
    test.equal(sl.compile('(("foo" .substring) 1)'), '"foo".substring(1)');
}

exports['compile list with access to native property'] = function (test) {
    test.equal(sl.compile('(adam .name)'), 'adam.name');
}

exports['compile list with set native property'] = function (test) {
    test.equal(sl.compile('(adam .name "Adam")'), 'adam.name = "Adam"');
}

exports['compile list with integers and list'] = function (test) {
    test.equal(sl.compile('(add 1 2 (add 3 4))'), 'add(1, 2, add(3, 4))');
}

exports['compile list with strings'] = function (test) {
    test.equal(sl.compile('(concat "foo" "bar")'), 'concat("foo", "bar")');
}

exports['compile list with do'] = function (test) {
    test.equal(sl.compile('(do (add 1 2) (add 3 4))'), '(function () { add(1, 2); return add(3, 4); })()');
}

exports['compile list with if'] = function (test) {
    test.equal(sl.compile('(if true (add 1 2) (add 3 4))'), '(function () { if (true) return add(1, 2); else return add(3, 4); })()');
}

exports['compile let with one variable'] = function (test) {
    test.equal(sl.compile('(let ((x 1)) (add 1 x))'), '(function (x) { return add(1, x); })(1)');
}

exports['compile let with two variable'] = function (test) {
    test.equal(sl.compile('(let ((x 1) (y 2)) (add y x))'), '(function (x) { return (function (y) { return add(y, x); })(2); })(1)');
}

exports['compile list with while'] = function (test) {
    test.equal(sl.compile('(while true (add 1 2) (add 3 4))'), '(function () { while (true) { add(1, 2); add(3, 4); } })()');
}

exports['compile simple def'] = function (test) {
    test.equal(sl.compile('(define one 1)'), '(function () { var one; return one = 1; })()');
}

exports['compile two def and expression'] = function (test) {
    test.equal(sl.compile('(define one 1) (define two 2) (add one two)'), '(function () { var one; var two; one = 1; two = 2; return add(one, two); })()');
}

exports['compile def lamba'] = function (test) {
    test.equal(sl.compile('(define inc (lambda (x) (add x 1)))'), '(function () { var inc; return inc = (function (x) { return add(x, 1); }); })()');
}

exports['compile and evaluate defm (macro) lambda'] = function (test) {
    const ctx = sl.context();
    sl.compile('(definem tolist (lambda (x) (list x)))', ctx);
    test.ok(ctx.macros);
    test.ok(ctx.macros.tolist);
    test.equal(typeof ctx.macros.tolist, 'function');
    test.equal(ctx.macros.tolist(2).asString(), '(2)');
}

exports['compile and evaluate defm (macro) lambda with two arguments'] = function (test) {
    const ctx = sl.context();
    sl.compile('(definem tolist (lambda (x y) (list x y)))', ctx);
    test.ok(ctx.macros);
    test.ok(ctx.macros.tolist);
    test.equal(typeof ctx.macros.tolist, 'function');
    test.equal(ctx.macros.tolist(2, 3).asString(), '(2 3)');
}

exports['compile simple lambda'] = function (test) {
    test.equal(sl.compile('(lambda (x y) (add x y))'), '(function (x, y) { return add(x, y); })');
}

exports['compile lambda with arguments and variable argument list'] = function (test) {
    test.equal(sl.compile('(lambda (x y & z) (add x y))'), '(function (x, y) { var z = makevarargs(arguments, 2); return add(x, y); })');
}

exports['compile lambda with variable argument list'] = function (test) {
    test.equal(sl.compile('(lambda (& z) z)'), '(function () { var z = makevarargs(arguments, 0); return z; })');
}

exports['compile second file'] = function (test) {
    const filename = path.join(__dirname, 'second.lsp');
    const ctx = sl.context();
    const code = sl.compileFile(filename, ctx);
    
    test.ok(code);
    const $values = ctx.values;
    
    function first(list) {
        return list.first();
    }

    function rest(list) {
        return list.rest();
    }
    
    test.equal(eval(code), 2);
}
