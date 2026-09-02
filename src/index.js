"use strict";

const { isSharedArrayBuffer, isTypedArray } = require("node:util").types;

/**
 * @param {object} typedArray - The TypedArray to inspect.
 * @returns {number} The number of indexed elements.
 */
function getTypedArrayLength(typedArray) {
	return Reflect.get(Uint8Array.prototype, "length", typedArray);
}

/**
 * @author Frazer Smith
 * @description Iteratively freezes an object and its data properties.
 * Accessor properties are skipped to avoid side effects.
 *
 * ArrayBuffer views that hold or can concurrently gain elements are not
 * frozen, but their property values are frozen.
 *
 * This mutates the original object.
 * @template {object} T
 * @param {T} obj - The object, array, or function to be frozen.
 * @returns {Readonly<T>} The frozen object, array, or function.
 * @throws {TypeError} If the argument is not an object, array, or function.
 */
function iceBarrage(obj) {
	const objType = typeof obj;
	if (obj === null || (objType !== "object" && objType !== "function")) {
		throw new TypeError("Expected an object, array, or function");
	}

	/** @type {object[]} */
	const stack = [obj];
	/** @type {Set<object> | undefined} */
	let seen;

	// Iterate rather than recurse to avoid call stack overflow on deep objects
	while (stack.length > 0) {
		const current = /** @type {object} */ (stack.pop());

		/**
		 * Track views and non-extensible objects to prevent repeat visits.
		 * Non-empty views throw when passed to `Object.freeze()`, so all views
		 * are marked as seen explicitly to avoid repeat traversal.
		 * Visit non-extensible objects once to process their mutable children.
		 * `Object.isExtensible()` is O(1) in every state, whereas
		 * `Object.isFrozen()` walks every property of a non-extensible object.
		 */
		const isView = ArrayBuffer.isView(current);
		// TypedArrays are integer indexed, but DataViews are not
		const isIntegerIndexed = isView && isTypedArray(current);
		if (isView || !Object.isExtensible(current)) {
			seen ??= new Set();
			if (seen.has(current)) {
				continue;
			}
			seen.add(current);
		}

		const indexedKeysLength = isIntegerIndexed
			? getTypedArrayLength(current)
			: 0;
		// Determine if the view can grow concurrently, which is only possible for growable SharedArrayBuffers
		let canGrowConcurrently = false;
		if (isIntegerIndexed && indexedKeysLength === 0) {
			const buffer = Reflect.get(Uint8Array.prototype, "buffer", current);
			canGrowConcurrently =
				isSharedArrayBuffer(buffer) &&
				Reflect.get(SharedArrayBuffer.prototype, "growable", buffer);
		}

		const keys = Reflect.ownKeys(current);
		const keysLength = keys.length;

		/**
		 * Imperative loops are faster than functional loops.
		 * @see {@link https://romgrk.com/posts/optimizing-javascript#3-avoid-arrayobject-methods | Optimizing Javascript}
		 */
		for (let i = indexedKeysLength; i < keysLength; i += 1) {
			const key = keys[i];
			const descriptor = Object.getOwnPropertyDescriptor(current, key);

			/**
			 * Skip accessor properties to avoid side effects.
			 * Only data descriptors own `value`, and an own-key check cannot
			 * be fooled by a polluted `Object.prototype.get` or `set`.
			 */
			if (
				descriptor === undefined ||
				!Object.hasOwn(descriptor, "value")
			) {
				continue;
			}

			const { value } = descriptor;
			if (value !== null) {
				if (typeof value === "object" || typeof value === "function") {
					// Add to stack for processing
					stack.push(value);
				}
			}
		}

		/**
		 * Skip views that contain or can concurrently gain indexed elements
		 * because `Object.freeze()` can throw for them.
		 */
		const hasIndexedElements =
			isIntegerIndexed && (indexedKeysLength > 0 || canGrowConcurrently);
		if (!hasIndexedElements) {
			Object.freeze(current);
		}
	}

	return obj;
}

module.exports = iceBarrage; // CommonJS export
module.exports.default = iceBarrage; // ESM default export
module.exports.iceBarrage = iceBarrage; // TypeScript and named export
