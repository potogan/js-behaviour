+function ($) {
	var Lib = {
		bind: function (elm) {
			elm.on('click', Lib.onClickHandler);
		},
		onClickHandler: function (event) {
			event.preventDefault();
			event.stopPropagation();
			
			$(this).trigger('close-tile');
		}
	};

	$.behaviour.add('tile-closer', Lib);

}(jQuery);