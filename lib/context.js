
function Context(parent) {
    this.values = { };
    this.parent = parent;
}

Context.prototype.get = function (name) {
    if (this.values[name] === undefined)
        if (this.parent)
            return this.parent.get(name);
        else
            return null;
        
    return this.values[name];
};

Context.prototype.set = function (name, value) {
    this.values[name] = value;
}

function createContext(parent) {
    return new Context(parent);
}

module.exports = {
    createContext: createContext
};