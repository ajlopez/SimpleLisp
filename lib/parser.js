
var symbol = require('./symbol'),
    list = require('./list');

var TokenType = { Name: 1, Punctuation: 2 };

var punctuations = "()";

function Parser(text) {
    var l = text.length;
    var position = 0;
    var tokens = [];
    
    this.parse = function () {
        var token = nextToken();
        
        if (token == null)
            return null;
            
        if (token.type == TokenType.Punctuation && token.value == '(') {
            var elements = [];
            
            for (var element = this.parse(); element != null; element = this.parse())
                elements.push(element);
                
            token = nextToken();
            
            if (!token || token.type != TokenType.Punctuation || token.value != ')')
                throw 'unclosed list';
                
            return list.createList.apply(null, elements);
        }
        
        if (token.type == TokenType.Punctuation) {
            pushToken(token);
            return null;
        }
            
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
        
        if (punctuations.indexOf(result) >= 0)
            return { value: result, type: TokenType.Punctuation };
        
        while (position < l && text[position] > ' ' && punctuations.indexOf(text[position]) < 0)
            result += text[position++];
        
        var token = { value: result };
        
        return token;
    }
}

function createParser(text) {
    return new Parser(text);
}

module.exports = {
    createParser: createParser
};
