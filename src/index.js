"use strict";

/**
 * @author Frazer Smith
 * @description Iteratively freezes an object and its data properties.
 * Accessor properties are skipped to avoid side effects.
 * This mutates the original object.
 * @template {object} T
 * @param {T} target - The object to be frozen.
 * @param {WeakSet<object>} seen - Set to track visited objects.
 * Stops infinite recursion on circular references.
 * @returns {Readonly<T>} The frozen object.
 */
function freeze(target, seen) {
	/** @type {object[]} */
	const stack = [target];

	// Iterate rather than recurse to avoid call stack overflow on deep objects
	while (stack.length > 0) {
		const current = /** @type {object} */ (stack.pop());

		if (seen.has(current)) {
			continue;
		}
		seen.add(current);

		const descriptors = Object.getOwnPropertyDescriptors(current);
		const keys = Reflect.ownKeys(descriptors);
		const keysLength = keys.length;

		for (let i = 0; i < keysLength; i += 1) {
			// @ts-expect-error Symbols can be used as indices, type is too narrow
			const descriptor = descriptors[keys[i]];
			// Skip accessor properties to avoid side effects
			if (descriptor.get || descriptor.set) {
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

		Object.freeze(current);
	}

	return target;
}

/**
 * @author Frazer Smith
 * @description Iteratively freezes an object and its data properties.
 * Accessor properties are skipped to avoid side effects.
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

	return freeze(obj, new WeakSet());
}

module.exports = iceBarrage; // CommonJS export
module.exports.default = iceBarrage; // ESM default export
module.exports.iceBarrage = iceBarrage; // TypeScript and named export
