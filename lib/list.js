
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
    var result = '(' + this.head;
    
    for (var tail = this.tail; tail != null; tail = tail.tail)
        result += ' ' + tail.head;
        
    return result + ')';
};

function createList() {
    var result = null;
    
    for (var k = arguments.length; k--;)
        result = new List(arguments[k], result);
        
    return result;
};

module.exports = {
    createList: createList
};
