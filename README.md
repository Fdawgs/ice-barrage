# ice-barrage

[![GitHub release](https://img.shields.io/github/v/release/Fdawgs/ice-barrage)](https://github.com/Fdawgs/ice-barrage/releases/latest)
[![npm version](https://img.shields.io/npm/v/ice-barrage)](https://www.npmjs.com/package/ice-barrage)
[![CI](https://github.com/Fdawgs/ice-barrage/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Fdawgs/ice-barrage/actions/workflows/ci.yml)
[![Coverage status](https://coveralls.io/repos/github/Fdawgs/ice-barrage/badge.svg?branch=main)](https://coveralls.io/github/Fdawgs/ice-barrage?branch=main)
[![code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4?style=flat)](https://github.com/prettier/prettier)
[![OSSF Scorecard](https://api.scorecard.dev/projects/github.com/Fdawgs/ice-barrage/badge)](https://scorecard.dev/viewer/?uri=github.com/Fdawgs/ice-barrage)

> Node.js module to iteratively freeze objects, arrays, and functions

# Overview

`ice-barrage` is a drop-in replacement for [`deep-freeze`](https://www.npmjs.com/package/deep-freeze), with the following improvements:

- Iterative traversal to avoid call stack overflow on deep objects
- Traversal into already-frozen objects, so mutable children are not left unfrozen
- Cyclic references terminate, even through values `Object.freeze` cannot freeze
- `Buffer` and `TypedArray` values that hold elements do not throw, and the rest of the graph is still frozen
- Skipping of accessor properties to avoid side effects, including Proxy `get` and `set` traps
- Support for Symbol keys
- Support for freezing objects with a null prototype
- TypeScript type definitions included
- Input validation, so primitives are rejected rather than silently returned unfrozen

## What cannot be frozen

In `ice-barrage`, as in any deep-freeze implementation, `Object.freeze` freezes only an object's own data properties.
At the time of writing, the states listed below stay mutable even though the container may report it as frozen:

- `Map`, `Set`, `WeakMap` and `WeakSet` contents, through `set()`, `add()`, `delete()` and `clear()`
- `Date` values, through setters
- `ArrayBuffer` bytes, through any view over the same buffer
- `SharedArrayBuffer` bytes, through any view, in any thread
- `Buffer` and `TypedArray` elements, as the view itself cannot be frozen
- Properties of `Buffer` and `TypedArray` views longer than 65,536 elements, as key enumeration scales with view length and throws a `RangeError` past 16,777,216 elements
- Empty `TypedArray` views over growable `SharedArrayBuffer` storage, which are left unfrozen to avoid a concurrent-growth race
- Private class fields, through any method of the class
- Closure variables, through any call that reassigns them
- Values behind a getter or setter, which are never traversed
- The prototype chain, as only own properties are frozen

## Installation

Install using `npm`:

```sh
npm i ice-barrage
```

## Example usage

Please refer to the [JSDoc comments in the source code](./src/index.js) or the [generated type definitions](https://www.npmjs.com/package/ice-barrage?activeTab=code) for information on the available options.

Each call traverses the whole graph, frozen objects included, so freeze once rather than on every use.
Traversal cost grows with the size of the graph, so it is recommended to only freeze trusted data such as local configuration objects
rather than request bodies or other input of unbounded size:

```js
"use strict";

const iceBarrage = require("ice-barrage");

// iceBarrage mutates and returns the input object
const config = iceBarrage({
	a: 1,
	b: {
		c: 2,
		d: [3, 4, 5],
	},
});

console.log(Object.isFrozen(config)); // true
console.log(Object.isFrozen(config.b)); // true
console.log(Object.isFrozen(config.b.d)); // true

module.exports = config;
```

## Contributing

Contributions are welcome, and any help is greatly appreciated!

See [the contributing guide](https://github.com/Fdawgs/.github/blob/main/CONTRIBUTING.md) for details on how to get started.
Please adhere to this project's [Code of Conduct](https://github.com/Fdawgs/.github/blob/main/CODE_OF_CONDUCT.md) when contributing.

## License

`ice-barrage` is licensed under the [MIT](./LICENSE) license.
