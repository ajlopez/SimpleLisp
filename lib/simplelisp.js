
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
        if (head.name == 'let')
            return compileLet(list);
        if (head.name == 'while')
            return compileWhile(list);
        if (head.name == 'quote')
            return compileQuote(list);
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
    var body = list.rest();
    
    result += compileBody(body);
    result += " })()";
    
    return result;
}

function compileQuote(list) {
    var arg = list.rest().first();
    return arg.toString();
}

function compileBody(body, noret) {
    var result = '';
    var comp = null;
    
    while (body) {
        if (comp)
            result += comp + "; ";
        comp = compileExpression(body.first());
        body = body.rest();
    }
    
    if (noret)
        result += comp + ";";
    else if (comp)
        result += "return " + comp + ";";
    else
        result += "return;";
    
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

function compileWhile(list) {
    var result = "(function () { while (";
    
    var cond = list.rest().first();
    var body = list.rest().rest();
    
    result += compileExpression(cond) + ") { ";
    result += compileBody(body, true) + " } })()";
    
    return result;
}

function compileLet(list) {
    var vars = list.rest().first();
    var body = list.rest().rest();
    var code = compileBody(body);
    
    var precode = '';
    var postcode = '';
    
    while (vars && vars.first()) {
        var varval = vars.first();
        vars = vars.rest();
        
        var varname = varval.first().name;
        var val = varval.rest().first();
        
        if (precode != '') {
            precode += 'return ';
            postcode = ';' + postcode;
        }
            
        precode += '(function (' + varname + ') { ';
        postcode = ' })(' + compileExpression(val) + ')' + postcode;
    }
    
    return precode + code + postcode;
}

module.exports = {
    compile: compile
};
