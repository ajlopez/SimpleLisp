
var list = require('../lib/list'),
    assert = require('assert');

// create list function

assert.ok(list.createList);
assert.equal(typeof list.createList, "function");

// create list with one element

var lst = list.createList(1);
assert.equal(lst.first(), 1);
assert.equal(lst.rest(), null);
assert.equal(lst.asString(), "(1)");

// create list with two elements

var lst = list.createList(1, 2);
assert.equal(lst.first(), 1);
assert.equal(lst.rest().asString(), "(2)");
assert.equal(lst.asString(), "(1 2)");// create list with nested elementvar lst = list.createList(1, list.createList(2));assert.equal(lst.first(), 1);assert.equal(lst.rest().asString(), "((2))");assert.equal(lst.asString(), "(1 (2))");// create list with two nilsvar lst = list.createList(null, null);assert.equal(lst.first(), null);assert.equal(lst.asString(), "(nil nil)");// create empty listvar lst = list.createList();assert.equal(lst.first(), null);assert.equal(lst.rest(), null);assert.equal(lst.asString(), "()");