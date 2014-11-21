
var list = require('../lib/list');
var symbol = require('../lib/symbol');

exports['create list function'] = function (test) {
    test.ok(list.createList);
    test.equal(typeof list.createList, "function");
}

exports['create list with one element'] = function (test) {
    var lst = list.createList(1);
    test.equal(lst.first(), 1);
    test.equal(lst.rest(), null);
    test.equal(lst.asString(), "(1)");
}

exports['create list with two elements'] = function (test) {
    var lst = list.createList(1, 2);
    test.equal(lst.first(), 1);
    test.equal(lst.rest().asString(), "(2)");
    test.equal(lst.asString(), "(1 2)");
}

exports['create list with nested element'] = function (test) {
    var lst = list.createList(1, list.createList(2));
    test.equal(lst.first(), 1);
    test.equal(lst.rest().asString(), "((2))");
    test.equal(lst.asString(), "(1 (2))");
}

exports['create list with two nils'] = function (test) {
    var lst = list.createList(null, null);
    test.equal(lst.first(), null);
    test.equal(lst.asString(), "(nil nil)");
}

exports['create empty list'] = function (test) {
    var lst = list.createList();
    test.equal(lst.first(), null);
    test.equal(lst.rest(), null);
    test.equal(lst.asString(), "()");
}

exports['is list'] = function (test) {
    var emptylst = list.createList();
    var lst = list.createList(1, 2);
    test.ok(list.isList(emptylst));
    test.ok(list.isList(lst));
    test.equal(list.isList(null), false);
    test.equal(list.isList(12), false);
    test.equal(list.isList('foo'), false);
}

exports['compile with integers'] = function (test) {
    var sadd = symbol.createSymbol('add');
    var lst = list.createList(sadd, 1, 2);
    test.equal(lst.compile(), 'add(1, 2)');
}

exports['compile with integers and list'] = function (test) {
    var sadd = symbol.createSymbol('add');
    var lst = list.createList(sadd, 1, 2, list.createList(sadd, 3, 4));
    test.equal(lst.compile(), 'add(1, 2, add(3, 4))');
}

exports['compile with strings'] = function (test) {
    var sconcat = symbol.createSymbol('concat');
    var lst = list.createList(sconcat, "foo", "bar");
    test.equal(lst.compile(), 'concat("foo", "bar")');
}

exports['compile do'] = function (test) {
    var sdo = symbol.createSymbol('do');
    var sadd = symbol.createSymbol('add');
    var ladd1 = list.createList(sadd, 1, 2);
    var ladd2 = list.createList(sadd, 3, 4);
    var lst = list.createList(sdo, ladd1, ladd2);
    test.equal(lst.compile(), '(function () { add(1, 2); return add(3, 4); })()');
}

exports['compile if'] = function (test) {
    var sif = symbol.createSymbol('if');
    var sadd = symbol.createSymbol('add');
    var ladd1 = list.createList(sadd, 1, 2);
    var ladd2 = list.createList(sadd, 3, 4);
    var lst = list.createList(sif, true, ladd1, ladd2);
    test.equal(lst.compile(), '(function () { if (true) return add(1, 2); else return add(3, 4); })()');
}
