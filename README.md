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
- Handling of circular references
- Skipping of accessor properties to avoid side effects
- Support for Symbol keys
- TypeScript type definitions included
- Input validation

## Installation

Install using `npm`:

```sh
npm i ice-barrage
```

## Example usage

Please refer to the [JSDoc comments in the source code](./src/index.js) or the [generated type definitions](https://www.npmjs.com/package/ice-barrage?activeTab=code) for information on the available options.

```js
"use strict";

const iceBarrage = require("ice-barrage");

const exampleObject = {
	a: 1,
	b: {
		c: 2,
		d: [3, 4, 5],
	},
};

iceBarrage(exampleObject); // iceBarrage mutates the input object
console.log(Object.isFrozen(exampleObject)); // true
console.log(Object.isFrozen(exampleObject.b)); // true
console.log(Object.isFrozen(exampleObject.b.d)); // true
```

## Contributing

Contributions are welcome, and any help is greatly appreciated!

See [the contributing guide](https://github.com/Fdawgs/.github/blob/main/CONTRIBUTING.md) for details on how to get started.
Please adhere to this project's [Code of Conduct](https://github.com/Fdawgs/.github/blob/main/CODE_OF_CONDUCT.md) when contributing.

## License

`ice-barrage` is licensed under the [MIT](./LICENSE) license.
