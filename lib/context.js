
function Context() {
    this.values = { };
}

Context.prototype.get = function (name) {
    if (this.values[name] === undefined)
        return null;
        
    return this.values[name];
};

Context.prototype.set = function (name, value) {
    this.values[name] = value;
}

function createContext() {
    return new Context();
}

module.exports = {
    createContext: createContext
};