+function ($) {
	var AjaxMenu = {
		defaults: {
			activeClass: 'current',
			classOnParent: 'li'
		},

		bind: function (elm, options) {
			if (options) {
				options = $.extend({}, AjaxMenu.defaults, options);
			} else {
				options = AjaxMenu.defaults;
			}
			if (window.History.enabled) {
				var infos = {
					elm: elm,
					links: elm.find('a'),
					_applyClassOn: null,
					options: options
				};

				for (var i = infos.links.length - 1; i >= 0; i--) {
					$.behaviour.applyBehaviour($(infos.links[i]), 'ajax', {});
				};

				if (infos.options.classOnParent) {
					infos._applyClassOn = infos.links.closest(infos.options.classOnParent);
				} else {
					infos._applyClassOn = infos.links;
				}

				// Bind to StateChange Event
				window.History.Adapter.bind(window, 'statechange', function (event) {
					return AjaxMenu.onStateChange(infos, event);
				});

				elm.on('ajax-menu-desactivated ajax-menu-activated', AjaxMenu.dropEvent);
			}

		},

		onStateChange: function (infos, event) {
			var state = window.History.getState(),
				current = infos.links.filter(function () {
					return this.href === state.url;
				})
			;

			if (infos.options.classOnParent) {
				current = current.closest(infos.options.classOnParent)
			}

			infos._applyClassOn.not(current)
				.removeClass(infos.options.activeClass)
				.trigger('ajax-menu-desactivated')
			;
			current
				.addClass(infos.options.activeClass)
				.trigger('ajax-menu-activated')
			;
		},

		dropEvent: function (event) {
			event.stopPropagation();
			event.preventDefault();
		}
	};

	$.behaviour.add('ajax-menu', AjaxMenu);
}(jQuery);