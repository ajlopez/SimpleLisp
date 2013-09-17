
function List(head, tail) {
    this.head = head;
    this.tail = tail;
};

List.prototype.first = function () {
    return this.head;
};

List.prototype.rest = function () {
    return this.tail;
};

List.prototype.asString = function () {
    var result = '(' + asString(this.head);
    for (var tail = this.tail; tail != null; tail = tail.tail)        result += ' ' + asString(tail.head);

    return result + ')';
};function EmptyList() {};EmptyList.prototype.first = function () {    return null;};EmptyList.prototype.rest = function () {    return null;};EmptyList.prototype.asString = function () {    return '()';};var empty = new EmptyList();function asString(obj) {    if (obj === null)        return 'nil';    if (obj.asString)        return obj.asString();    return obj.toString();}

function createList() {
    var result = null;

    for (var k = arguments.length; k--;)
        result = new List(arguments[k], result);
    if (result == null)        return empty;
    return result;
};

module.exports = {
    createList: createList
};

