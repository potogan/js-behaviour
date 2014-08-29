(function ($) {
	var Ajax = {
		bind: function (elm) {
			var name = 'click';

			if (elm.is('form')) {
				name = 'submit';


				elm.find('.x-ajax-register-name').on(
					'click',
					elm,
					Ajax.registerClickedButton
				);
			}
			
			elm.on(name, Ajax.genericEventHandler);
		},
		genericEventHandler: function (event) {
			var elm = $(this), params = {};

			if (this.nodeName == 'A') {
				params.url = this.href;
			} else if (this.nodeName == 'FORM') {
				params.url = this.action;
				params.method = this.method.toUpperCase();

				var clicked = elm.data('clicked-button');

				if (clicked && clicked.hasClass('x-ajax-disable')) {
					return ;
				} else if (elm.find('input[type="file"]').length) {
					if(window.FormData !== undefined){
						params.processData = false;
						params.contentType = false;
						params.data = new FormData(this);

						if (clicked) {
							params.data.append(clicked.prop('name'), clicked.val());
						}
					} else {
						return ;
					}
				} else {
					params.data = elm.serialize();

					if (clicked) {
						params.data[clicked.prop('name')] = clicked.val();
					}
				}
			} else {
				return ;
			}

			Ajax.elementEventHandlerQuery(elm, event, params);
		},
		elementEventHandlerQuery: function (elm, event, params) {
			var res;

			if (event && event.isDefaultPrevented()) {
				// event already blocked
			} else if (elm.hasClass('x-ajax-pending')) {
				// already loading -> don't resubmit
			} else {
				elm.addClass('x-ajax-pending')
					.removeClass('x-ajax-error')
					.removeClass('x-ajax-success')
				;

				params = $.extend({
					success: function(response, textStatus, jqXHR) {
						elm.removeClass('x-ajax-pending')
							.addClass('x-ajax-success')
						;

						elm.trigger($.Event('ajax-success', {
							data: event ? event.data : null,
							response: response,
							parsedResponse: Ajax.parseResponse(response),
							textStatus: textStatus,
							jqXHR: jqXHR,
							params: params,
							originator: elm
						}));
					},
					error: function (jqXHR, textStatus, errorThrown) {
						elm.removeClass('x-ajax-pending')
							.addClass('x-ajax-error')
						;

						elm.trigger($.Event('ajax-error', {
							data: event ? event.data : null,
							errorThrown: errorThrown,
							textStatus: textStatus,
							jqXHR: jqXHR,
							params: params,
							originator: elm
						}));
					}
				}, params);

				res = $.ajax(params);


				elm.trigger($.Event('ajax-pending', {
					data: event ? event.data : null,
					params: params
				}));

			}

			if (event) {
				event.preventDefault();
			}

			return res;
		},

		registerClickedButton: function (event) {
			event.data.data('clicked-button', $(this));
		},

		parseResponse: function (response) {
			var parsed;

			if (typeof response == 'string' && response.substr(0,1) === '{') {
				parsed = JSON.parse(response);
			}

			if (typeof response == 'string' && !parsed) {
				parsed = {content: response};
			}

			return parsed;
		}
	};

	$.behaviour.add('ajax', Ajax);
})(jQuery);