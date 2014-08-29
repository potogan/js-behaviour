+function ($) {
	var Lib = new Class(AbstractBinderClass, {
		__construct: function (elm) {
			this.elm = elm;
			this.input = elm.find('input');

			this.input.addClass('nostyle');

			elm.find('input').css({
				opacity: 0,
				position: 'absolute'
			});

			this.bind(this.input, 'change', 'onFieldChange');
			this.refreshState();
		},

		onFieldChange: function (event, dontPropagate) {
			if (!event.isDefaultPrevented()) {
				this.refreshState();

				if (!dontPropagate) {
					var triggered = $.Event('change');
					this.elm.closest('form')
						.find('[name="' + this.input.attr('name') + '"]')
						.trigger('change', true)
					;
				} else {
					event.stopPropagation();
				}
			}
		},

		refreshState: function () {
			this.elm.removeClass('btn-default btn-info');
			if (this.input.prop('checked')) {
				this.elm.addClass('btn-info');
			} else {
				this.elm.addClass('btn-default');
			}
		}

	}).addStatics({
		bind: function (elm) {
			new this(elm);
		}
	});

	$.behaviour.add('activable-as-button', Lib);
}(jQuery);