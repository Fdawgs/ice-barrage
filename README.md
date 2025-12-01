# ice-barrage

[![GitHub release](https://img.shields.io/github/release/Fdawgs/ice-barrage.svg)](https://github.com/Fdawgs/ice-barrage/releases/latest/)
[![npm version](https://img.shields.io/npm/v/ice-barrage)](https://npmjs.com/package/ice-barrage)
[![CI](https://github.com/Fdawgs/ice-barrage/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Fdawgs/ice-barrage/actions/workflows/ci.yml)
[![Coverage status](https://coveralls.io/repos/github/Fdawgs/ice-barrage/badge.svg?branch=main)](https://coveralls.io/github/Fdawgs/ice-barrage?branch=main)
[![code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)

> Node.js module to recursively freeze objects, arrays, and functions

# Overview

`ice-barrage` is a drop-in replacement for `deep-freeze`, with added TypeScript support, improved performance, and better handling of edge cases such as circular references.

## Installation

Install using `npm`:

```bash
npm i ice-barrage
```

## Example usage

Please refer to the [JSDoc comments in the source code](./src/index.js) or the [generated type definitions](https://www.npmjs.com/package/ice-barrage?activeTab=code) for information on the available options.

```js
const iceBarrage = require("ice-barrage");

const exampleObject = {
	a: 1,
	b: {
		c: 2,
		d: [3, 4, 5],
	},
};

const frozenObject = iceBarrage(exampleObject);
console.log(Object.isFrozen(frozenObject)); // true
console.log(Object.isFrozen(frozenObject.b)); // true
console.log(Object.isFrozen(frozenObject.b.d)); // true
```

## Contributing

Contributions are welcome, and any help is greatly appreciated!

See [the contributing guide](https://github.com/Fdawgs/.github/blob/main/CONTRIBUTING.md) for details on how to get started.
Please adhere to this project's [Code of Conduct](https://github.com/Fdawgs/.github/blob/main/CODE_OF_CONDUCT.md) when contributing.

## License

`ice-barrage` is licensed under the [MIT](./LICENSE) license.
