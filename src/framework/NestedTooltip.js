
	NestedTooltip = function(dispatcher, parentTooltip, activeStatusChanged, onHiding, onContentChanged) {
		this.parentTooltip = parentTooltip||null;
		this.childTooltip  = null;
		this.zindex        = (parentTooltip !== null ? parentTooltip.zindex +1 : 9999);
		this.dispatcher   = dispatcher||null;
		
		if (parentTooltip !== null) {
			if (parentTooltip.childTooltip !== null)
				parentTooltip.childTooltip.hideNow();
			parentTooltip.childTooltip = this;
		}
		
		var self                  = this;
		var tooltip               = null;
		var timeout               = 0;
		var isMouseOverTooltip    = false;
		var isMouseOverDispatcher = false;
		this.hidden                = false;

		var onHiding              = onHiding;
		var onContentChanged      = onContentChanged;
		var activeStatusChanged   = activeStatusChanged;

		this.isActive = function() {
			return (isMouseOverTooltip || isMouseOverDispatcher) && !this.hidden;/*&& !this.isHidding()*/;
		}

		this.setContent = function(content) {
			tooltip.innerHTML = content;
		}

		this.isHidding = function() {
			return timeout !== 0;
		}
		
		this.stopHiding = function() {
			clearTimeout(timeout);
			if (this.parentTooltip !== null)
				this.parentTooltip.stopHiding();
		}
		
		this.showTooltip = function(content) {
			this.stopHiding();
			if (tooltip === null) {
				registerTooltip();
				registerEvents();
				isMouseOverDispatcher = true;
				isMouseOverTooltip    = false;
			}
			jQuery(tooltip).css('display', 'none');
			jQuery(tooltip).css('z-index', this.zindex);
			jQuery(tooltip).html( content );
			jQuery(".p-tooltip-image,.db-image").css('display', 'none');
			calculateTooltipPosition();
			jQuery(tooltip).css('display', 'inline');
			this.hidden = false;
			onContentChanged(self, tooltip);
		}
		
		this.hideIn = function(milisec) {
			clearTimeout(timeout);
			timeout = setTimeout(function() {self.hideNow();}, milisec);
		}
		
		this.hideNow = function() {
			clearTimeout(timeout);
			hideChild();
			unregisterEvents();
			unregisterTooltip();
			this.hidden = true;
			onHiding(this);
			if (this.parentTooltip !== null)
				this.parentTooltip.childTooltip = null;
			this.parentTooltip = null;
		}
		
		var hideChild = function() {
			if (self.childTooltip !== null)
				self.childTooltip.hideNow();
		}
		
		var registerTooltip = function() {
			if (tooltip !== null)	
				return;
			tooltip = document.createElement('div');
			jQuery(tooltip).css('display', 'none').addClass('db-tooltip-container');
			document.getElementsByTagName("body")[0].appendChild(tooltip);
		}
		
		var unregisterTooltip = function() {
			if (tooltip === null)	
				return;
			document.getElementsByTagName("body")[0].removeChild(tooltip);
			tooltip = null;
		}
		
		var registerEvents = function() {
			jQuery(self.dispatcher).mouseenter(onDispatcherMouseOver);
			jQuery(self.dispatcher).mouseleave(onDispatcherMouseOut);
			jQuery(tooltip).mouseenter(onTooltipMouseOver);
			jQuery(tooltip).mouseleave(onTooltipMouseOut);
		}
		
		var unregisterEvents = function() {
			jQuery(self.dispatcher).unbind('mouseenter', onDispatcherMouseOver);
			jQuery(self.dispatcher).unbind('mouseleave', onDispatcherMouseOut);
			jQuery(tooltip).unbind('mouseenter', onTooltipMouseOver);
			jQuery(tooltip).unbind('mouseleave', onTooltipMouseOut);
		}
		
		var calculateTooltipPosition = function() {
			var newTop, newLeft;

			newTop = Math.max(1, jQuery(self.dispatcher).offset().top +jQuery(self.dispatcher).height() -3);
			if (newTop > jQuery(window).height() +jQuery(window).scrollTop() -jQuery(tooltip).outerHeight() -5)
				newTop = jQuery(self.dispatcher).offset().top +jQuery(self.dispatcher).height() -computeHeightOf(self.dispatcher) -jQuery(tooltip).outerHeight() -5;
				
			newLeft = jQuery(self.dispatcher).offset().left;
			if (newLeft > jQuery(window).width() +jQuery(window).scrollLeft() -367)
				newLeft =  jQuery(self.dispatcher).offset().left +jQuery(self.dispatcher).outerWidth() -367;

			jQuery(tooltip).css("top", newTop +"px");
			jQuery(tooltip).css("left", newLeft +"px");
		}
		
		var computeHeightOf = function(element) {
			var result = jQuery(element).height();
			jQuery(element).children().each(function() {
				result = Math.max(result, computeHeightOf(this));
			});
			return result;
		}

		var onDispatcherMouseOver = function() {
			isMouseOverDispatcher = true;
			self.stopHiding();
			activeStatusChanged(self);
		}

		var onDispatcherMouseOut = function() {
			isMouseOverDispatcher = false;
			self.hideIn(150);
			activeStatusChanged(self);
		}

		var onTooltipMouseOver = function() {
			isMouseOverTooltip = true;
			self.stopHiding();
			activeStatusChanged(self);
		}

		var onTooltipMouseOut = function() {
			isMouseOverTooltip = false;
			self.hideIn(150);
			activeStatusChanged(self);
		}
	}