
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
        if (position >= l)
            return null;
            
        var token = { value: text };
        
        position = l;
        
        return token;
    }
}

function createParser(text) {
    return new Parser(text);
}

module.exports = {
    createParser: createParser
};
