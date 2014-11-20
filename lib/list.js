
var symbol = require('./symbol');

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
    var head = this.head;
    
    if (symbol.isSymbol(head) && head.name == 'do')
        return compileDo(this);
        
    var result = compile(head) + "(";
    
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

function compileDo(list) {
    var result = "(function () { ";
    var comp = null;
    
    var rest = list.rest();
    
    while (rest) {
        if (comp)
            result += comp + "; ";
        comp = rest.first().compile();
        rest = rest.rest();
    }
    
    if (comp)
        result += "return " + comp + ";";
    else
        result += "return;";
    
    result += " })()";
    
    return result;
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

