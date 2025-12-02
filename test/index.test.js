"use strict";

// eslint-disable-next-line n/no-unsupported-features/node-builtins -- Tests, not in distributed code
const { describe, it } = require("node:test");
const { iceBarrage } = require("../src/index");

/** @typedef {import('node:test').TestContext} TestContext */

/**
 * Recursively checks if an object and all nested properties are frozen.
 * @template {object} T
 * @param {T} obj - The object to be frozen.
 * @param {WeakSet<object>} seen - Set to track visited objects.
 * Stops infinite recursion on circular references.
 * @returns {boolean} True if everything is frozen.
 */
function isDeepFrozen(obj, seen = new WeakSet()) {
	if (seen.has(obj)) {
		return true;
	}
	seen.add(obj);

	if (!Object.isFrozen(obj)) {
		return false;
	}

	const keys = Reflect.ownKeys(obj);
	for (let i = 0; i < keys.length; i += 1) {
		const value = /** @type {Record<string | symbol, unknown>} */ (obj)[
			keys[i]
		];
		if (
			value !== null &&
			(typeof value === "object" || typeof value === "function")
		) {
			if (!isDeepFrozen(value, seen)) {
				return false;
			}
		}
	}

	return true;
}

describe("iceBarrage function", () => {
	it("Freezes an object with depth of one", (/** @type {TestContext} */ t) => {
		const obj = { a: 1, b: "hello", c: true };
		const result = iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(result), true);
		t.assert.throws(() => {
			// @ts-expect-error Testing mutation on frozen property
			result.a = 2;
		}, TypeError);
	});

	it("Freezes an array of objects", (/** @type {TestContext} */ t) => {
		const arr = [{ a: 1 }, { b: 2 }, { c: 3 }];
		const result = iceBarrage(arr);

		t.assert.strictEqual(isDeepFrozen(result), true);
		t.assert.throws(() => {
			result[0].a = 10;
		}, TypeError);
		t.assert.throws(() => {
			// @ts-expect-error Testing mutation on frozen property
			result.push({ d: 4 });
		}, TypeError);
	});

	it("Freezes an object with depth of 5", (/** @type {TestContext} */ t) => {
		const obj = {
			level1: {
				level2: {
					level3: {
						level4: {
							level5: {
								value: "deep",
							},
						},
					},
				},
			},
		};
		const result = iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(result), true);
		t.assert.throws(() => {
			result.level1.level2.level3.level4.level5.value = "changed";
		}, TypeError);
	});

	it("Freezes properties with Symbol keys", (/** @type {TestContext} */ t) => {
		const sym = Symbol("secret");
		const obj = { [sym]: { nested: "value" } };
		const result = iceBarrage(obj);

		t.assert.strictEqual(Object.isFrozen(result), true);
		t.assert.strictEqual(Object.isFrozen(result[sym]), true);
		t.assert.throws(() => {
			result[sym].nested = "changed";
		}, TypeError);
	});

	it("Freezes functions and their properties", (/** @type {TestContext} */ t) => {
		// eslint-disable-next-line jsdoc/require-jsdoc -- Test function
		function fn() {
			return "hello";
		}
		fn.customProp = { a: 1 };
		const obj = { myFunc: fn };
		const result = iceBarrage(obj);

		t.assert.strictEqual(Object.isFrozen(result), true);
		t.assert.strictEqual(Object.isFrozen(result.myFunc), true);
		t.assert.strictEqual(Object.isFrozen(result.myFunc.customProp), true);
		t.assert.throws(() => {
			// @ts-expect-error Testing mutation on frozen property
			result.myFunc.newProp = "test";
		}, TypeError);
	});

	it("Freezes arrays of primitive values", (/** @type {TestContext} */ t) => {
		const arr = [1, 2, 3, "a", "b", true, null];
		const result = iceBarrage(arr);

		t.assert.strictEqual(isDeepFrozen(result), true);
		t.assert.throws(() => {
			// @ts-expect-error Testing mutation on frozen property
			result[0] = 100;
		}, TypeError);
		t.assert.throws(() => {
			// @ts-expect-error Testing mutation on frozen property
			result.push(4);
		}, TypeError);
	});

	it("Freezes mixed nested structures", (/** @type {TestContext} */ t) => {
		const sym = Symbol("key");
		const obj = {
			arr: [1, { inner: "value" }],
			[sym]: "symbolValue",
			fn: Object.assign(() => {}, { prop: { deep: true } }),
		};
		const result = iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(result), true);
	});

	it("Freezes non-enumerable properties", (/** @type {TestContext} */ t) => {
		const obj = {};
		Object.defineProperty(obj, "hidden", {
			value: { secret: "data" },
			enumerable: false,
		});
		const result = iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(result), true);
		t.assert.strictEqual(Object.isFrozen(result.hidden), true);
		t.assert.throws(() => {
			result.hidden.secret = "changed";
		}, TypeError);
	});

	it("Freezes objects with circular references", (/** @type {TestContext} */ t) => {
		/** @type {{ name: string; self?: object }} */
		const obj = { name: "circle" };
		obj.self = obj; // Create circular reference
		const result = iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(result), true);
		t.assert.strictEqual(Object.isFrozen(result.self), true);
		t.assert.throws(() => {
			// @ts-expect-error Testing mutation on frozen property
			result.name = "changed";
		}, TypeError);
	});

	it("Freezes objects with falsy property values", (/** @type {TestContext} */ t) => {
		const obj = {
			zero: 0,
			emptyStr: "",
			falseBool: false,
			nullVal: null,
			nested: { deep: { value: 1 } },
		};
		const result = iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(result), true);
	});
});
