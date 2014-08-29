

$.behaviour.add('ajax-event-retransmitter', {
	bind: function (elm, options) {
		var target = options.target ? $(options.target) : elm.find('[behaviour~="ajax-content-receiver"]');

		elm.on('ajax-success ajax-error ajax-pending', target, this.transmitAjax);
	},

	transmitAjax: function (event) {
		if (!event.isDefaultPrevented() && !event.isPropagationStopped() && !event.preventTransmitLoop) {
			event.preventTransmitLoop = true;

			event.data.trigger(event);
			
			event.preventDefault();
			event.stopPropagation();
		}
	}
});