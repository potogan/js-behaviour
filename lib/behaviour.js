(function ($) {
	var concatToList = function (storage, key, list) {
		if (! list instanceof [].constructor) {
			list = [list];
		}

		if (storage[key]) {
			storage[key] = storage[key].concat(list);
		} else {
			storage[key] = list;
		}
	};


	$.behaviour = {
		list: {},
		classMap: {},
		dependencies: {},

		add: function (key, behaviour) {
			this.list[key] = behaviour;
		},

		applyBehaviour: function (elm, key, options) {
			if (this.list[key]) {
				this.list[key].bind(elm, options);
			} else {
				console.log('Missing behaviour : ' + key);
			}
		},

		applyBehaviours: function (elm, keys, options) {
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];

				if (this.dependencies[key]) {
					this.applyBehaviours(elm, this.dependencies[key], options);
				}

				this.applyBehaviour(elm, key, options[key] || {});
			};
		},

		addBehavioursToClass: function (className, behaviours) {
			concatToList(this.classMap, className, behaviours);

			return this;
		},

		extractElementBehaviourFromClasses: function (elm) {
			var res = [];
			for (className in this.classMap) {
				if (elm.hasClass(className)) {
					res = res.concat(this.classMap[className]);
				}
			}

			return res;
		},

		addBehaviourDependency: function (behaviour, behaviours) {
			concatToList(this.dependencies, behaviour, behaviours);
			
			return this;
		}
	};

	$.fn.behaviour = function (options) {
		options = options || {};
		for (var i = 0; i < this.length; i++) {
			var elm = $(this[i]),
				keys = elm.attr('behaviour').replace(/(^\s+)|(\s+$)/, '').split(/\s+/)
			;

			keys = keys.concat($.behaviour.extractElementBehaviourFromClasses(elm));

			$.behaviour.applyBehaviours(elm, keys, options)
		};

		return this;
	};
})(jQuery);