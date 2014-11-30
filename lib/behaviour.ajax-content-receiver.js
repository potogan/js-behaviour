+function ($) {
	var Lib = {
		cancelNextChangeState: false,
		currentCatchedEvent: null,
		currentParsedResponse: null,
		callbacks: [],
		bind: function (elm) {
			elm.on('ajax-success', Lib.onAjaxSuccess);

			if (window.History.enabled && !elm[0].hasAttribute('data-ajax-content-receiver-no-history')) {
				window.History.Adapter.bind(window, 'popstate', function () {
					Lib.onPopState(elm);
				});
			}

		},

		onAjaxSuccess: function (event) {
			var $this = $(this);
			if (!event.isDefaultPrevented() && event.parsedResponse.content !== undefined && event.parsedResponse.content !== null) {
				Lib.currentCatchedEvent = event;
				Lib.currentParsedResponse = event.parsedResponse;

				if ($.fn.replaceContent) {
					$this.replaceContent(event.parsedResponse.content);
				} else {
					$this.hide().empty().html(event.parsedResponse.content).show();
				}

				if (event.parsedResponse.title !== undefined) {
					if (event.parsedResponse.title) {
						try {
							$('title').html(event.parsedResponse.title);
						} catch (e) {}
					}
				}

				if (
					window.History
					&& window.History.enabled
					&& event.params.url
					&& !this.hasAttribute('data-ajax-content-receiver-no-history')
				) {
					if (event.which == 2 || event.metaKey) {
						// cmd click
					} else {
						Lib.cancelNextChangeState = true;

						window.History.pushState(
							{url: event.parsedResponse.forceCanonicalUrl || event.params.url},
							event.parsedResponse.title,
							event.parsedResponse.forceCanonicalUrl || event.params.url
						);

						Lib.cancelNextChangeState = false;
					}
				}

				for (var i = 0; i < Lib.callbacks.length; i++) {
					Lib.callbacks[i]($this, event);
				};
				
				event.preventDefault();
				Lib.currentCatchedEvent = null;
				Lib.currentParsedResponse = null;
			}
		},

		onPopState: function (elm) {
			if (!Lib.cancelNextChangeState) {
				var state = window.History.getState();

				$.behaviour.list.ajax.elementEventHandlerQuery(elm, null, {
					url: (state.data ? state.data.url : false) || state.url
				});
			}
		}
	};

	$.behaviour.add('ajax-content-receiver', Lib);

}(jQuery);