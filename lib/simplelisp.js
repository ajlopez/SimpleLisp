
var parser = require('./parser');
var list = require('./list');
var symbol = require('./symbol');

function compile(text) {
    var expr = parser.createParser(text).parse();
    return compileExpression(expr);
}

function compileExpression(expr) {    
    if (expr == null)
        return null;
        
    if (list.isList(expr))
        return compileList(expr);
        
    if (symbol.isSymbol(expr))
        return expr.name;
        
    return JSON.stringify(expr);
}

function compileList(list) {
    var head = list.first();
    
    if (symbol.isSymbol(head)) {
        if (head.name == 'do')
            return compileDo(list);
        if (head.name == 'if')
            return compileIf(list);
    }
        
    var result = compileExpression(head) + "(";
    
    var tail = list.rest();
    var narg = 0;
    
    while (tail) {
        if (narg)
            result += ', ';
            
        result += compileExpression(tail.first());
        tail = tail.rest();
        narg++;
    }
    
    result += ')';
    
    return result;
}

function compileDo(list) {
    var result = "(function () { ";
    var comp = null;
    
    var rest = list.rest();
    
    while (rest) {
        if (comp)
            result += comp + "; ";
        comp = compileExpression(rest.first());
        rest = rest.rest();
    }
    
    if (comp)
        result += "return " + comp + ";";
    else
        result += "return;";
    
    result += " })()";
    
    return result;
}

function compileIf(list) {
    var result = "(function () { if (";
    var comp = null;
    
    var rest = list.rest();
    var cond = rest.first();
    
    result += compileExpression(cond) + ") return ";
    
    var thenval = rest.rest().first();
    var elseval = rest.rest().rest().first();
    
    result += compileExpression(thenval) + "; else return " + compileExpression(elseval) + "; })()";
    
    return result;
}

module.exports = {
    compile: compile
};
