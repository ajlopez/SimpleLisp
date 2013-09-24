
function Symbol(name) {
    this.name = name;
}

Symbol.prototype.asString = function() {
    return this.name;
};

Symbol.prototype.evaluate = function (lisp, ctx) {
    return ctx.get(this.name);
};

function createSymbol(name) {
    return new Symbol(name);
}

function isSymbol(obj) {
    return obj instanceof Symbol;
}

module.exports = {
    createSymbol: createSymbol,
    isSymbol: isSymbol
};