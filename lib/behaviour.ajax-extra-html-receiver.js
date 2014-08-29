+function ($) {
	var Lib = {
		callbacks: [],
		bind: function (elm) {
			elm.on('ajax-success', Lib.onAjaxSuccess);
		},

		onAjaxSuccess: function (event) {
			if (event.parsedResponse.extra) {
				var extra = $(event.parsedResponse.extra);
				for (var i = 0; i < Lib.callbacks.length; i++) {
					Lib.callbacks[i](extra, event);
				};

				delete event.parsedResponse.extra;
			}
		}
	};

	$.behaviour.add('ajax-extra-html-receiver', Lib);

}(jQuery);