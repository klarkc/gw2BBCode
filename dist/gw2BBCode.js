(function(window) {function loadStyle(a){var b=document.createElement("link");b.rel="stylesheet";b.type="text/css";b.href=a;b.media="all";document.getElementsByTagName("head")[0].appendChild(b)}function compareStrLow(a,b){return a.toLowerCase()===b.toLowerCase()}String.prototype.format=function(){var a=arguments;return this.replace(/{(\d+)}/g,function(b,c){return"undefined"!=typeof a[c]?a[c]:b})};Task=function(){this.status=0;this.successFn=this.errorFn=this.workFn=null};Task.prototype.isDone=function(){return 2===this.status};Task.prototype.error=function(a){this.errorFn=a;return this};Task.prototype.success=function(a){this.successFn=a;return this};
Task.prototype.doWork=function(){if(!this.isDone()){if(null==(this.workFn||null))throw Error("workFn not defined");if(null==(this.errorFn||null))throw Error("errorFn not defined");if(null==(this.successFn||null))throw Error("successFn not defined");this.status=1;this.workFn(this)}};JSONTask=function(a){this.url=a||"";this.data=null;this.workFn=function(){var a=this;jQuery.getJSON(this.url,function(c){a.status=2;a.data=c;a.successFn(a)})}};JSONTask.prototype=new Task;TaskList=function(){this.timeout=1E3*("undefined"!==typeof tasksTimeout?tasksTimeout:15);this.tasks=[];var a=null,b=this;this.clear=function(){this.tasks=[];this.status=0};this.addTask=function(d){this.tasks.push(d.success(function(){-1!==b.status&&b.isDone()&&(clearTimeout(a),b.status=2,b.successFn(b))}).error(function(d){clearTimeout(a);b.status=-1;b.errorFn(b,"Error while retrieving data. ("+d+")")}))};this.workFn=function(){var b=0;null!==this.timeout&&0<this.timeout&&(a=setTimeout(c,this.timeout));
for(b=0;b<this.tasks.length;b++)this.tasks[b].doWork();0===this.tasks.length&&this.successFn(this)};this.isDone=function(){for(var a=0;a<this.tasks.length;a++)if(!this.tasks[a].isDone())return!1;return!0};var c=function(){clearTimeout(a);b.status=-1;b.errorFn(b,"TaskList: timeout reached.")}};TaskList.prototype=new Task;function LocalStorageHelper(){}LocalStorageHelper.isSupported=function(){return"undefined"!==typeof Storage&&"undefined"!==JSON};LocalStorageHelper.putObject=function(a,b,c,d){b={data:b,ver:Math.max(1,c||0),ttl:Math.max(0,d||0),created:Date.now()};localStorage.setItem(a,this.myJSONstringifyObj(b))};LocalStorageHelper.getObject=function(a,b){var c=JSON.parse(localStorage.getItem(a));return this.isValid(c,b)?c.data:null};LocalStorageHelper.containsKey=function(a){return null!==localStorage.getItem(a)};
LocalStorageHelper.remove=function(a){localStorage.removeItem(a)};LocalStorageHelper.clear=function(){localStorage.clear()};LocalStorageHelper.isValid=function(a,b){return null!==a&&a.ver===b&&(0===a.ttl||0!==a.ttl&&a.created+a.ttl>=Date.now())};LocalStorageHelper.isUpToDate=function(a,b){return null!==LocalStorageHelper.getObject(a,b)};
LocalStorageHelper.myJSONstringifyObj=function(a){var b=typeof a;if("object"!=b||null===a)return"string"==b&&(a='"'+a+'"'),String(a);var c,d,g=[],e=a&&a.constructor==Array;for(c in a)d=a[c],b=typeof d,"string"==b?d='"'+d+'"':"object"==b&&null!==d&&(d=JSON.stringify(d)),g.push((e?"":'"'+c+'":')+String(d));return(e?"[":"{")+String(g)+(e?"]":"}")};NestedTooltip=function(a,b,c,d,g){this.parentTooltip=b||null;this.childTooltip=null;this.zindex=null!==b?b.zindex+1:9999;this.dispatcher=a||null;null!==b&&(null!==b.childTooltip&&b.childTooltip.hideNow(),b.childTooltip=this);var e=this,f=null,h=0,n=!1,l=!1;this.hidden=!1;this.isActive=function(){return(n||l)&&!this.hidden};this.setActive=function(a,b){var d=document.elementFromPoint(a,b);n=k(d,f);l=k(d,this.dispatcher)};var k=function(a,b){if(a===b)return!0;for(var f=0;f<b.childNodes.length;f++)if(k(a,
b.childNodes[f]))return!0;return!1};this.setContent=function(a){f.innerHTML=a};this.isHidding=function(){return 0!==h};this.stopHiding=function(){clearTimeout(h);h=0;null!==this.parentTooltip&&this.parentTooltip.stopHiding()};this.showTooltip=function(a){this.stopHiding();null===f&&(null===f&&(f=document.createElement("div"),jQuery(f).css("display","none").addClass("db-tooltip-container"),document.getElementsByTagName("body")[0].appendChild(f)),jQuery(e.dispatcher).mouseenter(m),jQuery(e.dispatcher).mouseleave(p),
jQuery(f).mouseenter(r),jQuery(f).mouseleave(q),jQuery(f).click(s),jQuery(e.dispatcher).click(t),l=!0,n=!1);jQuery(f).css("display","none");jQuery(f).css("z-index",this.zindex);jQuery(f).html(a);jQuery(".p-tooltip-image,.db-image").css("display","none");var b,d,c=jQuery(window),h=jQuery(f);b=e.dispatcher.childNodes[0];if(null===(b||null)||3===b.nodeType)b=e.dispatcher;d=jQuery(b);a=Math.max(1,d.offset().top+d.height()+1);a>c.height()+c.scrollTop()-h.outerHeight()-1&&(a=d.offset().top+d.height()-j(b)-
h.outerHeight()-1);b=d.offset().left;b>c.width()+c.scrollLeft()-367&&(b=d.offset().left+d.outerWidth()-367);h.css("top",a+"px");h.css("left",b+"px");jQuery(f).css("display","inline");this.hidden=!1;g(e,f)};this.hideIn=function(a){clearTimeout(h);h=setTimeout(function(){e.hideNow()},a)};this.hideNow=function(){clearTimeout(h);h=0;null!==e.childTooltip&&e.childTooltip.hideNow();jQuery(e.dispatcher).unbind("mouseenter",m);jQuery(e.dispatcher).unbind("mouseleave",p);jQuery(e.dispatcher).unbind("click",
t);jQuery(f).unbind("mouseenter",r);jQuery(f).unbind("mouseleave",q);jQuery(f).unbind("click",s);null!==f&&(document.getElementsByTagName("body")[0].removeChild(f),f=null);this.hidden=!0;d(this);null!==this.parentTooltip&&(this.parentTooltip.childTooltip=null);this.parentTooltip=null};var j=function(a){var b=jQuery(a).height();jQuery(a).children().each(function(){b=Math.max(b,j(this))});return b},m=function(){l=!0;e.stopHiding();c(e)},p=function(){l=!1;e.hideIn(150);c(e)},r=function(){n=!0;e.stopHiding();
c(e)},q=function(){n=!1;e.hideIn(150);c(e)},s=function(){n=!0;e.isHidding()&&e.stopHiding()},t=function(){l=!0;e.isHidding()&&e.stopHiding()}};NestedTooltipMgr=function(a,b){var c=null,d=this;this.showTooltip=function(a,f){var d=this.getTooltipFor(a);null===d&&(c&&c.isHidding()&&c.hideNow(),d=new NestedTooltip(a,n(),l,k,b),null===c&&(c=d));d.showTooltip(f);return d};this.updateTooltip=function(a,b){var d=this.getTooltipFor(a);null!==d&&d.showTooltip(b);return d};this.hideAll=function(){null!==c&&c.hideNow()};this.registerTooltipsHandlers=function(a){jQuery(a).each(function(){jQuery(this).unbind("mouseenter",g).mouseenter(g).unbind("click",
e).click(e)})};this.getTooltipFor=function(a){if(null===c)return null;if(c.dispatcher===a)return c;for(var b=c;null!==b.childTooltip;){if(b.childTooltip.dispatcher===a)return b.childTooltip;b=b.childTooltip}return null};var g=function(b){null===n()&&d.hideAll();var f=a.getMatchFor(b.currentTarget);null!==f&&(d.showTooltip(b.currentTarget,a.getLoadingContent()),a.loadData(b.currentTarget,d,f))},e=function(b){f(b);var c=a.getMatchFor(b.currentTarget);null!==c&&(0===b.currentTarget.getAttribute("class").toString().indexOf("gw2DB_touchFriendly")?
null===d.getTooltipFor(b.currentTarget)?(d.showTooltip(b.currentTarget,a.getLoadingContent()),a.loadData(b.currentTarget,d,c)):(b=b.currentTarget.getAttribute("url"),window.open(b,"_blank")):(b=b.currentTarget.getAttribute("href"),window.open(b,"_blank")))},f=function(a){h(c,a)},h=function(a,b){null!==a&&(a.setActive(b.pageX,b.pageY),a.isActive()?a.stopHiding():a.hideIn(150),h(a.childTooltip,b))},n=function(){for(var a=c,b=null;null!==a;)a.isActive()&&(b=a),a=a.childTooltip;return b},l=function(){null===
n()&&null!==c&&c.hideIn(150)},k=function(a){a===c&&(c=null)};jQuery(window).click(f)};Gw2BBCodeGlobal=function(){this.imagesUrl="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/gw2_images";this.contentUrl="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/NEXT/";this.popup_cssURL="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/NEXT/tooltip.css";this.gw2_cssURL="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/NEXT/gw2BBCode.css";this.main_pack={url:this.contentUrl+"main_resource_pack.json",ver:9};this.lang_packs=[{url:this.contentUrl+"lang_pack_fr.json",ver:3,lang:"fr"}];this.gw2WikiUrl=
"http://wiki.guildwars2.com/wiki";this.gw2DBUrl="http://www.gw2db.com";this.onClickGoTo="gw2DB";this.gw2DB_PopupHost="http://www.gw2db.com/{0}/{1}/tooltip?x&advanced=1&callback=?";this.gw2DBObj_ttl=864E5;this.types_En=[["s","skill"],["tr","trait"],["b","boon"],["co","condition"]];this.types_names={s:"skills",tr:"traits",b:"boons",co:"conditions"};this.profs_En=[["el","Elementalist"],["en","Engineer"],["gu","Guardian"],["me","Mesmer"],["ne","Necromancer"],["ra","Ranger"],["th","Thief"],["wa","Warrior"]];
this.stances_En=[["air","air"],["earth","earth"],["fire","fire"],["water","water"]]};function Gw2DBHelper(){}Gw2DBHelper.getGw2DBID=function(a){return 0!==(a.gw2db||0)?a.gw2db:a.id};Gw2DBHelper.convertCode=function(a,b){var c,d="??";for(c=0;c<b.length;c++)if(b[0]===a){d=b[1];break}return d};Gw2DBHelper.getUniqID=function(a){return a.t+"-"+a.id};Gw2DBHelper.getGw2DBTooltipUrl=function(a,b,c){return a.gw2DB_PopupHost.format(b,c)};
Gw2DBHelper.getTooltipContent=function(a,b){return{Tooltip:"<div class='db-tooltip db-tooltip-skill p-tooltip_gw2'><div class='db-description'><dl class='db-summary'><dt class='db-title'>{0}</dt><dd class='db-skill-description'>{1}</dd></dl></div></div>".format(a,b)}};Gw2DBHelper.gw2DBItemUrl=function(a,b){return"{0}/{1}/{2}".format(a.gw2DBUrl,a.types_names[b.t],b.id)};function Gw2BBCodeHelper(){}Gw2BBCodeHelper.getImgUrl=function(a,b){var c=b.id,d=b.p||"",g=b.t,e=b.ti,f=b.gw2db||0,h=a.types_names[g];if(""===(h||""))throw Error("Undefined img folder for type:"+g+" !");0!==f&&(c=f);return"tr"===g&&""!==d&&0===e?"{0}/{1}/{2}.png".format(a.imagesUrl,h,d.toLowerCase()):"tr"===g?"{0}/{1}/{2}.png".format(a.imagesUrl,h,e):"{0}/{1}/{2}.png".format(a.imagesUrl,h,c)};LoadResourceTask=function(a,b,c){this.data=null;this.ttl=c;this.version=b;this.gw2ResourceUrl=a;this.workFn=function(){var a=this,b=null,c=null;LocalStorageHelper.isSupported()&&(b=LocalStorageHelper.getObject(this.gw2ResourceUrl,this.version));null!==b?(a.status=2,a.data=b.data,a.successFn(a)):(c=(new JSONTask(this.gw2ResourceUrl)).success(function(b){a.data=b.data;LocalStorageHelper.putObject(a.gw2ResourceUrl,a.data,a.version,a.ttl);a.status=2;a.successFn(a)}).error(function(b,c){a.status=-1;a.errorFn(a,
c)}),c.doWork())}};LoadResourceTask.prototype=new Task;ResourceManager=function(){this.loadResource=function(a,b,c,d){this.loadResourceList([{url:a,ver:b,ttl:c,data:null}],d)};this.loadResourceList=function(a,b){if(null===a||0===a.length)b(a);else{var c=new TaskList(30),d=0;c.resourceArr=a;c.callback=b;for(d=0;d<a.length;d++)c.addTask(new LoadResourceTask(a[d].url,a[d].ver||1,a[d].ttl||0));c.success(function(a){for(var b=0;b<a.tasks.length;b++)a.resourceArr[b].data=a.tasks[b].data;a.callback(a.resourceArr)}).error(function(a,b){throw Error(b);});c.doWork()}};
this.isUpToDate=function(a,b){return LocalStorageHelper.isSupported()&&LocalStorageHelper.isUpToDate(a,b)};this.isUpToDateArr=function(a){for(var b=0;b<a.length;b++)if(!this.isUpToDate(a[b].url,a[b].ver))return!1;return!0};this.getResource=function(a,b){return LocalStorageHelper.getObject(a,b)};this.putResource=function(a,b,c,d){LocalStorageHelper.putObject(a,b,c,d)}};
NoLocalStorageResourceManager=function(){var a={};this.loadResource=function(a,c,d,g){this.getResourceList([{url:a,data:null}],g)};this.loadResourceList=function(b,c){if(null===b||0===b.length)c(b);else{var d=new TaskList(30),g=0;d.resourceArr=b;d.callback=c;for(g=0;g<b.length;g++)d.addTask(new JSONTask(b[g].url));d.success(function(b){for(var f=0;f<b.tasks.length;f++)b.resourceArr[f].data=b.tasks[f].data,a[b.resourceArr[f].url]=b.tasks[f].data;b.callback(b.resourceArr)}).error(function(a,b){throw Error(b);
});d.doWork()}};this.isUpToDate=function(b){return null!==(a[b]||null)};this.isUpToDateArr=function(a){for(var c=0;c<a.length;c++)if(!this.isUpToDate(a[c].url,a[c].ver))return!1;return!0};this.getResource=function(b){return a[b]||null};this.putResource=function(b,c){a[b]=c}};Gw2TooltipContentObj=function(a,b){this.getMatchFor=function(a){return/gw2DB_(skills|tasks|traits|items|recipes|achievements|creatures|boons|conditions|guildupgrades)_(\-?\d+)/.exec(a.getAttribute("class").toString())};this.getLoadingContent=function(){return"<div class='db-tooltip'><div class='db-description' style='width: auto'>Loading..</div></div>"};this.loadData=function(d,g,e){var f=Gw2DBHelper.getGw2DBTooltipUrl(a,e[1],e[2]),h=b.getResource(f,1);null!==h?g.updateTooltip(d,c(h)):b.loadResource(f,
1,a.gw2DBObj_ttl,function(){h=b.getResource(f,1);null!==h&&g.updateTooltip(d,c(h))})};var c=function(b){return b.Tooltip.replace(/<div class="db-image">\s+<img src=".*?\/>\s+<\/div>/g,"").replace(/<a href=\"/g,'<a href="'+a.gw2DBUrl)}};function LangPackHelper(){}LangPackHelper.getExprStr_profs=function(a,b){return LangPackHelper.getExprStr_generic(a,b,a.profs_En,"prof")};LangPackHelper.getExprStr_stances=function(a,b){return LangPackHelper.getExprStr_generic(a,b,a.stances_En,"stance")};LangPackHelper.getExprStr_types=function(a,b){return LangPackHelper.getExprStr_generic(a,b,a.types_En,"types")};
LangPackHelper.getExprStr_generic=function(a,b,c,d){for(var g=0,e=0,f=null,h="",g=0;g<c.length;g++)h+=c[g][0]+"|";for(g=0;g<a.lang_packs.length;g++)if(f=b.getResource(a.lang_packs[g].url,a.lang_packs[g].ver),null!==f)for(e=0;e<f.dicts[d].length;e++)-1===h.indexOf(f.dicts[d][e])&&(h+=f.dicts[d][e]+"|");return h.slice(0,h.length-1)};LangPackHelper.getProfCodeFor=function(a,b,c){return LangPackHelper.getCodeFor(a,b,c,a.profs_En,"prof")};
LangPackHelper.getStanceCodeFor=function(a,b,c){return LangPackHelper.getCodeFor(a,b,c,a.stances_En,"stance")};LangPackHelper.getTypeCodeFor=function(a,b,c){return LangPackHelper.getCodeFor(a,b,c,a.types_En,"types")};
LangPackHelper.getCodeFor=function(a,b,c,d,g){if(""===c)return"";var e=0,f=0,h=null;c=c.toLowerCase();for(e=0;e<d.length;e++)if(c===d[e][1].toLowerCase())return d[e][0];for(e=0;e<a.lang_packs.length;e++)if(h=b.getResource(a.lang_packs[e].url,a.lang_packs[e].ver),null!==h)for(f=0;f<h.dicts[g].length&&f<d.length;f++)if(c===h.dicts[g][f].toLowerCase())return d[f][0];return""};BBCodeDataEntry=function(a){this.name=a;this.nameObj=this.dataObj=null;this.isMacro=function(){return null!==this.dataObj&&"m"===this.dataObj.t};this.dataObjSet=[];this.fillWeaponSetData=function(a){if(this.isMacro())for(var c=0;c<this.dataObj.m.length;c++)this.dataObjSet.push(a.dataMap[this.dataObj.m[c]]||null)}};
BBCodeData=function(a,b,c){this.gw2Global=a;this.resourceMgr=b;this.patternType=c;this.regex=this.orig="";this.entry2=this.entry1=null;this.isPrefixed=this.showAsText=!1;this.options="";this.forcedIdx=-1;this.profStr=this.typeStr=this.stanceStr=this.prof=this.type=this.stance="";this.isWeaponSet=function(){return null!==this.entry1&&null!==this.entry2};this.toString=function(){return"regex: "+this.regex+"<br>name1: "+this.name1+"<br>name2: "+this.name2+"<br>showAsText: "+this.showAsText+"<br>isPrefixed: "+
this.isPrefixed+"<br>stance: "+this.stance+"<br>forcedIdx: "+this.forcedIdx+"<br>type: "+this.type+"<br>prof: "+this.prof+"<br><br>"};this.setStance=function(c){this.stance=LangPackHelper.getStanceCodeFor(a,b,c);this.stanceStr=c};this.setType=function(c){this.type=LangPackHelper.getTypeCodeFor(a,b,c);this.typeStr=c};this.setProfession=function(c){this.prof=LangPackHelper.getProfCodeFor(a,b,c);this.profStr=c};this.isCorrect=function(){return null===this.entry1&&null!==this.entry2||null!==this.entry1&&
(null===this.entry1.dataObj||null===this.entry1.dataObj)||null!==this.entry2&&(null===this.entry2.dataObj||null===this.entry2.dataObj)?!1:!0}};ClassicPattern=function(a,b){var c=RegExp("\\[([@^_]*)(gw2:)?(("+LangPackHelper.getExprStr_profs(a,b)+"):)?(("+LangPackHelper.getExprStr_types(a,b)+"):)?(.*?)(\\|(.*?))?(:("+LangPackHelper.getExprStr_stances(a,b)+"))?(\\.(\\d+))?\\]","gi");this.process=function(d){for(var g=[],e=c.exec(d),f=null;null!==e;)f=new BBCodeData(a,b,"gw2BBCode"),f.orig=e[0]||"",f.regex=RegExp((e[0]||"").replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1"),"gi"),f.showAsText=-1!==(e[1]||"").indexOf("@"),f.options=e[1]||"",f.isPrefixed=
"gw2:"===(e[2]||"").toLowerCase(),f.entry1=""!==(e[7]||"")?new BBCodeDataEntry(e[7]):null,f.entry2=""!==(e[9]||"")?new BBCodeDataEntry(e[9]):null,f.forcedIdx=Math.max(1,e[13]||1),f.setProfession(e[4]||""),f.setType(e[6]||""),f.setStance(e[11]||""),e=c.exec(d),g.push(f);return g}};WeaponSwapHelper=function(a){this.registerWeaponSwapHandlers=function(){jQuery(".gw2BBCode_weaponSwap").unbind("click").click(b)};var b=function(b){"undefined"!==typeof window.getSelection().removeAllRanges&&window.getSelection().removeAllRanges();jQuery(b.target.parentElement).find(".gw2BBCode_weaponSet").each(function(){jQuery(this).css("display","inline"==jQuery(this).css("display")?"none":"inline")});a.hideAll()}};Gw2DBSyndicationPlugin=function(){this.markAllGw2DBLink=function(){jQuery("a").each(function(){if("www.gw2db.com"==this.host){var a=/http:\/\/www.gw2db.com\/(\w+)\/(\d+)-/g.exec(this.href);null!==a&&!jQuery(this).hasClass("gw2DBTooltip")&&(jQuery(this).addClass("gw2DB_touchFriendly gw2DBTooltip gw2DB_{0}_{1}".format(a[1],a[2])),this.url=this.href,this.href="javascript:void(0);")}})}};PatternFinders=function(a){this.registeredPatterns=[];this.registerPattern=function(a){this.registeredPatterns.push(a)};this.find=function(b){for(var c=[],d=0,g=0,e,d=0;d<this.registeredPatterns.length;d++){e=this.registeredPatterns[d].process(b);for(g=0;g<e.length;g++)c.push(e[g])}for(d=0;d<c.length;d++)a.findDataAndNameFor(c[d]);return c}};Gw2DBCOMGenerator=function(a){this.getBBCode=function(a){var d="",e="";null!==a.entry1&&!a.entry1.isMacro()?d=b(a.entry1,a):null!==a.entry1&&a.entry1.isMacro()&&(d=c(a.entry1,a));null!==a.entry2&&!a.entry2.isMacro()?e=b(a.entry2,a):null!==a.entry2&&a.entry2.isMacro()&&(e=c(a.entry2,a));return""!==d&&""===e?d:""!==d&&""!==e?(a=""!==(e||""),"<div class='gw2BBCode_weaponSetWraper'>{0}<div class='gw2BBCode_weaponSet'>{1}</div>{2}</div>".format(a?"<div class='gw2BBCode_weaponSwap'></div>":"",d,a?"<div class='gw2BBCode_weaponSet' style='display:none;'>{0}</div>".format(e):
"")):a.orig};var b=function(a,b){var c=a.dataObj,l=e(c,a.nameObj.lang,"en");return d(c.id,Gw2DBHelper.getGw2DBID(c),l,c.t,b.showAsText?g(c,b,!0)+l:g(c,b,!1),c)},c=function(a,b){var c,l=[],k=null,j="",m="";for(c=0;c<a.dataObj.m.length;c++){k=a.dataObjSet[c];if(null===k)throw Error("[WeaponSet:{0}] No dataObj for id:{1}".format(a.name,a.dataObj.m[c]));j=e(k,a.nameObj.lang,"en");l.push(d(k.id,Gw2DBHelper.getGw2DBID(k),j,k.t,b.showAsText?g(k,b,!0)+j:g(k,b,!1),k))}for(c=0;c<l.length;c++)m+=l[c]+(b.showAsText&&
c!==l.length-1?" ":"");return m},d=function(b,c,d,e,g,j){return"<a href='javascript:void(0);' url='{0}' class='gw2DB_touchFriendly gw2DBTooltip gw2DB_{1}_{2} gw2BBCodeID_{3}'>{4}</a>".format("gw2Wiki"===a.onClickGoTo?"{0}/{1}".format(a.gw2WikiUrl,d.replace(/\s/g,"-").replace(/['"!]/g,"")):"gw2DB"===a.onClickGoTo?Gw2DBHelper.gw2DBItemUrl(a,j):"#",a.types_names[e],c,b,g)},g=function(b,c,d){return("<img src='{0}'"+(d?" style='width:18px;height:18px;vertical-align:text-bottom;'":"")+">").format(Gw2BBCodeHelper.getImgUrl(a,
b))},e=function(a,b,c){b=a.names[b];return""!==(b||"")?b:a.names[c]||""}};HTMLProcessor=function(a,b){var c="html,head,style,title,link,meta,script,object,iframe,code,textarea,a",c=c+",";this.processAll=function(){this.processNode(document.body)};this.processNode=function(d){if(!(null===d||"undefined"==d)){d=d.childNodes;for(var g=0,e=null,f=null,g=0;g<d.length;g++)if(f=d[g],1===f.nodeType&&-1===(c+",").indexOf(f.nodeName.toLowerCase()+",")&&this.processNode(f),!(3!==f.nodeType||""===(f.data||"").trim()))if(e=b.find(f.data),0!==e.length){for(var h=a,n=f.parentNode,l=e.length,
k=f.data,j=0,m=null,m=j=null,j=0;j<l;j++)m=e[j],m.isCorrect()&&(k=k.replace(m.regex,h.getBBCode(m)));if(k!==f.data){j=document.createElement("div");m=document.createDocumentFragment();for(j.innerHTML=k;j.firstChild;)m.appendChild(j.firstChild);n.insertBefore(m,f);n.removeChild(f)}}}}};Gw2DataMap=function(a,b,c){this.dataMap={};this.nameMap={};var d=!0,g=0;b.isUpToDate(a.main_pack.url,a.main_pack.ver)||(d=!1,c.push(a.main_pack));for(g=0;g<a.lang_packs.length;g++)b.isUpToDate(a.lang_packs[g].url,a.lang_packs[g].ver)||(d=!1,c.push(a.lang_packs[g]));this.findDataAndNameFor=function(a){var b=null;null!==a.entry1&&(b=e(this,a.entry1.name,a),null!==b&&(a.entry1.dataObj=b.data,a.entry1.nameObj=b.name,a.entry1.fillWeaponSetData(this)));null!==a.entry2&&(b=e(this,a.entry2.name,a),null!==
b&&(a.entry2.dataObj=b.data,a.entry2.nameObj=b.name,a.entry2.fillWeaponSetData(this)))};this.fillGw2DataMap=function(){!0===d&&(this.dataMap=b.getResource("Gw2DataMap",1),this.nameMap=b.getResource("Gw2NameMap",1),d=null!==this.dataMap&&null!==this.nameMap);if(!d){var c,e,g=null,j,m,p;this.dataMap={};this.nameMap={};g=b.getResource(a.main_pack.url,a.main_pack.ver);for(c=0;c<g.length;c++)j=g[c],j.names={en:j.n},e=Gw2DBHelper.getUniqID(j),j.uniqID=e,this.dataMap[e]&&console.log("Powt\ufffdrzony uniqID="+
e),this.dataMap[e]=j,this.nameMap[f(j.n)]=this.nameMap[f(j.n)]||[],this.nameMap[f(j.n)].push({id:e,n:j.n,lang:"en",data:j}),""!==(j.tc||"")&&b.putResource(Gw2DBHelper.getGw2DBTooltipUrl(a,a.types_names[j.t],Gw2DBHelper.getGw2DBID(j)),Gw2DBHelper.getTooltipContent(j.n,j.tc));for(c=0;c<a.lang_packs.length;c++){g=b.getResource(a.lang_packs[c].url,a.lang_packs[c].ver);if("string"===typeof g.names)throw Error("JSON.parse() error");m=g.names;for(e=0;e<m.length;e++)j=m[e],null===(this.dataMap[j[0]]||null)?
console.log("ERROR: no data for id:{0}, name:{1} in langPack:{2}".format(j[0],j[1],g.lang)):(this.nameMap[f(j[1])]=this.nameMap[f(j[1])]||[],this.nameMap[f(j[1])].push({id:j[0],n:j[1],lang:g.lang,data:this.dataMap[j[0]]}),this.dataMap[j[0]].names[g.lang]=j[1])}for(p in this.nameMap)-1!==p.indexOf("gw2_")&&this.nameMap[p].sort(h);b.putResource("Gw2DataMap",this.dataMap,1,0);b.putResource("Gw2NameMap",this.nameMap,1,0);d=!0}};var e=function(a,b,c){var d,e,g=0,h=null,q=b.toLowerCase();if(""===b)return null;
d=a.nameMap[f(b)]||null;if(null===d)return null;for(e=0;e<d.length;e++)if(d[e].n.toLowerCase()===q){h=a.dataMap[d[e].id]||null;if(null===h)throw Error("no data for "+b);if((""!==c.stance&&compareStrLow(c.stance,h.st||"")||""===c.stance)&&(""!==c.type&&compareStrLow(c.type,h.t||"")||""===c.type)&&(""!==c.prof&&compareStrLow(c.prof,h.p||"")||""===c.prof)&&++g===c.forcedIdx)return{data:h,name:d[e]}}return null},f=function(a){return"gw2_"+a.substr(0,3).toLowerCase()},h=function(a,b){return a.n===b.n?
"b"===a.data.t||"co"===a.data.t?-1:"b"===b.data.t||"co"===b.data.t?1:0<a.id&&0<b.id||0>a.id&&0>b.id?a.id>b.id?-1:1:0<a.id?-1:1:a.n>b.n?1:-1}};Gw2BBCode=function(){var a=this,b=!1,c=!1;this.gw2Global=new Gw2BBCodeGlobal;var d=this.validator=null,g=null,e=null,f=null,h=null,n=null,h=null,l=new Gw2DBSyndicationPlugin,k=null;this.isLoadedAndReady=function(){return c&&b};this.processNode=function(b){if(!a.isLoadedAndReady())return!1;d.processNode(b);a.isLoadedAndReady()&&(l.markAllGw2DBLink(),n.registerWeaponSwapHandlers(),k.registerTooltipsHandlers(".gw2DBTooltip"));return!0};var e=LocalStorageHelper.isSupported()?new ResourceManager:new NoLocalStorageResourceManager,
j=[];loadStyle(a.gw2Global.gw2_cssURL);loadStyle(a.gw2Global.popup_cssURL);h=new Gw2TooltipContentObj(a.gw2Global,e);k=new NestedTooltipMgr(h,function(b,c){a.processNode(c)});g=new Gw2DataMap(a.gw2Global,e,j);f=new PatternFinders(g);h=new Gw2DBCOMGenerator(a.gw2Global);d=new HTMLProcessor(h,f);n=new WeaponSwapHelper(k);a.validator="undefined"!==typeof Gw2DBValidator?new Gw2DBValidator(a.gw2Global,g):null;e.loadResourceList(j,function(){c=!0;g.fillGw2DataMap();f.registerPattern(new ClassicPattern(a.gw2Global,
e));a.isLoadedAndReady()&&a.processNode(document.body)});jQuery(document).ready(function(){b=!0;a.isLoadedAndReady()&&a.processNode(document.body)})};window.gw2BBCode=new Gw2BBCode;})(window);
