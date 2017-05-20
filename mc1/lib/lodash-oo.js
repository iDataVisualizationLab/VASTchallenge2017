// lodash-oo v0.0.2  2014-02-04
(function(_) {
	'use strict';

	// source: src/inherits.js
	// make [child] inherit the prototype of [parent]
	function inherits(child, parent) {
		child.prototype.__proto__ = _.create(parent.prototype, {
			'constructor': child,
			'super_': parent
		});
		_.overload(child.prototype, parent.prototype);
		// and that's that!
	}

	_.inherits = inherits;

	// source: src/overload.js
	// copies all methods in [source] to [target], if the method
	// already exists in [target] it is updated to support accessing
	// the original method (in [source]) through this.super_
	function overload(target, source) {
		_.methods(source)
			.forEach(function(name) {
				if (_.isFunction(target[name])) {
					var original = source[name],
						overloaded = target[name],
						wrapper;
					target[name] = function() {
						var prev_ = this.super_,
							rv;
						this.super_ = original;
						rv = overloaded.apply(this, arguments);
						this.super_ = prev_;
						return rv;
					};
				} else {
					Object.defineProperty(target, name, {
						enumerable: false,
						configurable: false,
						writeable: false,
						value: source[name]
					});
				}
			});
	}

	_.overload = overload;

}(_ || module && module.exports));
