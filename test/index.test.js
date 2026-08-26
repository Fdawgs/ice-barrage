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

/**
 * @author Frazer Smith
 * @description Creates a detached typed array by transferring its buffer.
 * @returns {Uint8Array} A detached view.
 */
function detachedView() {
	const view = new Uint8Array(new ArrayBuffer(8));
	structuredClone(view.buffer, { transfer: [view.buffer] });

	return view;
}

describe("iceBarrage function", () => {
	describe("Objects, arrays, and functions", () => {
		it("Freezes an object with depth of one", (/** @type {TestContext} */ t) => {
			const obj = { a: 1, b: "hello", c: true };
			iceBarrage(obj);

			t.plan(2);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.throws(() => {
				obj.a = 2;
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

			t.plan(2);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.throws(() => {
				obj.level1.level2.level3.level4.level5.value = "changed";
			}, TypeError);
		});

		it("Freezes an array of objects", (/** @type {TestContext} */ t) => {
			const arr = [{ a: 1 }, { b: 2 }, { c: 3 }];
			iceBarrage(arr);

			t.plan(3);
			t.assert.strictEqual(isDeepFrozen(arr), true);
			t.assert.throws(() => {
				arr[0].a = 10;
			}, TypeError);
			t.assert.throws(() => {
				// @ts-expect-error Testing mutation on frozen property
				arr.push({ d: 4 });
			}, TypeError);
		});

		it("Freezes arrays of primitive values", (/** @type {TestContext} */ t) => {
			const arr = [1, 2, 3, "a", "b", true, null];
			iceBarrage(arr);

			t.plan(3);
			t.assert.strictEqual(Object.isFrozen(arr), true);
			t.assert.throws(() => {
				arr[0] = 100;
			}, TypeError);
			t.assert.throws(() => {
				arr.push(4);
			}, TypeError);
		});

		it("Freezes functions nested in an object", (/** @type {TestContext} */ t) => {
			// eslint-disable-next-line jsdoc/require-jsdoc -- Test function
			function fn() {
				return "hello";
			}
			fn.customProp = { a: 1 };
			const obj = { myFunc: fn };
			iceBarrage(obj);

			t.plan(4);
			t.assert.strictEqual(Object.isFrozen(obj), true);
			t.assert.strictEqual(Object.isFrozen(obj.myFunc), true);
			t.assert.strictEqual(Object.isFrozen(obj.myFunc.customProp), true);
			t.assert.throws(() => {
				// @ts-expect-error Testing mutation on frozen property
				obj.myFunc.newProp = "test";
			}, TypeError);
		});

		it("Freezes a function passed as the root", (/** @type {TestContext} */ t) => {
			// eslint-disable-next-line jsdoc/require-jsdoc -- Test function
			function fn() {}
			fn.customProp = { a: 1 };
			iceBarrage(fn);

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(fn), true);
			t.assert.strictEqual(Object.isFrozen(fn.customProp), true);
		});

		it("Freezes mixed nested structures", (/** @type {TestContext} */ t) => {
			const sym = Symbol("key");
			const obj = {
				arr: [1, { inner: "value" }],
				[sym]: "symbolValue",
				fn: Object.assign(() => {}, { prop: { deep: true } }),
			};
			iceBarrage(obj);

			t.plan(1);
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});

		it("Freezes objects with a null prototype", (/** @type {TestContext} */ t) => {
			const obj = Object.create(null);
			obj.nested = { a: 1 };
			iceBarrage(obj);

			t.plan(1);
			t.assert.strictEqual(isDeepFrozen(obj), true);
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

			t.plan(1);
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});
	});

	describe("Property keys and visibility", () => {
		it("Freezes properties with Symbol keys", (/** @type {TestContext} */ t) => {
			const sym = Symbol("secret");
			const obj = { [sym]: { nested: "value" } };
			iceBarrage(obj);

			t.plan(3);
			t.assert.strictEqual(Object.isFrozen(obj), true);
			t.assert.strictEqual(Object.isFrozen(obj[sym]), true);
			t.assert.throws(() => {
				obj[sym].nested = "changed";
			}, TypeError);
		});

		it("Freezes non-enumerable properties", (/** @type {TestContext} */ t) => {
			const obj = {};
			Object.defineProperty(obj, "hidden", {
				value: { secret: "data" },
				enumerable: false,
			});
			iceBarrage(obj);

			t.plan(3);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.strictEqual(Object.isFrozen(obj.hidden), true);
			t.assert.throws(() => {
				obj.hidden.secret = "changed";
			}, TypeError);
		});
	});

	describe("Shared, cyclic, and already-frozen graphs", () => {
		it("Freezes self-referencing objects", (/** @type {TestContext} */ t) => {
			/** @type {{ name: string; self?: object }} */
			const obj = { name: "circle" };
			obj.self = obj;
			iceBarrage(obj);

			t.plan(3);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.strictEqual(Object.isFrozen(obj.self), true);
			t.assert.throws(() => {
				obj.name = "changed";
			}, TypeError);
		});

		it("Freezes mutable children of an already-frozen object", (/** @type {TestContext} */ t) => {
			const child = { grandchild: { value: 1 } };
			const obj = Object.freeze({ child });
			iceBarrage(obj);

			t.plan(2);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.throws(() => {
				child.grandchild.value = 2;
			}, TypeError);
		});

		it("Freezes an already-frozen shared subtree", (/** @type {TestContext} */ t) => {
			const shared = Object.freeze({ deep: { value: 1 } });
			const obj = { first: { shared }, second: { shared } };
			iceBarrage(obj);

			t.plan(2);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.throws(() => {
				shared.deep.value = 2;
			}, TypeError);
		});

		it("Freezes a cycle of already-frozen objects", (/** @type {TestContext} */ t) => {
			/** @type {{ first?: object; second?: object }} */
			const obj = {};
			/** @type {{ first?: object; second?: object }} */
			const other = {};

			// Use two references each way as one reference can hide a missing revisit marker
			obj.first = other;
			obj.second = other;
			other.first = obj;
			other.second = obj;
			Object.freeze(obj);
			Object.freeze(other);

			t.plan(2);
			t.assert.doesNotThrow(() => iceBarrage(obj));
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});

		it("Freezes two disjoint cycles of already-frozen objects", (/** @type {TestContext} */ t) => {
			/** @type {Record<string, object>} */
			const obj = {};

			// Use two separate 2-node cycles as one cycle can hide a missing marker
			for (const key of ["first", "second"]) {
				/** @type {{ other?: object }} */
				const entry = {};
				entry.other = Object.freeze({ other: entry });
				obj[key] = Object.freeze(entry);
			}

			t.plan(2);
			t.assert.doesNotThrow(() => iceBarrage(obj));
			t.assert.strictEqual(isDeepFrozen(obj), true);
		});
	});

	describe("ArrayBuffer views that can be frozen", () => {
		it("Freezes empty ArrayBuffer views and their properties", (/** @type {TestContext} */ t) => {
			const view = new Uint8Array(0);
			// @ts-expect-error Testing own property on a view
			view.customProp = { a: 1 };
			const obj = { view };
			iceBarrage(obj);

			t.plan(2);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.throws(() => {
				// @ts-expect-error Testing mutation on frozen property
				view.customProp = { a: 2 };
			}, TypeError);
		});

		it("Freezes empty Buffers and their properties", (/** @type {TestContext} */ t) => {
			const buf = Buffer.alloc(0);
			// @ts-expect-error Testing own property on a view
			buf.customProp = { a: 1 };
			iceBarrage({ buf });

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(buf), true);
			// @ts-expect-error Testing own property on a view
			t.assert.strictEqual(Object.isFrozen(buf.customProp), true);
		});

		it("Freezes non-empty DataViews and their properties", (/** @type {TestContext} */ t) => {
			const view = new DataView(new ArrayBuffer(8));
			// @ts-expect-error Testing own property on a view
			view.customProp = { a: 1 };
			const obj = { view };
			iceBarrage(obj);

			t.plan(2);
			t.assert.strictEqual(isDeepFrozen(obj), true);
			t.assert.throws(() => {
				// @ts-expect-error Testing mutation on frozen property
				view.customProp = { a: 2 };
			}, TypeError);
		});

		it("Freezes DataViews from another realm", (/** @type {TestContext} */ t) => {
			const view = runInNewContext("new DataView(new ArrayBuffer(8))");

			t.plan(3);
			t.assert.strictEqual(ArrayBuffer.isView(view), true);
			t.assert.strictEqual(view instanceof DataView, false);

			iceBarrage({ view });
			t.assert.strictEqual(Object.isFrozen(view), true);
		});

		it("Freezes detached DataViews from another realm", (/** @type {TestContext} */ t) => {
			const buffer = new ArrayBuffer(8);
			const view = runInNewContext("(buf) => new DataView(buf)")(buffer);
			structuredClone(buffer, { transfer: [buffer] });

			t.plan(2);
			t.assert.doesNotThrow(() => iceBarrage({ view }));
			t.assert.strictEqual(Object.isFrozen(view), true);
		});
	});

	describe("ArrayBuffer views that hold elements", () => {
		it("Freezes around non-empty ArrayBuffer views without throwing", (/** @type {TestContext} */ t) => {
			const payload = {
				meta: { id: 1 },
				file: Buffer.from("hello"),
				tail: { n: 2 },
			};

			t.plan(5);
			t.assert.doesNotThrow(() => iceBarrage(payload));
			t.assert.strictEqual(Object.isFrozen(payload), true);
			t.assert.strictEqual(Object.isFrozen(payload.meta), true);
			t.assert.strictEqual(Object.isFrozen(payload.tail), true);

			// Views holding elements cannot be frozen by `Object.freeze`
			t.assert.strictEqual(Object.isFrozen(payload.file), false);
		});

		it("Freezes properties of non-empty ArrayBuffer views", (/** @type {TestContext} */ t) => {
			const view = new Uint8Array(4);
			// @ts-expect-error Testing own property on a view
			view.customProp = { a: 1 };

			t.plan(2);
			t.assert.doesNotThrow(() => iceBarrage({ view }));
			// @ts-expect-error Testing own property on a view
			t.assert.strictEqual(Object.isFrozen(view.customProp), true);
		});

		it("Freezes the properties of a view passed as the root", (/** @type {TestContext} */ t) => {
			const buf = Buffer.from("hi");
			// @ts-expect-error Testing own property on a view
			buf.customProp = { a: 1 };
			const result = iceBarrage(buf);

			t.plan(3);
			t.assert.strictEqual(result, buf);
			// Views holding elements cannot be frozen by `Object.freeze()`
			t.assert.strictEqual(Object.isFrozen(buf), false);
			// @ts-expect-error Testing own property on a view
			t.assert.strictEqual(Object.isFrozen(buf.customProp), true);
		});

		it(
			"Freezes around Buffers that hold many elements",
			{ timeout: 5000 },
			(/** @type {TestContext} */ t) => {
				const payload = {
					meta: { id: 1 },
					file: Buffer.alloc(100000),
					tail: { n: 2 },
				};

				t.plan(4);
				t.assert.doesNotThrow(() => iceBarrage(payload));
				t.assert.strictEqual(Object.isFrozen(payload.meta), true);
				t.assert.strictEqual(Object.isFrozen(payload.tail), true);
				t.assert.strictEqual(Object.isFrozen(payload.file), false);
			}
		);
	});

	describe("ArrayBuffers and SharedArrayBuffers", () => {
		it("Freezes ArrayBuffers, whose bytes stay mutable", (/** @type {TestContext} */ t) => {
			const buffer = new ArrayBuffer(4);
			iceBarrage({ buffer });

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(buffer), true);

			new Uint8Array(buffer)[0] = 42;
			t.assert.strictEqual(new Uint8Array(buffer)[0], 42);
		});

		it("Freezes SharedArrayBuffers, whose bytes stay mutable", (/** @type {TestContext} */ t) => {
			const buffer = new SharedArrayBuffer(4);
			iceBarrage({ buffer });

			t.plan(2);
			t.assert.strictEqual(Object.isFrozen(buffer), true);

			new Uint8Array(buffer)[0] = 7;
			t.assert.strictEqual(new Uint8Array(buffer)[0], 7);
		});
	});

	describe("Termination on views that cannot be marked frozen", () => {
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
				const view = detachedView();
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
				const first = detachedView();
				const second = detachedView();
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

			t.plan(2);
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

			t.plan(2);
			t.assert.strictEqual(trapTriggered, false);
			t.assert.strictEqual(isDeepFrozen(obj), true);
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
