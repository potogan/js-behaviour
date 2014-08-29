(function ($) {
	var Reset = {
		bind: function (elm) {
			elm.on('click', Reset.resetForm);
		},
		resetForm: function (event) {
			var elm = $(this), params = {};
			
			event.preventDefault();
			
			var $form = elm.closest('form');
			console.dir($form);
			
			$form.find('input[type=text],textarea').val('');
			$form.find('select').prop('selectedIndex',0);
			$form.trigger('submit');
		}};
		
	$.behaviour.add('reset', Reset);
})(jQuery);