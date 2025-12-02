"use strict";

/**
 * @description Recursively freezes an object and its nested properties.
 * This mutates the original object.
 * @template {object} T
 * @param {T} target - The object to be frozen.
 * @param {WeakSet<object>} seen - Set to track visited objects.
 * Stops infinite recursion on circular references.
 * @returns {Readonly<T>} The frozen object.
 */
function freeze(target, seen) {
	if (seen.has(target)) {
		return target;
	}
	seen.add(target);

	const keys = Reflect.ownKeys(target);
	const keysLength = keys.length;
	/**
	 * Imperative loops are faster than functional loops.
	 * @see {@link https://romgrk.com/posts/optimizing-javascript#3-avoid-arrayobject-methods | Optimizing Javascript}
	 */
	for (let i = 0; i < keysLength; i += 1) {
		const value = /** @type {Record<string | symbol, unknown>} */ (target)[
			keys[i]
		];
		if (value !== null) {
			if (typeof value === "object" || typeof value === "function") {
				freeze(value, seen);
			}
		}
	}

	return Object.freeze(target);
}

/**
 * @description Recursively freezes an object and its nested properties.
 * This mutates the original object.
 * @template {object} T
 * @param {T} obj - The object, array, or function to be frozen.
 * @returns {Readonly<T>} The frozen object, array, or function.
 */
function iceBarrage(obj) {
	return freeze(obj, new WeakSet());
}

module.exports = iceBarrage; // CommonJS export
module.exports.default = iceBarrage; // ESM default export
module.exports.iceBarrage = iceBarrage; // TypeScript and named export
