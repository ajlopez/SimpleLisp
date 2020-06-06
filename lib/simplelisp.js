
const parser = require('./parser');
const lists = require('./list');
const symbol = require('./symbol');
const fs = require('fs');

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
        
    const code = compile(text, context);

    return evaluateCode(code, context);
}

function evaluateFile(filename, context) {
    const text = fs.readFileSync(filename).toString();

    return evaluate(text, context);
}

function evaluateCode(code, context) {
    const $values = context.values;

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
        
    let result = null;
    let code = null;
    const pars = parser.createParser(text);
    let expr = pars.parse();        
    
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
    const text = fs.readFileSync(filename).toString();

    return compile(text, context);
}

function compileVariables(names) {
    let code = '';
    
    names.forEach(function (name) {
        if (code != '')
            code += ' ';
        
        code += 'let ' + name + ';';
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
    const head = list.first();
    const rest = list.rest();
    const second = rest ? rest.first() : null;
    
    if (symbol.isSymbol(second)) {
        const name = second.name;
                
        if (name[0] === '.') {
            let result = compileExpression(head, context) + '.' + name.substring(1);
            
            if (list.rest().rest())
                result += ' = ' + compileExpression(list.rest().rest().first(), context);
            
            return result;
        }
    }
    
    if (symbol.isSymbol(head)) {
        const name = head.name;

        if (context.specialforms[name])
            return context.specialforms[name](list, context);
            
        if (context.macros[name]) {
            const args = [];
            
            for (let tail = list.rest(); tail; tail = tail.rest())
                args.push(tail.first());
                
            const expr = context.macros[name].apply(null, args);

            return compileExpression(expr, context);
        }
    }
        
    let result = compileExpression(head, context) + "(";
    
    let tail = list.rest();
    let narg = 0;
    
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
    let result = "(function () { ";
    const body = list.rest();
    
    result += compileBody(body, context);
    result += " })()";
    
    return result;
}

function compileDefine(form, context) {
    const name = form.rest().first().name;
    const value = form.rest().rest().first();
    
    context.variables.push(name);
    
    return name + " = " + compileExpression(value, context);
}

function compileDefineMacro(form, context) {
    const name = form.rest().first().name;
    const value = form.rest().rest().first();
    
    context.macros[name] = evaluateCode(compileExpression(value, context), context);
    
    return '';
}

function compileLambda(form, context) {
    const names = form.rest().first();
    const body = form.rest().rest();
    
    return "(function (" + compileArguments(names) + ") { " + compileVarArguments(names) + compileBody(body, context) + " })";
}

function compileArguments(names) {
    let code = '';
    
    while (names) {
        const name = names.first().name;
        
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
    let code = '';
    let nargs = 0;
    let hasvararg = false;
    
    while (names) {
        const name = names.first().name;
        
        if (hasvararg) {
            code = 'let ' + name + ' = makevarargs(arguments, ' + nargs + '); ';
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
    const arg = form.rest().first();
    
    if (lists.isList(arg) || symbol.isSymbol(arg)) {
        let pos = context.values.indexOf(arg);
        
        if (pos < 0) {
            pos = context.values.length;
            context.values.push(arg);
        }
        
        return "$values[" + pos + "]";
    }
    
    return JSON.stringify(arg);
}

function compileBody(body, context, noret) {
    let result = '';
    let comp = null;
    
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
    let result = "(function () { if (";
    let comp = null;
    
    const rest = list.rest();
    const cond = rest.first();
    
    result += compileExpression(cond, context) + ") return ";
    
    const thenval = rest.rest().first();
    const elseval = rest.rest().rest().first();
    
    result += compileExpression(thenval, context) + "; else return " + compileExpression(elseval, context) + "; })()";
    
    return result;
}

function compileWhile(list, context) {
    let result = "(function () { while (";
    
    const cond = list.rest().first();
    const body = list.rest().rest();
    
    result += compileExpression(cond, context) + ") { ";
    result += compileBody(body, context, true) + " } })()";
    
    return result;
}

function compileLet(list, context) {
    let vars = list.rest().first();
    const body = list.rest().rest();
    const code = compileBody(body, context);
    
    let precode = '';
    let postcode = '';
    
    while (vars && vars.first()) {
        let varval = vars.first();
        vars = vars.rest();
        
        const varname = varval.first().name;
        const val = varval.rest().first();
        
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
            'define': compileDefine,
            'definem': compileDefineMacro,
            'lambda': compileLambda
        }
    }
}

function makevarargs(args, n) {
    if (!args || args.length <= n)
        return null;
    
    let result = null;

    for (let k = args.length - 1; k >= n; k--)
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

