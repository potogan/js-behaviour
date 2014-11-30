+function ($) {
	var Lib = new Class(AbstractBinderClass, {
		__construct: function (elm) {
			this.elm = elm;

			this.tiles = elm.children().filter(function () {
				var position = $(this).css('position');

				return position === 'static' || position === 'relative';
			});
			this.displayedTiles = [this.tiles.first()];

			this.namedTiles = {};

			for (var i = this.tiles.length - 1; i >= 0; i--) {
				var tile = $(this.tiles[i]),
					name = tile.attr('tile-name')
				;

				if (name) {
					this.namedTiles[name] = tile;
				}

				this.bindTile(tile);
			};

			this.tiles.addClass('x-tile');

			this.elm.addClass('x-tile-container');

			this.bind(this.elm, 'ajax-success', 'onAjaxSuccess');
			this.bind(
				this.elm,
				'tile-show tile-shown tile-hide tile-hidden tile-close tile-closed'
					+ 'tile-refresh tile-refreshed tile-loaded close-tile tile-show-or-load'
					+ 'tile-restore tile-restored'
					+ 'tile-remove tile-removed tile-content-update'
				,
				'stopEventPropagation'
			);

			this.bind(this.elm, 'tile-show-or-load', 'onTileShowOrLoadEvent');
		},

		/**
		 * Get the tile from given input
		 *
		 * @param mixed tile = string form named tile, integer for index, or object for tile element
		 *
		 * @return integer
		 */
		getTileFromParameter: function (input) {
			if (typeof input === 'string' && this.namedTiles[input]) {
				input = this.namedTiles[input];
			}

			if (typeof input === 'number') {
				input = $(this.tiles[input]);
			}

			return input;
		},

		/**
		 * Show the specified tile
		 *
		 * @param mixed tile = @see getTileFromParameter 
		 *
		 * @event tile-show (blocking if prevented)
		 * @event tile-shown
		 * @event tile-hide (blocking if prevented)
		 * @event tile-hidden
		 *
		 * @return boolean = true if success
		 */
		showTile: function (tile) {
			var tile = this.getTileFromParameter(tile),
				displayedTile = this.displayedTiles[this.displayedTiles.length - 1],
				e
			;

			if (displayedTile[0] === tile[0]) {
				return ;
			}

			e = this.triggerTileEvent(displayedTile, 'tile-hide');

			if (!e.isDefaultPrevented()) {
				e = this.triggerTileEvent(tile, 'tile-show');
			}

			if (!e.isDefaultPrevented()) {
				this.hideTileAnimation(displayedTile);

				tile
					.insertAfter(displayedTile)
				;

				this.showTileAnimation(tile);

				this.displayedTiles.push(tile);

				this.triggerTileEvent(displayedTile, 'tile-hidden');
				this.triggerTileEvent(tile, 'tile-shown');
			}

			return !e.isDefaultPrevented();
		},

		/**
		 * Hides and remove the currently displayed tile, and show previous
		 *
		 * @event tile-close (blocking if prevented)
		 * @event tile-closed
		 * @event tile-restore (blocking if prevented)
		 * @event tile-restored
		 *
		 * @see removeTile
		 *
		 * @return boolean = true if success
		 */
		closeCurrentTile: function () {
			var tile = this.displayedTiles[this.displayedTiles.length - 1],
				previousTile = null,
				e
			;

			if (this.displayedTiles.length == 1) {
				return;
			}

			previousTile = this.displayedTiles[this.displayedTiles.length - 2];

			e = this.triggerTileEvent(tile, 'tile-close', {
				previousTile: previousTile
			});

			if (!e.isDefaultPrevented()) {
				e = this.triggerTileEvent(previousTile, 'tile-restore');
			}

			if (!e.isDefaultPrevented()) {
				this.displayedTiles.pop();
				this.closeTileAnimation(tile);
				this.restoreTileAnimation(previousTile);

				this.triggerTileEvent(tile, 'tile-closed');
				this.triggerTileEvent(previousTile, 'tile-restored');

				this.removeTile(tile);
			}

			return !e.isDefaultPrevented();
		},

		hideTileAnimation: function (tile, immediate) {
			var infos = tile.data('tile-informations');

			if (infos.hidden || infos.closed) {
				return;
			}

			this.calculateTileDimensions(tile);

			infos.hidden = true;

			if (immediate) {
				tile.hide().css({
					marginTop: '-' + (infos.initialHeight + 1) + 'px'
				});
			} else {
				tile
					.animate({
						marginTop: '-' + (infos.initialHeight + 1) + 'px'
					}, function () {
						tile.hide();
					})
				;
			}
		},

		closeTileAnimation: function (tile, immediate) {
			var infos = tile.data('tile-informations');

			if (infos.closed) {
				return ;
			}

			infos.closed = true;

			if (infos.hidden) {
				// already hidden
			} else if (immediate) {
				tile.hide();
			} else {
				tile.animate({opacity: 0}, function () {
					tile.hide();
				});
			}
		},

		showTileAnimation: function (tile, immediate) {
			var infos = tile.data('tile-informations');
			
			if (immediate) {
				tile.show().css({
					opacity: 1,
					marginTop: infos.initialMargin + 'px'
				});
			} else {
				tile.show().css({opacity: 0, marginTop: infos.initialMargin + 'px'});
				tile.animate({opacity: 1});
			}

			infos.closed = false;
			infos.hidden = false;
		},

		restoreTileAnimation: function (tile, immediate) {
			var infos = tile.data('tile-informations');

			this.calculateTileDimensions(tile);
			
			if (immediate) {
				tile.show().css({
					opacity: 1,
					marginTop: infos.initialMargin + 'px'
				});
			} else {
				tile.show().css({opacity: 1, marginTop: '-' + (infos.initialHeight + 1) + 'px'});
				tile.animate({marginTop: infos.initialMargin + 'px'});
			}

			infos.closed = false;
			infos.hidden = false;
		},

		/**
		 * Removes the given tile
		 *
		 * @param mixed tile = @see getTileFromParameter 
		 *
		 * @event tile-remove (blocking if prevented)
		 * @event tile-removed
		 *
		 * @return boolean = true if success
		 */
		removeTile: function (tile, immediate) {
			var tile = this.getTileFromParameter(tile),
				name = tile.attr('tile-name'),
				e
			;

			e = this.triggerTileEvent(tile, 'tile-remove');

			if (!e.isDefaultPrevented()) {
				// dereferencing tile name
				if (name) {
					delete this.namedTiles[name];
				}

				this.triggerTileEvent(tile, 'tile-removed');

				if (immediate) {
					tile.remove();
				} else {
					tile.queue(function () {
						tile.remove();
						$(this).dequeue();
					});
				}

				this.tiles = this.tiles.not(tile);
			}

			return !e.isDefaultPrevented();
		},

		/**
		 * Shows a named tile if already exist, or load it throught an ajax query
		 *
		 * @param string name = tile name
		 * @param object parameters = ajax query parameters
		 *
		 * @see showTile
		 * @see loadTile
		 *
		 * @return boolean|undefined = undefined if ajax query was sent, true if success, false if
		 *    blocked by event
		 */
		showNamedTileOrLoadIt: function (name, parameters) {
			if (this.namedTiles[name]) {
				this.showTile(this.namedTiles[name]);
			} else {
				$.behaviour.list['ajax'].elementEventHandlerQuery(this.elm, null, parameters);
			}
		},

		/**
		 * Shows a named tile if already exist, or load it throught an ajax query
		 *
		 * @param string name = tile name
		 * @param object parameters = ajax query parameters
		 *
		 * @event tile-refresh (blocking if prevented)
		 * @event tile-refreshed
		 * @event tile-loaded
		 *
		 * @return jQuery = loaded tile
		 */
		loadTile: function (content, name) {
			var tile,
				that = this,
				e
			;

			if (name && this.namedTiles[name]) {
				tile = this.namedTiles[name];

				var displayed = tile === this.displayedTiles[this.displayedTiles.length - 1];

				e = this.triggerTileEvent(tile, 'tile-refresh', {
					displayed: displayed
				});

				if (!e.isDefaultPrevented()) {
					if (displayed) {
						tile.animate(
							{opacity: 0},
							{
								done: function () {
									tile.hide().empty().html(content).show();
									that.bindNewTileContent(tile);
								}
							}
						).animate({opacity: 1});
					} else {
						tile.hide().empty().html(content).show();
						this.bindNewTileContent(tile);
					}

					this.triggerTileEvent(tile, 'tile-refreshed', {
						displayed: displayed
					});
				}
			} else {
				tile = $('<div class="x-tile"></div>');
				this.bindTile(tile);

				this.elm.append(tile);
				this.tiles = this.tiles.add(tile);

				tile.hide().html(content).show();
				this.bindNewTileContent(tile);

				if (name) {
					this.namedTiles[name] = tile;
					tile.attr('tile-name', name);
				}

				this.triggerTileEvent(tile, 'tile-loaded');
			}

			return tile;
		},

		bindTile: function (tile) {
			tile.data('tile-informations', {
				initialHeight: null,
				initialMargin: null,
				hidden: false,
				closed: false
			});

			this.calculateTileDimensions(tile);

			this.bind(tile, 'close-tile', 'onTileCloseEvent');
			this.bind(tile, 'tile-content-update', 'onTileContentUpdate')
		},
		calculateTileDimensions: function (tile) {
			var infos = tile.data('tile-informations'),
				initialPadding = parseInt(tile.css('padding-bottom'))
			;

			if (infos.hidden || infos.closed) {
				tile.css({
					marginTop: infos.initialMargin + 'px'
				});
			}

			
			infos.initialMargin = parseInt(tile.css('margin-top'));

			if (!initialPadding) {
				tile.css('padding-bottom', '1px');
			}

			infos.initialHeight = tile.outerHeight()

			if (!initialPadding) {
				tile.css({'padding-bottom': null});
				infos.initialHeight--;
			}
			
			infos.initialHeight--;
		},
		bindNewTileContent: function (tile) {
			for (var i = 0; i < Lib.callbacks.length; i++) {
				Lib.callbacks[i](tile);
			};			
		},

		onAjaxSuccess: function (event) {
			if (event.parsedResponse && event.parsedResponse.tile) {
				var tile = this.loadTile(event.parsedResponse.tile, event.parsedResponse.tileName);

				if (tile) {
					this.showTile(tile);
				}
			}
		},

		onTileShowOrLoadEvent: function (event) {
			if (!event.isDefaultPrevented()) {
				event.preventDefault();

				this.showNamedTileOrLoadIt(event.name, event.parameters);
			}
		},

		onTileContentUpdate: function (event) {
			var tile = $(event.target),
				infos = tile.data('tile-informations')
			;

			this.calculateTileDimensions(tile);

			tile.css({
				marginTop: '-' + (infos.initialHeight + 1) + 'px'
			});
		},

		onTileCloseEvent: function (event) {
			if (!event.isDefaultPrevented()) {
				event.preventDefault();

				this.closeCurrentTile();
			}
		},

		stopEventPropagation: function (event) {
			event.stopPropagation();
		},

		triggerTileEvent: function (tile, name, props) {
			props = props || {};
			props.tile = tile;
			props.name = tile.attr('tile-name');

			var event = $.Event(name, props);

			tile.trigger(event);

			return event;
		}
	}).addStatics({
		callbacks: [],
		bind: function (elm) {
			new this(elm);
		}
	});

	$.behaviour.add('tile-container', Lib);

}(jQuery);