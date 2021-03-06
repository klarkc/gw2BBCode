
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
		
		var self                   = this;
		var tooltip                = null;
		var timeout                = 0;
		var isCursorOverTooltip    = false;
		var isCursorOverDispatcher = false;
		this.hidden                = false;

		var onHiding              = onHiding;
		var onContentChanged      = onContentChanged;
		var activeStatusChanged   = activeStatusChanged;

		this.isActive = function() {
			return (isCursorOverTooltip || isCursorOverDispatcher) && !this.hidden;/*&& !this.isHidding()*/;
		}
		
		this.setActive = function(mouseX, mouseY) {
			var activeElement      = document.elementFromPoint(mouseX, mouseY);
			isCursorOverTooltip    = isCursorOverElement(activeElement, tooltip);
			isCursorOverDispatcher = isCursorOverElement(activeElement, this.dispatcher);
		}
		
		var isCursorOverElement = function(activeElement, element) {
			if (activeElement === element)
				return true;
			for (var i = 0; i < element.childNodes.length; i++) {
				if (isCursorOverElement(activeElement, element.childNodes[i]))
					return true;
			}
			return false;
		}

		this.setContent = function(content) {
			tooltip.innerHTML = content;
		}

		this.isHidding = function() {
			return timeout !== 0;
		}

		this.stopHiding = function() {
			clearTimeout(timeout);
			timeout = 0;
			if (this.parentTooltip !== null)
				this.parentTooltip.stopHiding();
		}
		
		this.showTooltip = function(content) {
			this.stopHiding();
			if (tooltip === null) {
				registerTooltip();
				registerEvents();
				isCursorOverDispatcher = true;
				isCursorOverTooltip    = false;
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
			timeout = 0;
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
			jQuery(tooltip).click(onTooltipClick);
			jQuery(self.dispatcher).click(onDispatcherClick);
		}
		
		var unregisterEvents = function() {
			jQuery(self.dispatcher).unbind('mouseenter', onDispatcherMouseOver);
			jQuery(self.dispatcher).unbind('mouseleave', onDispatcherMouseOut);
			jQuery(self.dispatcher).unbind('click', onDispatcherClick);
			jQuery(tooltip).unbind('mouseenter', onTooltipMouseOver);
			jQuery(tooltip).unbind('mouseleave', onTooltipMouseOut);
			jQuery(tooltip).unbind('click', onTooltipClick);
		}
		
		var calculateTooltipPosition = function() {
			var newTop, newLeft, node, jQNode, 
			    jQWin = jQuery(window),
				jQTooltip = jQuery(tooltip);
			
			node = self.dispatcher.childNodes[0]; // <img...
			if ((node||null) === null || node.nodeType === 3)
				node = self.dispatcher; // <A...
			jQNode = jQuery(node);

			newTop = Math.max(1, jQNode.offset().top +jQNode.height() +1);
			if (newTop > jQWin.height() +jQWin.scrollTop() -jQTooltip.outerHeight() -1)
				newTop = jQNode.offset().top +jQNode.height() -computeHeightOf(node) -jQTooltip.outerHeight() -1;
				
			newLeft = jQNode.offset().left;
			if (newLeft > jQWin.width() +jQWin.scrollLeft() -367)
				newLeft =  jQNode.offset().left +jQNode.outerWidth() -367;

			jQTooltip.css("top", newTop +"px");
			jQTooltip.css("left", newLeft +"px");
		}
		
		var computeHeightOf = function(element) {
			var result = jQuery(element).height();
			jQuery(element).children().each(function() {
				result = Math.max(result, computeHeightOf(this));
			});
			return result;
		}

		var onDispatcherMouseOver = function() {
			isCursorOverDispatcher = true;
			self.stopHiding();
			activeStatusChanged(self);
		}

		var onDispatcherMouseOut = function() {
			isCursorOverDispatcher = false;
			self.hideIn(150);
			activeStatusChanged(self);
		}

		var onTooltipMouseOver = function() {
			isCursorOverTooltip = true;
			self.stopHiding();
			activeStatusChanged(self);
		}

		var onTooltipMouseOut = function() {
			isCursorOverTooltip = false;
			self.hideIn(150);
			activeStatusChanged(self);
		}
		
		var onTooltipClick = function() {
			isCursorOverTooltip = true;
			if (self.isHidding())
				self.stopHiding();
		}
		
		var onDispatcherClick = function() {
			isCursorOverDispatcher = true;
			if (self.isHidding())
				self.stopHiding();
		}
		
		
	}