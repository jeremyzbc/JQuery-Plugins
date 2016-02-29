
(function( $ ) {

	'use strict'; // jshint

	/*
	* Initiate the carousel navigations and append click handlers
	*/

	$.fn.carousel = function( options ) {

		var defaults = {
				carouselElements: '.js-carousel-item',
				fixedHeight: true,
				controlerPosition: 'bottom',
				controlerItemClass: 'carousel-nav--item',
				controlerItemActiveClass: 'carousel-nav--item-active',
				activeItemIndex: 0,
				autoPlay: true,
				delay: 5000
			},
			opts = $.extend(defaults, options),
			carouselElems,
			carouselLength,
			activeItemIndex,
			requestedItemNo,
			carouselRotatorInt,
			restartRotatorAfterClick,
			restartRotatorAfterHover,
			rotatorEffectDelay,
			i, $this;


		// general assignments
		$this = $(this);
		activeItemIndex = opts.activeItemIndex;
		rotatorEffectDelay = 500; // ms


		// init main functions
		setupCarousel();
		eventHandlers();


		/* **
		* Setup carousel items and navigation,
		*  start rotation,
		*  publish 'carouselSetupFinished'
		*/
		function setupCarousel() {

			var $carouselNav,
				navElems = [];

			// check whether a carousel selector is set or return
			if ( opts.carouselElements ) {

				carouselElems = $this.find(opts.carouselElements);
			} else {

				console.error('$carouselSetup: A carousel element has to be specified.');
				return;
			}

			// calculate the height of the carousel
			if ( opts.fixedHeight ) {
				setCarouselHeight();
			}

			// initially set active carousel items
			carouselElems
				.not(':eq(' + activeItemIndex + ')')
				.hide();

			// set position of carousel nav
			if ( opts.controlerPosition === 'top' ) {
				$this.prepend('<div class="carousel-nav-container carousel-nav-container-top"></div>');
			} else {
				$this.append('<div class="carousel-nav-container"></div>');
			}

			// add carousel nav item list
			$this
				.find('.carousel-nav-container')
				.append('<ul class="carousel-nav"></ul>');

			//get number of carousel items
			carouselLength = carouselElems.length;

			// create the carousel nav items/dots
			$carouselNav = $this.find('.carousel-nav');

			for ( i = carouselLength; i > 0; i-- ) {
				navElems[i] = '<li class="' + opts.controlerItemClass + '"></li>';
			}
			$carouselNav.html( navElems.join(''));

			// set active nav items
			$this.find('.' + opts.controlerItemClass + ':eq(' + activeItemIndex + ')').addClass(opts.controlerItemActiveClass);

			// In case we have more than one carousel clear any previous timer
			window.clearTimeout( window.ElasticDigital.template.timeoutCarouselSetup );

			// Start counter to publish event about the setup
			window.ElasticDigital.template.timeoutCarouselSetup = window.setTimeout( function() {
				//amplify.publish('carouselSetupFinished', $this);
			}, 100 );

			// start the rotation on page load
			if ( opts.autoPlay ) {
				carouselRotator();
			}
		}


		/* **
		* Calculate carousel height
		*/
		function setCarouselHeight() {

			window.ElasticDigital.template.utils.setEqualHeight( carouselElems );
		}


		/* **
		* Toggle opacity when items change
		* @currElem: currently active element
		* @nextElem: requested element
		*/
		function toggleEffectOpacity( currElem, nextElem ) {

			currElem.hide();

			nextElem
				.show()
				.animate({
					opacity: '1'
				});
		}


		/* **
		* Toggle opacity and height when items change
		* @currElem: currently active element
		* @nextElem: requested element
		*/
		function toggleEffectOpacityHeight( currElem, nextElem ) {

			// Save current elements height before hiding it
			var intiCurrHeight = currElem.outerHeight(),
				initNextHeight;

			// Hide current element
			currElem.hide();

			// Show requested element
			nextElem.show();

			// Get requested elment's height
			initNextHeight = nextElem.outerHeight();

			// Animate height and opacity
			nextElem
				.css('height', intiCurrHeight )
				.animate({
					opacity: '1',
					height: initNextHeight
				})
				.css('height', initNextHeight );
		}


		/* **
		* Store eventhandlers
		*/
		function eventHandlers() {

			// On window resize events
			$(window).resize( function() {

				// re-calculate the height of the carousel
				if ( opts.fixedHeight ) {
					setCarouselHeight();
				} else {
					carouselElems.css( 'height', '' );
				}
			});

			// Click event handler for 'dots'
			$this.find('.' + opts.controlerItemClass + '').on( 'click', function() {

				var $controller = $(this),

					// set the new item index
					requestedItemNo = $controller.index();

				// stop the auto play, clear the timeouts if set
				clearInterval(carouselRotatorInt);
				clearTimeout(restartRotatorAfterClick);
				clearTimeout(restartRotatorAfterHover);

				// and trigger the button
				carouselNavClick( $controller, requestedItemNo );

				if ( opts.autoPlay ) {
					restartRotatorAfterClick = setTimeout( carouselRotator, opts.delay );
				}
			});

			// Stop rotator on content hover
			carouselElems.hover(
				// mouseenter
				function () {

					// stop the auto play, clear the timeouts if set
					clearInterval(carouselRotatorInt);
					clearTimeout(restartRotatorAfterClick);
					clearTimeout(restartRotatorAfterHover);
				},
				// mouseleave
				function () {

					// restart the rotator after a short dealy
					if ( opts.autoPlay ) {
						restartRotatorAfterHover = setTimeout( carouselRotator, 0 );
					}
				}
			);
		}


		/* **
		* Automatically rotate between carousel elements
		*/
		function carouselRotator() {

			var rotatorDelay = opts.delay + rotatorEffectDelay;

			carouselRotatorInt = setInterval(
				function() {

					// get the index for the following item
					if ( activeItemIndex < ( carouselLength - 1 )) {
						requestedItemNo = activeItemIndex + 1;
					} else {
						requestedItemNo = 0;
					}

					carouselNavClick( $this.find('.' + opts.controlerItemClass + '').eq( requestedItemNo ), requestedItemNo );
				},
				rotatorDelay
			);
		}


		/* **
		* Change to requested item
		* @$navItem - carousel nav item triggered (jQuery obj)
		* @requestedItemNo - number in item sequence of requested item
		*/
		function carouselNavClick( $navItem, requestedItemNo ) {

			// update active 'dot'
			$this.find('.' + opts.controlerItemClass).removeClass(opts.controlerItemActiveClass);
			$navItem.addClass(opts.controlerItemActiveClass);

			// get the current item index
			activeItemIndex = activeItemIndex || activeListIndex( carouselElems );

			// hide current and show new item
			toggleCarouselElems( carouselElems, activeItemIndex, requestedItemNo );

			// set the current item index
			activeItemIndex = requestedItemNo;
		}


		/*
		* Get index of currently active carousel element
		* @carouselElements - elements as jQuery obj
		*/
		function activeListIndex( carouselElements ) {

			var listNo;

			carouselElements.each( function( index ) {

				if ( !$(this).is(':hidden') ) {
					listNo = index;
				}
			});

			return listNo;
		}


		/*
		* Toggle currently active and requested lists
		* @carouselElements - elements as jQuery obj
		* @activeNo - index of currently active ul element
		* @requestedNo - index of requested ul element
		*/
		function toggleCarouselElems( carouselElements, activeNo, requestedNo ) {

			// hide current and show new list
			carouselElements
				.eq( activeNo )
				.stop()
				.animate({
					opacity: '0'
				}, rotatorEffectDelay, function() {

					var $currElem = $(this),
						$newElem =  carouselElements.eq( requestedNo );

					// Show new elem and adjust height
					if ( !opts.fixedHeight ) {

						toggleEffectOpacityHeight( $currElem, $newElem );

					// Just show new elem, element heights are equal
					} else {

						toggleEffectOpacity( $currElem, $newElem );
					}
				});
		}
	};

})( window.jQuery );