+function ($) {
	var Lib = {
		bind: function (elm, options) {
			var progress = elm.find('.progress').first();

			if (progress.length) {
				var bar = new Lib.ProgressBar(progress);
				elm
					.on('progress-updated', bar, Lib.onProgressUpdated)
					.on('progress-reset', bar, Lib.onProgressReset)
				;
			}
		},

		onProgressUpdated: function (event) {
			event.preventDefault();
			event.stopPropagation();

			var percent = Math.ceil(100 * event.progress / event.total);

			percent = Math.min(percent, 100);
			percent = Math.max(percent, 0);

			event.data.set(percent);
		},

		onProgressReset: function (event) {
			event.preventDefault();
			event.stopPropagation();

			event.data.set(0);
			event.data.hide();
		},

		setProgressPercent: function (elm, percent) {
			elm
				.css('width', percent + '%')
				.attr('aria-valuenow', percent)
			;
		},

		ProgressBar: new Class({
			__construct: function (elm) {
				this.elm = elm;
				this.bar = elm.find('.progress-bar');
				this.value = 0;
				this.visible = false;

				var that = this;
				this._reset = function () {
					that.set(0);
				};
			},
			set: function (percent) {
				if (percent !== this.value) {
					this.bar
						.css('width', percent + '%')
						.attr('aria-valuenow', percent)
					;

					this.value = percent;

					if (percent === 100) {
						this.fade();
					} else if (percent && !this.visible) {
						this.show();
					}
				}
			},
			show: function () {
				this.elm
					.removeClass('hidden')
					.show()
				;
				this.visible = true;
			},
			hide: function () {
				this.elm.hide();
				this.visible = false;
			},
			fade: function () {
				var that = this;
				this.elm.hide('slow', this._reset);
				this.visible = false
			}
		})
	};

	$.behaviour.add('progress-receiver', Lib);

}(jQuery);