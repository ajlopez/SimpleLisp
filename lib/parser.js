
var symbol = require('./symbol');

function Parser(text) {
    var l = text.length;
    var position = 0;
    
    this.parse = function () {
        var token = nextToken();
        
        if (token == null)
            return null;
            
        return symbol.createSymbol(token.value);
    };
    
    function nextToken() {
        while (position < l && text[position] <= ' ')
            position++;
            
        if (position >= l)
            return null;
        
        var result = text[position++];
        
        while (position < l && text[position] > ' ')
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
