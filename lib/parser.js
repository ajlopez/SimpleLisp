
var symbol = require('./symbol');

function Parser(text) {
    this.parse = function () {
        return symbol.createSymbol(text);
    };
}

function createParser(text) {
    return new Parser(text);
}

module.exports = {
    createParser: createParser
};
