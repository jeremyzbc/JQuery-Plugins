
(function( $ ) {

	'use strict';

	$.fn.accordion = function( options ) {

		var defaults = {
				initOpen: true,
				initOpenNumber: 1,
				triggerEvent: 'click',
				triggerElements: '.accordion-header',
				triggerActiveClass: 'accordion-header-active',
				contentElements: '.accordion-content',
				activeClass: 'accordion-content-active',
				iconClassOpen: 'icon-arrow-up',
				iconClassClosed: 'icon-arrow-down',
				hideOnEvent: true,
				slideUpSpeed: 300,
				slideDownSpeed: 300,
				slideUpComplete: function() {},
				slideDownComplete: function() {},
				complete: function() {}
			},
			opts = $.extend( defaults, options ),
			allHeaders,
			allPanels,
			accordion = $(this);

		allPanels = accordion.children( opts.contentElements );
		allHeaders = accordion.children( opts.triggerElements );

		// iterate over all panels to see which one to hide on page load
		allPanels.each( function( elemIndex ) {

			var activePanel,
				activePanelIndex,
				intRegex = /^\d+$/;

			// check if we get a number or fallback to the default
			activePanel = intRegex.test(parseFloat(opts.initOpenNumber)) ? parseFloat(opts.initOpenNumber) : defaults.initOpenNumber;

			activePanelIndex = opts.initOpenNumber - 1;

			if ( !opts.initOpen || ( opts.initOpen && elemIndex !== activePanelIndex )) {

				$(this)
					.hide()
					.prev()
					.prepend( '<span class="' + opts.iconClassClosed + ' js-icon-closed"></span><span class="hide-text">close</span>' );
			} else {

				// add the 'active' state classnames to the active header and content
				$(this)
					.addClass( opts.activeClass )
					.prev()
					.addClass( opts.triggerActiveClass )
					.prepend( '<span class="' + opts.iconClassOpen + ' js-icon-open"></span><span class="hide-text">open</span>' );
			}

			if ( elemIndex === ( allPanels.length - 1 )) {

			}
		});

		// start event when triggered on trigger element
		allHeaders
			.on( opts.triggerEvent, function( evt ) {

				var header = $(this),
					contentElem = header.next();

				evt.preventDefault();

				// if the triggered element is not currently active
				if ( !contentElem.hasClass( opts.activeClass )) {

					// hide all content panels
					allPanels
						.each( function() {

							var $panel = $(this);

							if ( $panel.hasClass( opts.activeClass )) {

								$panel.slideUp( opts.slideUpSpeed, function() {

									// remove the active class names
									$panel
										.removeClass( opts.activeClass )
										.prev()
										.removeClass( opts.triggerActiveClass )
										.find( '.' + opts.iconClassOpen )
										.removeClass( opts.iconClassOpen + ' js-icon-open' )
										.addClass( opts.iconClassClosed + ' js-icon-closed' );

									if ( typeof opts.slideUpComplete === 'function' ) {
										opts.slideUpComplete();
									}
								});
							}
						});

					// add the active class for the header
					header
						.addClass( opts.triggerActiveClass )
						.find( '.' + opts.iconClassClosed )
						.removeClass( opts.iconClassClosed + ' js-icon-closed' )
						.addClass( opts.iconClassOpen + ' js-icon-open' );

					// show the content and add the active class
					contentElem
						.slideDown( opts.slideDownSpeed, opts.slideDownComplete )
						.addClass( opts.activeClass );

				// if the triggered element is currently active
				// and hideOnEvent is set to true
				} else if ( opts.hideOnEvent ) {

					contentElem.slideUp( opts.slideUpSpeed, function() {

						header
							.removeClass( opts.triggerActiveClass )
							.find( '.' + opts.iconClassOpen )
							.removeClass( opts.iconClassOpen + ' js-icon-open' )
							.addClass( opts.iconClassClosed + ' js-icon-closed' );

						contentElem.removeClass( opts.activeClass );

						if ( typeof opts.slideUpComplete === 'function' ) {
							opts.slideUpComplete();
						}
					});
				}
			});

		// run the callback
		opts.complete.call( this );

		// ensure method calls can be chained
		// http://www.sitepoint.com/10-tips-better-jquery-plugins/
		return this;
	};

})( window.jQuery);