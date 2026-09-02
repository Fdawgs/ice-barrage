"use strict";

const { describe, it } = require("node:test");
const { runInNewContext } = require("node:vm");
const { iceBarrage } = require("../src/index");

/** @typedef {import('node:test').TestContext} TestContext */

/**
 * @author Frazer Smith
 * @description Iteratively checks if an object and all nested properties are frozen.
 * @template {object} T
 * @param {T} obj - The object to check for deep freezing.
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

		for (const key of Reflect.ownKeys(current)) {
			const value = Object.getOwnPropertyDescriptor(current, key)?.value;
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
	describe("Objects, arrays, and functions", () => {
		it("Freezes nested objects", (/** @type {TestContext} */ t) => {
			const obj = {
				emptyString: "",
				falseBoolean: false,
				nested: { deep: { value: 1 } },
				nullValue: null,
				zero: 0,
			};

			const result = iceBarrage(obj);

			t.plan(3);
			t.assert.strictEqual(result, obj);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.throws(() => {
				obj.nested.deep.value = 2;
			}, TypeError);
		});

		it("Freezes arrays and their object elements", (/** @type {TestContext} */ t) => {
			const array = [1, { nested: true }, null];

			iceBarrage(array);

			t.plan(2);
			t.assert.strictEqual(isDeepFrozen(array), true);
			t.assert.throws(() => array.push(2), TypeError);
		});

		it("Freezes a function passed as the root", (/** @type {TestContext} */ t) => {
			const fn = Object.assign(() => {}, { customProp: { a: 1 } });

			t.plan(1);
			t.assert.strictEqual(isDeepFrozen(iceBarrage(fn)), true);
		});

		it("Freezes properties with Symbol keys", (/** @type {TestContext} */ t) => {
			const symbol = Symbol("key");
			const obj = { [symbol]: { nested: "value" } };

			iceBarrage(obj);

			t.plan(1);
			t.assert.strictEqual(Object.isFrozen(obj[symbol]), true);
		});

		it("Freezes non-enumerable properties", (/** @type {TestContext} */ t) => {
			const obj = {};
			const hidden = { secret: "data" };
			Object.defineProperty(obj, "hidden", { value: hidden });

			iceBarrage(obj);

			t.plan(1);
			t.assert.strictEqual(Object.isFrozen(hidden), true);
		});

		it("Freezes objects with a null prototype", (/** @type {TestContext} */ t) => {
			const obj = Object.assign(Object.create(null), {
				nested: { value: 1 },
			});

			t.plan(1);
			t.assert.strictEqual(isDeepFrozen(iceBarrage(obj)), true);
		});
	});

	describe("Shared, cyclic, and already-frozen graphs", () => {
		it("Freezes self-referencing objects", (/** @type {TestContext} */ t) => {
			/** @type {{ self?: object }} */
			const obj = {};
			obj.self = obj;

			t.plan(2);
			t.assert.doesNotThrow(() => iceBarrage(obj));
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});

		it("Freezes mutable children of already-frozen objects", (/** @type {TestContext} */ t) => {
			const child = { grandchild: { value: 1 } };
			const obj = Object.freeze({ child });

			iceBarrage(obj);

			t.plan(1);
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});

		it("Freezes already-frozen shared subtrees", (/** @type {TestContext} */ t) => {
			const shared = Object.freeze({ deep: { value: 1 } });
			const obj = { first: { shared }, second: { shared } };

			iceBarrage(obj);

			t.plan(1);
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});

		it("Freezes sealed and non-extensible shared subtrees", (/** @type {TestContext} */ t) => {
			const sealed = Object.seal({ deep: { value: 1 } });
			const nonExtensible = Object.preventExtensions({
				deep: { value: 2 },
			});
			const obj = {
				first: { nonExtensible, sealed },
				second: { nonExtensible, sealed },
			};

			iceBarrage(obj);

			t.plan(3);
			t.assert.strictEqual(Object.isFrozen(sealed), true);
			t.assert.strictEqual(Object.isFrozen(nonExtensible), true);
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});
	});

	describe("ArrayBuffer views that can be frozen", () => {
		it("Freezes empty TypedArrays and their properties", (/** @type {TestContext} */ t) => {
			const view = new Uint8Array(0);
			const child = { a: 1 };
			Object.defineProperty(view, "custom", { value: child });

			iceBarrage(view);

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(view), true);
			t.assert.strictEqual(Object.isFrozen(child), true);
		});

		it("Freezes DataViews with index-like properties", (/** @type {TestContext} */ t) => {
			const view = new DataView(new ArrayBuffer(8));
			const child = { a: 1 };
			Object.defineProperty(view, "0", {
				configurable: true,
				enumerable: true,
				value: child,
				writable: true,
			});

			iceBarrage(view);

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(view), true);
			t.assert.strictEqual(Object.isFrozen(child), true);
		});

		it("Freezes cross-realm DataViews", (/** @type {TestContext} */ t) => {
			const view = runInNewContext("new DataView(new ArrayBuffer(8))");

			t.plan(3);
			t.assert.strictEqual(ArrayBuffer.isView(view), true);
			t.assert.strictEqual(view instanceof DataView, false);

			iceBarrage(view);
			t.assert.strictEqual(Object.isFrozen(view), true);
		});

		it("Freezes detached cross-realm DataViews", (/** @type {TestContext} */ t) => {
			const buffer = new ArrayBuffer(8);
			const view = runInNewContext("(buf) => new DataView(buf)")(buffer);
			structuredClone(buffer, { transfer: [buffer] });

			t.plan(2);
			t.assert.doesNotThrow(() => iceBarrage(view));
			t.assert.strictEqual(Object.isFrozen(view), true);
		});
	});

	describe("ArrayBuffer views that hold elements", () => {
		it("Freezes properties of non-empty views", (/** @type {TestContext} */ t) => {
			const view = new Uint8Array(4);
			const child = { a: 1 };
			Object.defineProperty(view, "custom", { value: child });

			iceBarrage(view);

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(view), false);
			t.assert.strictEqual(Object.isFrozen(child), true);
		});

		it(
			"Freezes around Buffers that hold many elements",
			{ timeout: 5000 },
			(/** @type {TestContext} */ t) => {
				const payload = {
					file: Buffer.alloc(100000),
					meta: { id: 1 },
					tail: { n: 2 },
				};

				iceBarrage(payload);

				t.plan(4);
				t.assert.strictEqual(Object.isFrozen(payload), true);
				t.assert.strictEqual(Object.isFrozen(payload.meta), true);
				t.assert.strictEqual(Object.isFrozen(payload.tail), true);
				t.assert.strictEqual(Object.isFrozen(payload.file), false);
			}
		);

		it("Freezes properties of TypedArrays from another realm", (/** @type {TestContext} */ t) => {
			const view = runInNewContext("new Uint8Array(4)");
			view.customProp = { a: 1 };

			t.plan(4);
			t.assert.strictEqual(ArrayBuffer.isView(view), true);
			t.assert.strictEqual(view instanceof Uint8Array, false);

			iceBarrage({ view });
			t.assert.strictEqual(Object.isFrozen(view), false);
			t.assert.strictEqual(Object.isFrozen(view.customProp), true);
		});

		it("Freezes custom TypedArray properties without reading overridden accessors", (/** @type {TestContext} */ t) => {
			let lengthRead = false;
			class CustomView extends Uint8Array {}

			const view = new CustomView(4);
			const customValues = [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }];
			const symbol = Symbol("custom");
			Object.defineProperties(view, {
				"00": { value: customValues[0] },
				"1e2": { value: customValues[1] },
				hidden: { value: customValues[2] },
				length: {
					get() {
						lengthRead = true;

						return 0;
					},
				},
			});
			Object.defineProperty(view, symbol, { value: customValues[3] });
			iceBarrage(view);

			t.plan(6);
			t.assert.strictEqual(lengthRead, false);
			t.assert.strictEqual(Object.isFrozen(view), false);
			for (const value of customValues) {
				t.assert.strictEqual(Object.isFrozen(value), true);
			}
		});

		it("Freezes properties of resizable and growable views", (/** @type {TestContext} */ t) => {
			const arrayBuffer = new ArrayBuffer(4, { maxByteLength: 8 });
			const sharedArrayBuffer = new SharedArrayBuffer(4, {
				maxByteLength: 8,
			});
			const arrayView = new Uint8Array(arrayBuffer);
			const sharedArrayView = new Uint8Array(sharedArrayBuffer);
			const arrayChild = { a: 1 };
			const sharedArrayChild = { b: 2 };
			Object.defineProperty(arrayView, "custom", { value: arrayChild });
			Object.defineProperty(sharedArrayView, "custom", {
				value: sharedArrayChild,
			});

			arrayBuffer.resize(8);
			sharedArrayBuffer.grow(8);
			iceBarrage({ arrayView, sharedArrayView });

			t.plan(4);
			t.assert.strictEqual(Object.isFrozen(arrayView), false);
			t.assert.strictEqual(Object.isFrozen(sharedArrayView), false);
			t.assert.strictEqual(Object.isFrozen(arrayChild), true);
			t.assert.strictEqual(Object.isFrozen(sharedArrayChild), true);
		});

		it("Freezes around views that can concurrently gain elements", (/** @type {TestContext} */ t) => {
			const buffer = new SharedArrayBuffer(0, { maxByteLength: 8 });
			const view = new Uint8Array(buffer);
			const child = { a: 1 };
			Object.defineProperty(view, "custom", { value: child });
			iceBarrage(view);

			t.plan(3);
			t.assert.strictEqual(Object.isFrozen(view), false);
			t.assert.strictEqual(Object.isFrozen(child), true);
			t.assert.doesNotThrow(() => buffer.grow(8));
		});
	});

	describe("ArrayBuffers and SharedArrayBuffers", () => {
		it("Freezes ArrayBuffers while leaving their bytes mutable", (/** @type {TestContext} */ t) => {
			const buffer = new ArrayBuffer(4);
			iceBarrage(buffer);

			const bytes = new Uint8Array(buffer);
			bytes[0] = 42;

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(buffer), true);
			t.assert.strictEqual(bytes[0], 42);
		});

		it("Freezes SharedArrayBuffers while leaving their bytes mutable", (/** @type {TestContext} */ t) => {
			const buffer = new SharedArrayBuffer(4);
			iceBarrage(buffer);

			const bytes = new Uint8Array(buffer);
			bytes[0] = 7;

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(buffer), true);
			t.assert.strictEqual(bytes[0], 7);
		});
	});

	describe("Termination on cyclic graphs", () => {
		it("Terminates on disjoint cycles of already-frozen objects", (/** @type {TestContext} */ t) => {
			/** @type {Record<string, object>} */
			const frozenCycles = {};

			// Use two separate 2-node cycles as one cycle can hide a missing marker
			for (const key of ["first", "second"]) {
				/** @type {{ other?: object }} */
				const entry = {};
				entry.other = Object.freeze({ other: entry });
				frozenCycles[key] = Object.freeze(entry);
			}

			t.plan(2);
			t.assert.doesNotThrow(() => iceBarrage(frozenCycles));
			t.assert.strictEqual(isDeepFrozen(frozenCycles), true);
		});

		it(
			"Terminates on a self-referencing non-empty view",
			{ timeout: 5000 },
			(/** @type {TestContext} */ t) => {
				const view = Buffer.from("hi");
				// @ts-expect-error Testing own property on a view
				view.self = view;

				t.plan(1);
				t.assert.doesNotThrow(() => iceBarrage(view));
			}
		);

		it(
			"Terminates on a self-referencing detached view",
			{ timeout: 5000 },
			(/** @type {TestContext} */ t) => {
				const view = new Uint8Array(new ArrayBuffer(8));
				structuredClone(view.buffer, { transfer: [view.buffer] });
				// @ts-expect-error Testing own property on a view
				view.self = view;

				t.plan(1);
				t.assert.doesNotThrow(() => iceBarrage(view));
			}
		);

		it(
			"Terminates on a cycle of detached views",
			{ timeout: 5000 },
			(/** @type {TestContext} */ t) => {
				const first = new Uint8Array(new ArrayBuffer(8));
				const second = new Uint8Array(new ArrayBuffer(8));
				structuredClone(null, {
					transfer: [first.buffer, second.buffer],
				});
				// @ts-expect-error Testing own property on a view
				first.other = second;
				// @ts-expect-error Testing own property on a view
				second.other = first;

				t.plan(1);
				t.assert.doesNotThrow(() => iceBarrage({ first, second }));
			}
		);
	});

	describe("Side effects during freezing", () => {
		it("Does not trigger accessors", (/** @type {TestContext} */ t) => {
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

			t.plan(2);
			t.assert.strictEqual(obj.testVal, "original");
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});

		it("Does not trigger get/set proxy traps", (/** @type {TestContext} */ t) => {
			let trapTriggered = false;
			const proxy = new Proxy(
				{ nested: { a: 1 } },
				{
					get(target, property) {
						trapTriggered = true;
						return Reflect.get(target, property);
					},
					set(target, property, value) {
						trapTriggered = true;
						return Reflect.set(target, property, value);
					},
				}
			);

			iceBarrage({ proxy });

			t.plan(2);
			t.assert.strictEqual(trapTriggered, false);
			t.assert.strictEqual(isDeepFrozen(proxy), true);
		});
	});

	describe("Input validation and traversal limits", () => {
		it("Throws an error for primitive arguments", (/** @type {TestContext} */ t) => {
			const expected = {
				name: "TypeError",
				message: "Expected an object, array, or function",
			};

			t.plan(4);
			// @ts-expect-error Testing invalid argument
			t.assert.throws(() => iceBarrage(null), expected);
			// @ts-expect-error Testing invalid argument
			t.assert.throws(() => iceBarrage(42), expected);
			// @ts-expect-error Testing invalid argument
			t.assert.throws(() => iceBarrage(), expected);
			// @ts-expect-error Testing invalid argument
			t.assert.throws(() => iceBarrage(undefined), expected);
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
			t.plan(2);
			t.assert.doesNotThrow(() => iceBarrage(root));
			t.assert.strictEqual(isDeepFrozen(root), true);
		});
	});
});
