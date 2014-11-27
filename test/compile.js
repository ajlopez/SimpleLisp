
var sl = require('..');

exports['compile symbol'] = function (test) {
    test.equal(sl.compile('a'), 'a');
}

exports['compile integer'] = function (test) {
    test.equal(sl.compile('42'), '42');
}

exports['compile quoted integer'] = function (test) {
    test.equal(sl.compile("'42"), '42');
}

exports['compile quoted string'] = function (test) {
    test.equal(sl.compile("'\"foo\""), '"foo"');
}

exports['compile list with integers'] = function (test) {
    test.equal(sl.compile('(add 1 2)'), 'add(1, 2)');
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

