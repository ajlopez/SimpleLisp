
var parser = require('./parser');
var lists = require('./list');
var symbol = require('./symbol');

function first(list) {
    return list.first();
}

function rest(list) {
    return list.rest();
}

function cons(head, tail) {
    return lists.newList(head, tail);
}

function list() {
    return lists.createList.apply(lists, arguments);
}

function evaluate(text) {
    var context = createContext();
    var code = compile(text, context);
    var $values = context.values;
    return eval(code);
}

function compile(text, context) {
    if (!context)
        context = createContext();
        
    var expr = parser.createParser(text).parse();
    
    var code = compileExpression(expr, context);
    
    if (context.variables && context.variables.length)
        code = compileVariables(context.variables) + " " + code;
        
    return code;
}

function compileVariables(names) {
    var code = '';
    
    names.forEach(function (name) {
        if (code != '')
            code += ' ';
        code += 'var ' + name + '; function $def_' + name + "($value) { " + name + " = $value; }";
    });
    
    return code;
}

function compileExpression(expr, context) {
    if (expr == null)
        return null;
        
    if (lists.isList(expr))
        return compileList(expr, context);
        
    if (symbol.isSymbol(expr))
        return expr.name;
        
    return JSON.stringify(expr);
}

function compileList(list, context) {
    var head = list.first();
    
    if (symbol.isSymbol(head)) {
        if (head.name == 'do')
            return compileDo(list, context);
        if (head.name == 'if')
            return compileIf(list, context);
        if (head.name == 'let')
            return compileLet(list, context);
        if (head.name == 'while')
            return compileWhile(list, context);
        if (head.name == 'quote')
            return compileQuote(list, context);
        if (head.name == 'def')
            return compileDef(list, context);
        if (head.name == 'fn')
            return compileFn(list, context);
    }
        
    var result = compileExpression(head, context) + "(";
    
    var tail = list.rest();
    var narg = 0;
    
    while (tail) {
        if (narg)
            result += ', ';
            
        result += compileExpression(tail.first(), context);
        tail = tail.rest();
        narg++;
    }
    
    result += ')';
    
    return result;
}

function compileDo(list, context) {
    var result = "(function () { ";
    var body = list.rest();
    
    result += compileBody(body, context);
    result += " })()";
    
    return result;
}

function compileDef(form, context) {
    var name = form.rest().first().name;
    var value = form.rest().rest().first();
    
    context.variables.push(name);
    
    return "$def_" + name + "(" + compileExpression(value, context) + ")";
}

function compileFn(form, context) {
    var names = form.rest().first();
    var body = form.rest().rest();
    
    return "(function (" + compileArguments(names) + ") { " + compileBody(body, context) + " })";
}

function compileArguments(names) {
    var code = '';
    
    while (names) {
        if (code != '')
            code += ', ';
            
        code += names.first().name;
        names = names.rest();
    }
    
    return code;
}

function compileQuote(form, context) {
    var arg = form.rest().first();
    
    if (lists.isList(arg)) {
        var pos = context.values.indexOf(arg);
        
        if (pos < 0) {
            pos = context.values.length;
            context.values.push(arg);
        }
        
        return "$values[" + pos + "]";
    }
    
    return JSON.stringify(arg);
}

function compileBody(body, context, noret) {
    var result = '';
    var comp = null;
    
    while (body) {
        if (comp)
            result += comp + "; ";
        comp = compileExpression(body.first(), context);
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

function compileIf(list, context) {
    var result = "(function () { if (";
    var comp = null;
    
    var rest = list.rest();
    var cond = rest.first();
    
    result += compileExpression(cond, context) + ") return ";
    
    var thenval = rest.rest().first();
    var elseval = rest.rest().rest().first();
    
    result += compileExpression(thenval, context) + "; else return " + compileExpression(elseval, context) + "; })()";
    
    return result;
}

function compileWhile(list, context) {
    var result = "(function () { while (";
    
    var cond = list.rest().first();
    var body = list.rest().rest();
    
    result += compileExpression(cond, context) + ") { ";
    result += compileBody(body, context, true) + " } })()";
    
    return result;
}

function compileLet(list, context) {
    var vars = list.rest().first();
    var body = list.rest().rest();
    var code = compileBody(body, context);
    
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
        postcode = ' })(' + compileExpression(val, context) + ')' + postcode;
    }
    
    return precode + code + postcode;
}

function createContext() {
    return {
        values: [],
        variables: []
    }
}

module.exports = {
    compile: compile,
    evaluate: evaluate,
    context: createContext
};
