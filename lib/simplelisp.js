
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

function listp(arg) {
    return lists.isList(arg);
}

function nilp(arg) {
    return arg == null;
}

function evaluate(text) {
    var context = createContext();
    var code = compile(text, context);
    return evaluateCode(code, context);
}

function evaluateCode(code, context) {
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
        if (expr.name == 'nil')
            return 'null';
        else
            return expr.name;
        
    return JSON.stringify(expr);
}

function compileList(list, context) {
    var head = list.first();
    
    if (symbol.isSymbol(head) && context.specialforms[head.name])
        return context.specialforms[head.name](list, context);
        
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

function compileDefM(form, context) {
    var name = form.rest().first().name;
    var value = form.rest().rest().first();
    
    context.macros[name] = evaluateCode(compileExpression(value, context), context);
    
    return '';
}

function compileFn(form, context) {
    var names = form.rest().first();
    var body = form.rest().rest();
    
    return "(function (" + compileArguments(names) + ") { " + compileVarArguments(names) + compileBody(body, context) + " })";
}

function compileArguments(names) {
    var code = '';
    
    while (names) {
        var name = names.first().name;
        
        if (name == '&')
            break;
           
        if (code != '')
            code += ', ';
            
        code += names.first().name;
        names = names.rest();
    }
    
    return code;
}

function compileVarArguments(names) {
    var code = '';
    var nargs = 0;
    var hasvararg = false;
    
    while (names) {
        var name = names.first().name;
        
        if (hasvararg) {
            code = 'var ' + name + ' = makevarargs(arguments, ' + nargs + '); ';
            break;
        }
        
        if (name != '&') {
            names = names.rest();
            nargs++;
            continue;
        }
           
        hasvararg = true;
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
        variables: [],
        macros: { },
        specialforms: {
            'do': compileDo,
            'quote': compileQuote,
            'if': compileIf,
            'let': compileLet,
            'while': compileWhile,
            'def': compileDef,
            'defm': compileDefM,
            'fn': compileFn
        }
    }
}

module.exports = {
    compile: compile,
    evaluate: evaluate,
    context: createContext
};
