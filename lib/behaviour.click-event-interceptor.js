(function ($) {
	var Lib = {
		bind: function (elm) {
			elm.on('click', Lib.interceptor);
		},
		interceptor: function (event) {
			event.stopPropagation();
			event.preventDefault();
		}
	};

	$.behaviour.add('click-event-interceptor', Lib);
})(jQuery);