
var parser = require('./parser');
var lists = require('./list');
var symbol = require('./symbol');
var fs = require('fs');

function newobj() {
    return {};
}

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

function evaluate(text, context) {
    if (!context)
        context = createContext();
        
    var code = compile(text, context);
    return evaluateCode(code, context);
}

function evaluateFile(filename, context) {
    var text = fs.readFileSync(filename).toString();
    return evaluate(text, context);
}

function evaluateCode(code, context) {
    var $values = context.values;
    return eval(code);
}

function compile(text, context) {
    function withSemicolon(expr) {
        if (expr[expr.length - 1] === ';')
            return expr;
        
        return expr + ';';
    }
    
    if (!context)
        context = createContext();
        
    var result = null;
    var code = null;
    var pars = parser.createParser(text);
    var expr = pars.parse();        
    
    while (expr) {
        if (code)
            if (result)
                result = withSemicolon(result) + ' ' + code;
            else
                result = code;
            
        code = compileExpression(expr, context);
            
        expr = pars.parse();
    }
        
    if (context.variables && context.variables.length)
        if (result)
            result = compileVariables(context.variables) + " " + result;
        else
            result = compileVariables(context.variables);
    
    if (code)
        if (result)
            result = '(function () { ' + withSemicolon(result) + ' return ' + withSemicolon(code) + ' })()';
        else
            result = code;
        
    return result;
}

function compileFile(filename, context) {
    var text = fs.readFileSync(filename).toString();
    return compile(text, context);
}

function compileVariables(names) {
    var code = '';
    
    names.forEach(function (name) {
        if (code != '')
            code += ' ';
        code += 'var ' + name + ';';
    });
    
    return code;
}

function compileExpression(expr, context) {
    if (expr == null)
        return null;
        
    if (lists.isList(expr))
        return compileList(expr, context);
        
    if (symbol.isSymbol(expr))
        if (expr.name === 'nil')
            return 'null';
        else
            return expr.name;
        
    return JSON.stringify(expr);
}

function compileList(list, context) {
    var head = list.first();
    var rest = list.rest();
    var second = rest ? rest.first() : null;
    
    if (symbol.isSymbol(second)) {
        var name = second.name;
                
        if (name[0] === '.') {
            var result = compileExpression(head, context) + '.' + name.substring(1);
            
            if (list.rest().rest())
                result += ' = ' + compileExpression(list.rest().rest().first(), context);
            
            return result;
        }
    }
    
    if (symbol.isSymbol(head)) {
        var name = head.name;
        if (context.specialforms[name])
            return context.specialforms[name](list, context);
            
        if (context.macros[name]) {
            var args = [];
            
            for (var tail = list.rest(); tail; tail = tail.rest())
                args.push(tail.first());
                
            var expr = context.macros[name].apply(null, args);
            return compileExpression(expr, context);
        }
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
    
    return name + " = " + compileExpression(value, context);
}

function compileDefM(form, context) {
    var name = form.rest().first().name;
    var value = form.rest().rest().first();
    
    context.macros[name] = evaluateCode(compileExpression(value, context), context);
    
    return '';
}

function compileLambda(form, context) {
    var names = form.rest().first();
    var body = form.rest().rest();
    
    return "(function (" + compileArguments(names) + ") { " + compileVarArguments(names) + compileBody(body, context) + " })";
}

function compileArguments(names) {
    var code = '';
    
    while (names) {
        var name = names.first().name;
        
        if (name === '&')
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
    
    if (lists.isList(arg) || symbol.isSymbol(arg)) {
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
            'lambda': compileLambda
        }
    }
}

function makevarargs(args, n) {
    if (!args || args.length <= n)
        return null;
    
    var result = null;

    for (var k = args.length - 1; k >= n; k--)
        result = lists.newList(args[k], result);
        
    return result;
}

module.exports = {
    compile: compile,
    compileFile: compileFile,
    evaluate: evaluate,
    evaluateFile: evaluateFile,
    context: createContext
};
