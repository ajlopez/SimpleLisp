
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

List.prototype.compile = function () {
    var result = compile(this.head) + "(";
    
    var tail = this.tail;
    var narg = 0;
    
    while (tail) {
        if (narg)
            result += ', ';
            
        result += compile(tail.first());
        tail = tail.rest();
        narg++;
    }
    
    result += ')';
    
    return result;
};

List.prototype.asString = function () {
    var result = '(' + asString(this.head);


    for (var tail = this.tail; tail != null; tail = tail.tail)
        result += ' ' + asString(tail.head);

    return result + ')';
};

function compile(elem) {
    if (elem.compile)
        return elem.compile();
        
    return JSON.stringify(elem);
}

function EmptyList() {
};

EmptyList.prototype.first = function () {
    return null;
};

EmptyList.prototype.rest = function () {
    return null;
};

EmptyList.prototype.asString = function () {
    return '()';
};

var empty = new EmptyList();

function asString(obj) {
    if (obj === null)
        return 'nil';
    if (obj.asString)
        return obj.asString();
    return obj.toString();
}

function createList() {
    var result = null;

    for (var k = arguments.length; k--;)
        result = new List(arguments[k], result);

    if (result == null)
        return empty;

    return result;
};

function isList(obj) {
    return obj instanceof List || obj instanceof EmptyList;
}

module.exports = {
    createList: createList,
    isList: isList
};

