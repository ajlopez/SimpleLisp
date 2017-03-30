
var symbol = require('./symbol'),
    list = require('./list');

var TokenType = { Integer: 1, String: 2, Name: 3, Punctuation: 4 };

var symquote = symbol.createSymbol('quote');

var punctuations = "()";

function Parser(text) {
    var l = text.length;
    var position = 0;
    var tokens = [];
    
    this.parse = function () {
        var token = nextToken();
        
        if (token == null)
            return null;
            
        if (token.type === TokenType.Punctuation && token.value === '(') {
            var elements = [];
            
            for (var element = this.parse(); element != null; element = this.parse())
                elements.push(element);
                
            token = nextToken();
            
            if (!token || token.type != TokenType.Punctuation || token.value != ')')
                throw 'unclosed list';
                
            return list.createList.apply(null, elements);
        }
        
        if (token.type === TokenType.Punctuation) {
            pushToken(token);
            return null;
        }
        
        if (token.type === TokenType.Integer)
            return parseInt(token.value);
            
        if (token.type === TokenType.String)
            return token.value;
            
        if (token.type === TokenType.Name && token.value === "'")
            return list.createList(symquote, this.parse());
            
        return symbol.createSymbol(token.value);
    };
    
    function pushToken(token) {
        tokens.push(token);
    }
    
    function nextToken() {
        if (tokens.length)
            return tokens.pop();
    
        while (position < l && text[position] <= ' ')
            position++;
            
        if (position >= l)
            return null;
        
        var result = text[position++];
        
        if (isDigit(result))
            return nextInteger(result);
            
        if (result === '"')
            return nextString(result);
            
        if (result === "'")
            return { value: result, type: TokenType.Name };
        
        if (punctuations.indexOf(result) >= 0)
            return { value: result, type: TokenType.Punctuation };
        
        while (position < l && text[position] > ' ' && punctuations.indexOf(text[position]) < 0)
            result += text[position++];
        
        var token = { value: result };
        
        return token;
    }
    
    function nextInteger(ch) {
        var result = ch;

        while (position < l && text[position] > ' ' && isDigit(text[position]))
            result += text[position++];
            
        return { value: result, type: TokenType.Integer };
    }
    
    function nextString(sep) {
        var result = "";

        while (position < l && text[position] != sep)
            result += text[position++];
            
        if (position < l)
            position++;
            
        return { value: result, type: TokenType.String };
    }
}

function isDigit(ch) {
    return ch >= '0' && ch <= '9';
}

function createParser(text) {
    return new Parser(text);
}

module.exports = {
    createParser: createParser
};
