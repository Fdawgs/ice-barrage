"use strict";

// eslint-disable-next-line n/no-unsupported-features/node-builtins -- Tests, not in distributed code
const { describe, it } = require("node:test");
const { iceBarrage } = require("../src/index");

/** @typedef {import('node:test').TestContext} TestContext */

/**
 * Iteratively checks if an object and all nested properties are frozen.
 * @template {object} T
 * @param {T} obj - The object to be frozen.
 * @returns {boolean} True if everything is frozen.
 */
function isDeepFrozen(obj) {
	/** @type {object[]} */
	const stack = [obj];
	const seen = new WeakSet();

	while (stack.length > 0) {
		const current = /** @type {object} */ (stack.pop());

		if (seen.has(current)) {
			continue;
		}
		seen.add(current);

		if (!Object.isFrozen(current)) {
			return false;
		}

		const descriptors = Object.getOwnPropertyDescriptors(current);
		const keys = Reflect.ownKeys(current);
		const keysLength = keys.length;
		for (let i = 0; i < keysLength; i += 1) {
			// @ts-expect-error Symbols can be used as indices, type is too narrow
			const descriptor = descriptors[keys[i]];
			// Skip accessor properties to avoid side effects
			if (descriptor.get || descriptor.set) {
				continue;
			}
			const { value } = descriptor;
			if (
				value !== null &&
				(typeof value === "object" || typeof value === "function")
			) {
				stack.push(value);
			}
		}
	}

	return true;
}

describe("iceBarrage function", () => {
	it("Freezes an object with depth of one", (/** @type {TestContext} */ t) => {
		const obj = { a: 1, b: "hello", c: true };
		iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(obj), true);
		t.assert.throws(() => {
			obj.a = 2;
		}, TypeError);
	});

	it("Freezes an array of objects", (/** @type {TestContext} */ t) => {
		const arr = [{ a: 1 }, { b: 2 }, { c: 3 }];
		iceBarrage(arr);

		t.assert.strictEqual(isDeepFrozen(arr), true);
		t.assert.throws(() => {
			arr[0].a = 10;
		}, TypeError);
		t.assert.throws(() => {
			// @ts-expect-error Testing mutation on frozen property
			arr.push({ d: 4 });
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
		iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(obj), true);
		t.assert.throws(() => {
			obj.level1.level2.level3.level4.level5.value = "changed";
		}, TypeError);
	});

	it("Freezes properties with Symbol keys", (/** @type {TestContext} */ t) => {
		const sym = Symbol("secret");
		const obj = { [sym]: { nested: "value" } };
		iceBarrage(obj);

		t.assert.strictEqual(Object.isFrozen(obj), true);
		t.assert.strictEqual(Object.isFrozen(obj[sym]), true);
		t.assert.throws(() => {
			obj[sym].nested = "changed";
		}, TypeError);
	});

	it("Freezes functions and their properties", (/** @type {TestContext} */ t) => {
		// eslint-disable-next-line jsdoc/require-jsdoc -- Test function
		function fn() {
			return "hello";
		}
		fn.customProp = { a: 1 };
		const obj = { myFunc: fn };
		iceBarrage(obj);

		t.assert.strictEqual(Object.isFrozen(obj), true);
		t.assert.strictEqual(Object.isFrozen(obj.myFunc), true);
		t.assert.strictEqual(Object.isFrozen(obj.myFunc.customProp), true);
		t.assert.throws(() => {
			// @ts-expect-error Testing mutation on frozen property
			obj.myFunc.newProp = "test";
		}, TypeError);
	});

	it("Freezes arrays of primitive values", (/** @type {TestContext} */ t) => {
		const arr = [1, 2, 3, "a", "b", true, null];
		iceBarrage(arr);

		t.assert.strictEqual(Object.isFrozen(arr), true);
		t.assert.throws(() => {
			arr[0] = 100;
		}, TypeError);
		t.assert.throws(() => {
			arr.push(4);
		}, TypeError);
	});

	it("Freezes mixed nested structures", (/** @type {TestContext} */ t) => {
		const sym = Symbol("key");
		const obj = {
			arr: [1, { inner: "value" }],
			[sym]: "symbolValue",
			fn: Object.assign(() => {}, { prop: { deep: true } }),
		};
		iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(obj), true);
	});

	it("Freezes non-enumerable properties", (/** @type {TestContext} */ t) => {
		const obj = {};
		Object.defineProperty(obj, "hidden", {
			value: { secret: "data" },
			enumerable: false,
		});
		iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(obj), true);
		t.assert.strictEqual(Object.isFrozen(obj.hidden), true);
		t.assert.throws(() => {
			obj.hidden.secret = "changed";
		}, TypeError);
	});

	it("Freezes objects with circular references", (/** @type {TestContext} */ t) => {
		/** @type {{ name: string; self?: object }} */
		const obj = { name: "circle" };
		obj.self = obj;
		iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(obj), true);
		t.assert.strictEqual(Object.isFrozen(obj.self), true);
		t.assert.throws(() => {
			obj.name = "changed";
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
		iceBarrage(obj);

		t.assert.strictEqual(isDeepFrozen(obj), true);
	});

	it("Does not trigger accessors during freezing", (/** @type {TestContext} */ t) => {
		const obj = {
			testVal: "original",
			get badGetter() {
				obj.testVal = "mutated";

				return undefined;
			},
			set badSetter(/** @type {unknown} */ _) {
				obj.testVal = "mutated";
			},
		};
		iceBarrage(obj);

		t.assert.strictEqual(obj.testVal, "original");
		t.assert.strictEqual(isDeepFrozen(obj), true);
	});

	it("Does not trigger accessor proxy traps during freezing", (/** @type {TestContext} */ t) => {
		let trapTriggered = false;
		const proxy = new Proxy(
			{ nested: { a: 1 } },
			{
				get(obj, prop) {
					trapTriggered = true;
					return Reflect.get(obj, prop);
				},
				set(obj, prop, value) {
					trapTriggered = true;
					return Reflect.set(obj, prop, value);
				},
			}
		);
		const obj = { child: proxy };
		iceBarrage(obj);

		t.assert.strictEqual(trapTriggered, false);
		t.assert.strictEqual(isDeepFrozen(obj), true);
	});

	it("Throws an error if the argument is not an object, array, or function", (/** @type {TestContext} */ t) => {
		t.plan(4);
		// @ts-expect-error Testing invalid argument
		t.assert.throws(() => iceBarrage(null), TypeError);
		// @ts-expect-error Testing invalid argument
		t.assert.throws(() => iceBarrage(42), TypeError);
		// @ts-expect-error Testing invalid argument
		t.assert.throws(() => iceBarrage(), TypeError);
		// @ts-expect-error Testing invalid argument
		t.assert.throws(() => iceBarrage(undefined), TypeError);
	});

	it("Does not cause call stack overflow on deep objects", (/** @type {TestContext} */ t) => {
		/** @type {{ next?: object }} */
		const root = {};
		let cursor = root;

		// 250,000 levels deep should be sufficient to cause stack overflow with recursion
		for (let i = 0; i < 250000; i += 1) {
			cursor.next = {};
			cursor = cursor.next;
		}
		t.assert.doesNotThrow(() => iceBarrage(root));
		t.assert.strictEqual(isDeepFrozen(root), true);
	});
});
