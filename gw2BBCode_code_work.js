(function() {

	var img_host        = "https://s3-eu-west-1.amazonaws.com/amber.gengo.pl/gw2_images";
	//var img_host        = "../dist/gw2_images";
	var gw2DB_Url       = "http://www.gw2db.com";
	var wiki_Url        = "http://wiki.guildwars2.com/wiki";
	var gw2DB_PopupHost = "http://www.gw2db.com/{0}/{1}/tooltip?x&advanced=1&callback=?";
	var popup_style     = "http://static-ascalon.cursecdn.com/current/skins/Ascalon/css/tooltip.css";
	//var popup_style     = "https://s3-eu-west-1.amazonaws.com/amber.gengo.pl/tooltip.css";
	
	function init() {
		$(includeTo.join(',')).addClass('gw2BBCode');
		initElements();
		addPopup2Gw2DBLinks();
		loadStyle(popup_style);
		gw2BBCode();
		initPopups();
	}	
	
	/*
	 *  Utilities
	 *
	 */
	
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};	
	
	function loadLib(libUrl) {
		var fileRef=document.createElement('script');
		fileRef.setAttribute("type","text/javascript");
		fileRef.setAttribute("src", libUrl);
		document.getElementsByTagName('head')[0].appendChild(fileRef);
	}
	
	function loadStyle(libUrl) {
		var link = document.createElement('link');
		link.rel  = 'stylesheet';
		link.type = 'text/css';
		link.href = libUrl;
		link.media = 'all';
		document.getElementsByTagName('head')[0].appendChild(link);
	}
	
	function addEvent(obj, evType, fn){ 
		if (obj.addEventListener){ 
			obj.addEventListener(evType, fn, false); 
		} else if (obj.attachEvent)
			r = obj.attachEvent("on"+evType, fn); 
	}
	
	function addPopup2Gw2DBLinks() {
		$(".gw2BBCode a").each(function() {
			if (this.host == 'www.gw2db.com') {
				var myRegexp = /http:\/\/www.gw2db.com\/(\w+)\/(\d+)-/g;
				var match = myRegexp.exec(this.href);
				if (match != null)
					$(this).addClass("gw2DBTooltip gw2DB{0}_{1}".format(match[1], match[2]));
			}
		});
	}
	
	function initElements() {
		for (var i = 0; i < gw2Elements.length; i++) {
			gw2Elements[i].type = element_type[gw2Elements[i].t];
		}
	}
	
	/*
	 *
	 *  Gw2BBCode 
	 *
	 */
	
	function gw2BBCode() {
		processExclusion(/\[/g, '{#}');
		try {
			$(".gw2BBCode").each(function() {
				processMacros(this);
				processGw2BBCode(this);
			});
		} finally {
			processExclusion(/\{#\}/g, '[');
		}
	}
	
	function processMacros(obj) {
		var myRegexp = /\[(@?)(.*?)(\.\d+)?\]/g;
		var match = myRegexp.exec(obj.innerHTML);
		while (match != null) {
			var newContent = getNewContentForMacro(match[2], match[1], (match[3] || "1").replace(".", ""));
			if (newContent != '') {
				obj.innerHTML = obj.innerHTML.replace(match[0], newContent);
			}
			match = myRegexp.exec(obj.innerHTML);
		}
	}
	
	function processGw2BBCode(obj) {
		var myRegexp = /\[(@?)(skill:|trait:|boon:|condition:)?(.*?)(\.\d+)?\]/g;
		var match = myRegexp.exec(obj.innerHTML);
		while (match != null) {
			var newContent = getNewContentFor(match[3], match[1], 
				(match[2] ? match[2].replace(":", "") + 's':match[2]), 
				(match[4] || "1").replace(".", ""));
			if (newContent != '')
				obj.innerHTML = obj.innerHTML.replace(match[0], newContent);
			match = myRegexp.exec(obj.innerHTML);
		}
	}
	
	function processExclusion(a, b) {
		$((".gw2BBCode {0}".format(excludeFrom.join(',')))).each(function() {
			this.innerHTML = this.innerHTML.replace(a, b);
		});
	}
	
	function getNewContentFor(gw2ElementName, showAsTest, forceType, forceIdx) {
		var gw2Element = findGw2ElementByName(gw2Elements, gw2ElementName, forceType, forceIdx);
		if (gw2Element == null) return "";
		return newContentForGw2Element(gw2Element, showAsTest);
	}
	
	function newContentForGw2Element(gw2Element, showAsTest) {
		if (showAsTest)
			return ("<a href='{0}' class='gw2DBTooltip gw2DB{1}_{2}'>{3}</a>")
				.format(getDescriptionUrl(gw2Element), gw2Element.type, gw2Element.id, gw2Element.n);
		else
			return ("<a href='{0}' class='gw2DBTooltip gw2DB{1}_{2}'><img src='{3}'></a>")
				.format(getDescriptionUrl(gw2Element), gw2Element.type, gw2Element.id, getImageUrl(gw2Element));
	}
	
	function getDescriptionUrl(gw2Element) {
		if (showOnClick == show_gw2Wiki)
			return "{0}/{1}".format(wiki_Url, get_wikiElement_name(gw2Element.n));
		else if (showOnClick == show_gw2DB || true)
			return "{0}/{1}/{2}-{3}"
				.format(gw2DB_Url, gw2Element.type, gw2Element.id, get_gw2DBElement_name(gw2Element.n));
	}
	
	function getImageUrl(gw2Element) {
		return "{0}/{1}/{2}.png".format(img_host, gw2Element.type, gw2Element.id);
	}
	
	function get_gw2DBElement_name(gw2ElementName) {
		return gw2ElementName.toLowerCase().replace(' ', '-').replace(/['"!]/g, "");
	}
	
	function get_wikiElement_name(gw2ElementName) {
		return gw2ElementName.replace(' ', '_').replace(/['"!]/g, "");
	}
	
	function getNewContentForMacro(macroName, showAsTest, forceIdx) {
		var macro = findGw2ElementByName(macros, macroName, '', forceIdx);
		if (macro == null) return "";
		result = "";
		for (var i = 0; i < macro.m.length; i++) {
			var gw2Element = findGw2ElementById(gw2Elements, macro.m[i]);
			result += (i != 0 && showAsTest ? " " : "");
			if (gw2Element)
				result += newContentForGw2Element(gw2Element, showAsTest);
			else
				result += "[macro:"+macro.m[i]+"]";
		}
		return result;
	}

	function findGw2ElementById(array, gw2ElementId) {
		for (var i = 0; i < array.length; i++)
			if (array[i].id == gw2ElementId)
				return array[i];
		return null;
	}
	
	function findGw2ElementByName(array, gw2ElementName, forceType, forceIdx) {
		forceIdx = forceIdx || 1;
		for (var i = 0; i < array.length; i++)
			if (array[i].n.toLowerCase().indexOf(gw2ElementName.toLowerCase()) == 0 && 
			   ((forceType || "") == "" || array[i].type == forceType) &&
			   (forceIdx-- <= 1))
				return array[i];
		return null;
	}
	
	/*
	 *
	 *  Popup
	 *
	 */
	 
	var tndoHide = false;
	var popup = null;
	var popup_info = {id:-1, type:"", dispatcher:null}
	
	var popup_cache = [];

	function initPopups() {
		$(".gw2DBTooltip")
			.mouseenter(mouseEnterHandler)
			.mouseleave(function(eventObject) {
				hideIn(150);
			});

		popup = document.createElement('div');
		popup.setAttribute("id", "db-tooltip-container");
		document.getElementsByTagName("body")[0].appendChild(popup);
		$(popup)
			.mouseenter(function(eventObject) {
				tndoHide = false;
			})
			.mouseleave(function(eventObject) {
				hideIn(150);
			});
	}
	
	function mouseEnterHandler(eventObject) {
		var match = /gw2DB(skills|tasks|traits|items|recipes|achievements|creatures|boons|conditions|guildupgrades)_(\d+)/.exec( this.getAttribute('class').toString() );
		if (!match) return;
		tndoHide = false;
		if (popup_info.id == match[2] && 
		    popup_info.type == match[1] && 
		   (popup_info.dispatcher === eventObject.currentTarget || popup_info.dispatcher === popup)) return;
		$(popup).css("top", eventObject.pageY +10);
		$(popup).css("left",eventObject.pageX +10);

		popup_info = {id:match[2], type:match[1], dispatcher:eventObject.currentTarget};
		showPopup("<div class='db-tooltip'><div class='db-description' style='width: auto'>Loading..</div></div>");
			
		loadData(match[1], match[2]);
	}

	
	function calculatePopupPosition() {
		var spacer = 3;
		var top  = $(popup).css("top").replace("px", "");
		var left = $(popup).css("left").replace("px", "");
		if (popup_info.dispatcher) {
			dispatcher = popup_info.dispatcher;
			var newTop = Math.max(spacer, dispatcher.offsetTop +computeHeightOf(dispatcher) +spacer);
			if (newTop > $(window).height() +window.scrollY -popup.offsetHeight -spacer)
				newTop = dispatcher.offsetTop -popup.offsetHeight -spacer;
			
			var newLeft = dispatcher.offsetLeft;
			if (newLeft > $(window).width() +window.scrollX -367/*popup.offsetWidth*/)
				newLeft =  Math.min(left, dispatcher.offsetLeft +dispatcher.offsetWidth -367/*popup.offsetWidth*/);

			$(popup).css("top", newTop);
			$(popup).css("left", newLeft);
		}
	}
	
	function computeHeightOf(obj) {
		var result = $(obj).height();
		$(obj).children().each(function() {
			result = Math.max(result, computeHeightOf(this));
		});
		return result;
	}
	
	function showPopup(msg) {
		tndoHide = false;
		$(popup).html( msg );
   		$(".p-tooltip-image,.db-image").css('display', 'none');
		calculatePopupPosition();
		$(popup).css('display', 'inline');
	}

	function hideIn(milisec) {
		if (tndoHide) return;
		tndoHide = true;
		setTimeout(hidePopup, milisec);
	}
	
	function hidePopup() {
		if (!tndoHide) return;
		tndoHide = false;
		popup_info = {id:-1, type:"", dispatcher:null};
		$(popup).css('display', 'none');
		$(popup).html = '';
	}
	
	function loadData(type, id) {
		var data_fromCache = getFromCache(type, id);
	
		if (data_fromCache) {
			showPopup(formatResult(data_fromCache));
		} else {
			$.getJSON(gw2DB_PopupHost.format(type, id), function(data) {
				saveInCache(type, id, data);
				if (popup_info.id == -1 ||
					popup_info.id != id ||
					popup_info.type != type) return;
				showPopup(formatResult(data));
			});
		}	
	}
	
	function getFromCache(type, id) {
		for (var i = 0; i < popup_cache.length; i++) {
			if (popup_cache[i].id == id && popup_cache[i].type == type)
				return popup_cache[i].data;
		}
		return null;
	}
	
	function saveInCache(type, id, data) {
		if (!getFromCache(type, id)) {
			var newData = {"id":id, "type":type, "data":data}
			popup_cache.push(newData);
		}
	}

	function formatResult(data) {
		return data["Tooltip"].replace(/<div class="db-image">\s+<img src=".*?\/>\s+<\/div>/g, "");
	}
	
	addEvent(window, "load", setTimeout(function() {
		init();
	}, 300));
}).call(this);