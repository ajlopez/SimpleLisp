# SimpleLisp

Lisp compiler to JavaScript.

## Installation

Via npm on Node:

```
npm install simplelisp
```


## Usage

Reference in your program:

```js
var sl = require('simplelisp');
```

Evaluate string:
```js
sl.evaluate("(first '(1 2))");  // 1
```

Evaluate file:
```js
sl.evaluateFile("mypgm.lsp");
```

## Versions

- 0.0.1 Published

## Development

```
git clone git://github.com/ajlopez/SimpleLisp.git
cd SimpleLisp
npm install
npm test
```

## Samples

[Hello](https://github.com/ajlopez/SimpleLisp/tree/master/samples/simple) Simple Hello, world program

## License

MIT

## Contribution

Feel free to [file issues](https://github.com/ajlopez/SimpleLisp) and submit
[pull requests](https://github.com/ajlopez/SimpleLisp/pulls) — contributions are
welcome<

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

