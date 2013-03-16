function loadStyle(libUrl){var link=document.createElement("link");link.rel="stylesheet";link.type="text/css";link.href=libUrl;link.media="all";document.getElementsByTagName("head")[0].appendChild(link)}function compareStrLow(a,b){return a.toLowerCase()===b.toLowerCase()}String.prototype.format=function(){var args=arguments;return this.replace(/{(\d+)}/g,function(match,number){return typeof args[number]!="undefined"?args[number]:match})};Task=function(){this.status=0;this.workFn=null;this.errorFn=null;this.successFn=null};Task.prototype.isDone=function(){return this.status===2};Task.prototype.error=function(errorFn){this.errorFn=errorFn;return this};Task.prototype.success=function(successFn){this.successFn=successFn;return this};
Task.prototype.doWork=function(){if(this.isDone())return;if((this.workFn||null)==null)throw new Error("workFn not defined");if((this.errorFn||null)==null)throw new Error("errorFn not defined");if((this.successFn||null)==null)throw new Error("successFn not defined");this.status=1;this.workFn(this)};JSONTask=function(url){this.url=url||"";this.data=null;this.workFn=function(){var self=this;jQuery.getJSON(this.url).success(function(data){self.status=2;self.data=data;self.successFn(self)}).error(function(jqXhr,textStatus,error){self.status=-1;self.errorFn(self,"Error while retrieving data from "+self.url+" . ("+textStatus+")")})}};JSONTask.prototype=new Task;TaskList=function(timeout){this.timeout=(typeof tasksTimeout!=="undefined"?tasksTimeout:15)*1E3;this.tasks=[];var __timeout=null;var self=this;this.clear=function(){this.tasks=[];this.status=0};this.addTask=function(task){this.tasks.push(task.success(function(data){if(self.status!==-1&&self.isDone()){clearTimeout(__timeout);self.status=2;self.successFn(self)}}).error(function(textStatus){clearTimeout(__timeout);self.status=-1;self.errorFn(self,"Error while retrieving data. ("+textStatus+")")}))};
this.workFn=function(){var self=this,i=0;if(this.timeout!==null&&this.timeout>0)__timeout=setTimeout(onTimeout,this.timeout);for(i=0;i<this.tasks.length;i++)this.tasks[i].doWork();if(this.tasks.length===0)this.successFn(this)};this.isDone=function(){for(var i=0;i<this.tasks.length;i++)if(!this.tasks[i].isDone())return false;return true};var onTimeout=function(){clearTimeout(__timeout);self.status=-1;self.errorFn(self,"TaskList: timeout reached.")}};TaskList.prototype=new Task;function LocalStorageHelper(){}LocalStorageHelper.isSupported=function(){return typeof Storage!=="undefined"&&JSON!=="undefined"};LocalStorageHelper.putObject=function(key,object,version,ttl){var storageObj={"data":object,"ver":Math.max(1,version||0),"ttl":Math.max(0,ttl||0),"created":Date.now()};localStorage.setItem(key,JSON.stringify(storageObj))};
LocalStorageHelper.getObject=function(key,version){var storageObj=JSON.parse(localStorage.getItem(key));if(this.isValid(storageObj,version))return storageObj.data;else return null};LocalStorageHelper.containsKey=function(key){return localStorage.getItem(key)!==null};LocalStorageHelper.remove=function(key){localStorage.removeItem(key)};LocalStorageHelper.clear=function(){localStorage.clear()};
LocalStorageHelper.isValid=function(storageObj,version){return storageObj!==null&&storageObj["ver"]===version&&(storageObj["ttl"]===0||storageObj["ttl"]!==0&&storageObj["created"]+storageObj["ttl"]>=Date.now())};LocalStorageHelper.isUpToDate=function(key,ver){return LocalStorageHelper.getObject(key,ver)!==null};NestedTooltip=function(dispatcher,parentTooltip,activeStatusChanged,onHiding,onContentChanged){this.parentTooltip=parentTooltip||null;this.childTooltip=null;this.zindex=parentTooltip!==null?parentTooltip.zindex+1:9999;this.dispatcher=dispatcher||null;if(parentTooltip!==null){if(parentTooltip.childTooltip!==null)parentTooltip.childTooltip.hideNow();parentTooltip.childTooltip=this}var self=this;var tooltip=null;var timeout=0;var isMouseOverTooltip=false;var isMouseOverDispatcher=false;this.hidden=false;
var onHiding=onHiding;var onContentChanged=onContentChanged;var activeStatusChanged=activeStatusChanged;this.isActive=function(){return(isMouseOverTooltip||isMouseOverDispatcher)&&!this.hidden};this.setContent=function(content){tooltip.innerHTML=content};this.isHidding=function(){return timeout!==0};this.stopHiding=function(){clearTimeout(timeout);if(this.parentTooltip!==null)this.parentTooltip.stopHiding()};this.showTooltip=function(content){this.stopHiding();if(tooltip===null){registerTooltip();
registerEvents();isMouseOverDispatcher=true;isMouseOverTooltip=false}jQuery(tooltip).css("display","none");jQuery(tooltip).css("z-index",this.zindex);jQuery(tooltip).html(content);jQuery(".p-tooltip-image,.db-image").css("display","none");calculateTooltipPosition();jQuery(tooltip).css("display","inline");this.hidden=false;onContentChanged(self,tooltip)};this.hideIn=function(milisec){clearTimeout(timeout);timeout=setTimeout(function(){self.hideNow()},milisec)};this.hideNow=function(){clearTimeout(timeout);
hideChild();unregisterEvents();unregisterTooltip();this.hidden=true;onHiding(this);if(this.parentTooltip!==null)this.parentTooltip.childTooltip=null;this.parentTooltip=null};var hideChild=function(){if(self.childTooltip!==null)self.childTooltip.hideNow()};var registerTooltip=function(){if(tooltip!==null)return;tooltip=document.createElement("div");jQuery(tooltip).css("display","none").addClass("db-tooltip-container");document.getElementsByTagName("body")[0].appendChild(tooltip)};var unregisterTooltip=
function(){if(tooltip===null)return;document.getElementsByTagName("body")[0].removeChild(tooltip);tooltip=null};var registerEvents=function(){jQuery(self.dispatcher).mouseenter(onDispatcherMouseOver);jQuery(self.dispatcher).mouseleave(onDispatcherMouseOut);jQuery(tooltip).mouseenter(onTooltipMouseOver);jQuery(tooltip).mouseleave(onTooltipMouseOut)};var unregisterEvents=function(){jQuery(self.dispatcher).unbind("mouseenter",onDispatcherMouseOver);jQuery(self.dispatcher).unbind("mouseleave",onDispatcherMouseOut);
jQuery(tooltip).unbind("mouseenter",onTooltipMouseOver);jQuery(tooltip).unbind("mouseleave",onTooltipMouseOut)};var calculateTooltipPosition=function(){var newTop,newLeft;newTop=Math.max(1,jQuery(self.dispatcher).offset().top+jQuery(self.dispatcher).height()-3);if(newTop>jQuery(window).height()+jQuery(window).scrollTop()-jQuery(tooltip).outerHeight()-5)newTop=jQuery(self.dispatcher).offset().top+jQuery(self.dispatcher).height()-computeHeightOf(self.dispatcher)-jQuery(tooltip).outerHeight()-5;newLeft=
jQuery(self.dispatcher).offset().left;if(newLeft>jQuery(window).width()+jQuery(window).scrollLeft()-367)newLeft=jQuery(self.dispatcher).offset().left+jQuery(self.dispatcher).outerWidth()-367;jQuery(tooltip).css("top",newTop+"px");jQuery(tooltip).css("left",newLeft+"px")};var computeHeightOf=function(element){var result=jQuery(element).height();jQuery(element).children().each(function(){result=Math.max(result,computeHeightOf(this))});return result};var onDispatcherMouseOver=function(){isMouseOverDispatcher=
true;self.stopHiding();activeStatusChanged(self)};var onDispatcherMouseOut=function(){isMouseOverDispatcher=false;self.hideIn(150);activeStatusChanged(self)};var onTooltipMouseOver=function(){isMouseOverTooltip=true;self.stopHiding();activeStatusChanged(self)};var onTooltipMouseOut=function(){isMouseOverTooltip=false;self.hideIn(150);activeStatusChanged(self)}};NestedTooltipMgr=function(tooltipContentObj,onContentChanged){var firstTooltip=null;var self=this;var tooltipContentObj=tooltipContentObj;var onContentChanged=onContentChanged;this.showTooltip=function(dispatcher,content){var tooltip=this.getTooltipFor(dispatcher);if(tooltip===null){tooltip=new NestedTooltip(dispatcher,getLastActive(),activeStatusChanged,onHiding,onContentChanged);if(firstTooltip===null)firstTooltip=tooltip}tooltip.showTooltip(content);return tooltip};this.updateTooltip=function(dispatcher,
content){var tooltip=this.getTooltipFor(dispatcher);if(tooltip!==null)tooltip.showTooltip(content);return tooltip};this.hideAll=function(){if(firstTooltip!==null)firstTooltip.hideNow()};this.registerTooltipsHandlers=function(selector){jQuery(selector).each(function(){registerHandlerFor(this)})};this.getTooltipFor=function(dispatcher){if(firstTooltip===null)return null;if(firstTooltip.dispatcher===dispatcher)return firstTooltip;var tooltip=firstTooltip;while(tooltip.childTooltip!==null){if(tooltip.childTooltip.dispatcher===
dispatcher)return tooltip.childTooltip;tooltip=tooltip.childTooltip}return null};var registerHandlerFor=function(element){jQuery(element).unbind("mouseenter",mouseEnterHandler).mouseenter(mouseEnterHandler)};var mouseEnterHandler=function(eventObject){var lastActive=getLastActive();if(lastActive===null)self.hideAll();var match=tooltipContentObj.getMatchFor(eventObject.currentTarget);if(match===null)return;self.showTooltip(eventObject.currentTarget,tooltipContentObj.getLoadingContent());tooltipContentObj.loadData(eventObject.currentTarget,
self,match)};var getLastActive=function(){var tooltip=firstTooltip,lastActive=null;while(tooltip!==null){if(tooltip.isActive())lastActive=tooltip;tooltip=tooltip.childTooltip}return lastActive};var activeStatusChanged=function(tooltip){var lastActive=getLastActive();if(lastActive===null&&firstTooltip!==null)firstTooltip.hideIn(150)};var onHiding=function(tooltip){if(tooltip===firstTooltip)firstTooltip=null}};Gw2BBCodeGlobal=function(){this.imagesUrl="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/gw2_images";this.contentUrl="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/NEXT/";this.popup_cssURL="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/NEXT/tooltip.css";this.gw2_cssURL="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/NEXT/gw2BBCode.css";this.main_pack={"url":this.contentUrl+"main_resource_pack.json","ver":2};this.lang_packs=[{"url":this.contentUrl+"lang_pack_fr.json","ver":1,"lang":"fr"}];this.gw2WikiUrl=
"http://wiki.guildwars2.com/wiki";this.gw2DBUrl="http://www.gw2db.com";this.onClickGoTo="gw2DB";this.gw2DB_PopupHost="http://www.gw2db.com/{0}/{1}/tooltip?x&advanced=1&callback=?";this.gw2DBObj_ttl=1E3*60*60*24;this.types_En=[["s","skill"],["tr","trait"],["b","boon"],["co","condition"]];this.types_names={"s":"skills","tr":"traits","b":"boons","co":"conditions"};this.profs_En=[["el","Elementalist"],["en","Engineer"],["gu","Guardian"],["me","Mesmer"],["ne","Necromancer"],["ra","Ranger"],["th","Thief"],
["wa","Warrior"]];this.stances_En=[["air","air"],["earth","earth"],["fire","fire"],["water","water"]];this.convertCode=function(code,converter){var i,result="??";for(i=0;i<converter.length;i++)if(converter[0]===code){result=converter[1];break}return result}};function Gw2DBHelper(){}Gw2DBHelper.getGw2DBID=function(dataObj){return(dataObj["gw2db"]||0)!==0?dataObj["gw2db"]:dataObj["id"]};LoadResourceTask=function(gw2ResourceUrl,version,ttl){this.data=null;this.ttl=ttl;this.version=version;this.gw2ResourceUrl=gw2ResourceUrl;this.workFn=function(){var self=this,storageObj=null,JSONtask=null;if(LocalStorageHelper.isSupported())storageObj=LocalStorageHelper.getObject(this.gw2ResourceUrl,this.version);if(storageObj!==null){self.status=2;self.data=storageObj.data;self.successFn(self)}else{JSONtask=(new JSONTask(this.gw2ResourceUrl)).success(function(task){self.data=task.data;LocalStorageHelper.putObject(self.gw2ResourceUrl,
self.data,self.version,self.ttl);self.status=2;self.successFn(self)}).error(function(task,errorMsg){self.status=-1;self.errorFn(self,errorMsg)});JSONtask.doWork()}}};LoadResourceTask.prototype=new Task;ResourceManager=function(){this.loadResource=function(resourceUrl,version,ttl,callback){this.loadResourceList([{"url":resourceUrl,"ver":version,"ttl":ttl,"data":null}],callback)};this.loadResourceList=function(resourceArr,callback){if(resourceArr===null||resourceArr.length===0)callback(resourceArr);else{var taskList=new TaskList(30),i=0;taskList.resourceArr=resourceArr;taskList.callback=callback;for(i=0;i<resourceArr.length;i++)taskList.addTask(new LoadResourceTask(resourceArr[i]["url"],resourceArr[i]["ver"]||
1,resourceArr[i]["ttl"]||0));taskList.success(function(taskList){for(var i=0;i<taskList.tasks.length;i++)taskList.resourceArr[i].data=taskList.tasks[i].data;taskList.callback(taskList.resourceArr)}).error(function(taskList,errorMsg){throw new Error(errorMsg);});taskList.doWork()}};this.isUpToDate=function(url,ver){return LocalStorageHelper.isSupported()&&LocalStorageHelper.isUpToDate(url,ver)};this.isUpToDateArr=function(arr){for(var i=0;i<arr.length;i++)if(!this.isUpToDate(arr[i]["url"],arr[i]["ver"]))return false;
return true};this.getResource=function(resourceUrl,version){return LocalStorageHelper.getObject(resourceUrl,version)};this.putResource=function(resourceUrl,data,version,ttl){LocalStorageHelper.putObject(resourceUrl,data,version,ttl)}};
NoLocalStorageResourceManager=function(){var cache={};this.loadResource=function(resourceUrl,version,ttl,callback){this.getResourceList([{"url":resourceUrl,"data":null}],callback)};this.loadResourceList=function(resourceArr,callback){if(resourceArr===null||resourceArr.length===0)callback(resourceArr);else{var taskList=new TaskList(30),i=0;taskList.resourceArr=resourceArr;taskList.callback=callback;for(i=0;i<resourceArr.length;i++)taskList.addTask(new JSONTask(resourceArr[i]["url"]));taskList.success(function(taskList){for(var i=
0;i<taskList.tasks.length;i++){taskList.resourceArr[i].data=taskList.tasks[i].data;cache[taskList.resourceArr[i].url]=taskList.tasks[i].data}taskList.callback(taskList.resourceArr)}).error(function(taskList,errorMsg){throw new Error(errorMsg);});taskList.doWork()}};this.isUpToDate=function(url,ver){return(cache[url]||null)!==null};this.isUpToDateArr=function(arr){for(var i=0;i<arr.length;i++)if(!this.isUpToDate(arr[i]["url"],arr[i]["ver"]))return false;return true};this.getResource=function(resourceUrl,
version){return cache[resourceUrl]||null};this.putResource=function(resourceUrl,data,version,ttl){cache[resourceUrl]=data}};Gw2TooltipContentObj=function(gw2Global,resourceManager){var gw2Global=gw2Global;var resourceManager=resourceManager;this.getMatchFor=function(dispatcher){return/gw2DB_(skills|tasks|traits|items|recipes|achievements|creatures|boons|conditions|guildupgrades)_(\d+)/.exec(dispatcher.getAttribute("class").toString())};this.getLoadingContent=function(){return"<div class='db-tooltip'><div class='db-description' style='width: auto'>Loading..</div></div>"};this.loadData=function(dispatcher,tooltipMgr,match){var url=
gw2Global.gw2DB_PopupHost.format(match[1],match[2]),data_fromCache=resourceManager.getResource(url,1);if(data_fromCache!==null)tooltipMgr.updateTooltip(dispatcher,formatResult(data_fromCache));else resourceManager.loadResource(url,1,gw2Global.gw2DBObj_ttl,function(){data_fromCache=resourceManager.getResource(url,1);if(data_fromCache!==null)tooltipMgr.updateTooltip(dispatcher,formatResult(data_fromCache))})};var formatResult=function(data){return data["Tooltip"].replace(/<div class="db-image">\s+<img src=".*?\/>\s+<\/div>/g,
"").replace(/<a href=\"/g,'<a href="'+gw2Global.gw2DBUrl)}};function LangPackHelper(){}LangPackHelper.getExprStr_profs=function(gw2Global,resourceMgr){return LangPackHelper.getExprStr_generic(gw2Global,resourceMgr,gw2Global.profs_En,"prof")};LangPackHelper.getExprStr_stances=function(gw2Global,resourceMgr){return LangPackHelper.getExprStr_generic(gw2Global,resourceMgr,gw2Global.stances_En,"stance")};LangPackHelper.getExprStr_types=function(gw2Global,resourceMgr){return LangPackHelper.getExprStr_generic(gw2Global,resourceMgr,gw2Global.types_En,"types")};
LangPackHelper.getExprStr_generic=function(gw2Global,resourceMgr,masterPack_arr,dictName){var i=0,j=0,pack=null,result="";for(i=0;i<masterPack_arr.length;i++)result+=masterPack_arr[i][0]+"|";for(i=0;i<gw2Global.lang_packs.length;i++){pack=resourceMgr.getResource(gw2Global.lang_packs[i]["url"],gw2Global.lang_packs[i]["ver"]);if(pack===null)continue;for(j=0;j<pack.dicts[dictName].length;j++)if(result.indexOf(pack.dicts[dictName][j])===-1)result+=pack.dicts[dictName][j]+"|"}return result.slice(0,result.length-
1)};LangPackHelper.getProfCodeFor=function(gw2Global,resourceMgr,profStr){return LangPackHelper.getCodeFor(gw2Global,resourceMgr,profStr,gw2Global.profs_En,"prof")};LangPackHelper.getStanceCodeFor=function(gw2Global,resourceMgr,stanceStr){return LangPackHelper.getCodeFor(gw2Global,resourceMgr,stanceStr,gw2Global.stances_En,"stance")};LangPackHelper.getTypeCodeFor=function(gw2Global,resourceMgr,typeStr){return LangPackHelper.getCodeFor(gw2Global,resourceMgr,typeStr,gw2Global.types_En,"types")};
LangPackHelper.getCodeFor=function(gw2Global,resourceMgr,itemStr,masterPack_arr,dictName){if(itemStr==="")return"";var i=0,j=0,pack=null,itemLow=itemStr.toLowerCase();for(i=0;i<masterPack_arr.length;i++)if(itemLow===masterPack_arr[i][1].toLowerCase())return masterPack_arr[i][0];for(i=0;i<gw2Global.lang_packs.length;i++){pack=resourceMgr.getResource(gw2Global.lang_packs[i]["url"],gw2Global.lang_packs[i]["ver"]);if(pack===null)continue;for(j=0;j<pack.dicts[dictName].length&&j<masterPack_arr.length;j++)if(itemLow===
pack.dicts[dictName][j].toLowerCase())return masterPack_arr[j][0]}return""};BBCodeDataEntry=function(name){this.name=name;this.dataObj=null;this.nameObj=null;this.isMacro=function(){return this.dataObj!==null&&this.dataObj["t"]==="m"};this.dataObjSet=[];this.fillWeaponSetData=function(gw2DataMap){if(this.isMacro())for(var i=0;i<this.dataObj["m"].length;i++)this.dataObjSet.push(gw2DataMap.dataMap[this.dataObj["m"][i]]||null)}};
BBCodeData=function(gw2Global,resourceMgr,patternType){this.gw2Global=gw2Global;this.resourceMgr=resourceMgr;this.patternType=patternType;this.orig="";this.regex="";this.entry1=null;this.entry2=null;this.showAsText=false;this.isPrefixed=false;this.options="";this.forcedIdx=-1;this.stance="";this.type="";this.prof="";this.stanceStr="";this.typeStr="";this.profStr="";this.isWeaponSet=function(){return this.entry1!==null&&this.entry2!==null};this.toString=function(){return"regex: "+this.regex+"<br>"+
"name1: "+this.name1+"<br>"+"name2: "+this.name2+"<br>"+"showAsText: "+this.showAsText+"<br>"+"isPrefixed: "+this.isPrefixed+"<br>"+"stance: "+this.stance+"<br>"+"forcedIdx: "+this.forcedIdx+"<br>"+"type: "+this.type+"<br>"+"prof: "+this.prof+"<br><br>"};this.setStance=function(stanceStr){this.stance=LangPackHelper.getStanceCodeFor(gw2Global,resourceMgr,stanceStr);this.stanceStr=stanceStr};this.setType=function(typeStr){this.type=LangPackHelper.getTypeCodeFor(gw2Global,resourceMgr,typeStr);this.typeStr=
typeStr};this.setProfession=function(profStr){this.prof=LangPackHelper.getProfCodeFor(gw2Global,resourceMgr,profStr);this.profStr=profStr};this.isCorrect=function(){if(this.entry1===null&&this.entry2!==null)return false;if(this.entry1!==null&&(this.entry1.dataObj===null||this.entry1.dataObj===null))return false;if(this.entry2!==null&&(this.entry2.dataObj===null||this.entry2.dataObj===null))return false;return true}};ClassicPattern=function(gw2Global,resourceMgr){var resourceMgr=resourceMgr;var gw2Global=gw2Global;var regExpr=new RegExp("\\[([@^_]*)(gw2:)?(("+LangPackHelper.getExprStr_profs(gw2Global,resourceMgr)+"):)?(("+LangPackHelper.getExprStr_types(gw2Global,resourceMgr)+"):)?(.*?)(\\|(.*?))?(:("+LangPackHelper.getExprStr_stances(gw2Global,resourceMgr)+"))?(\\.(\\d+))?\\]","gi");this.process=function(data){var result=[],match=regExpr.exec(data),found=null;while(match!==null){found=getResultForMatch(match);
match=regExpr.exec(data);result.push(found)}return result};var getResultForMatch=function(match){var result=new BBCodeData(gw2Global,resourceMgr,"gw2BBCode");result.orig=match[0]||"";result.regex=new RegExp((match[0]||"").replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1"),"gi");result.showAsText=(match[1]||"").indexOf("@")!==-1;result.options=match[1]||"";result.isPrefixed=(match[2]||"").toLowerCase()==="gw2:";result.entry1=(match[7]||"")!==""?new BBCodeDataEntry(match[7]):null;result.entry2=(match[9]||"")!==
""?new BBCodeDataEntry(match[9]):null;result.forcedIdx=Math.max(1,match[13]||1);result.setProfession(match[4]||"");result.setType(match[6]||"");result.setStance(match[11]||"");return result}};WeaponSwapHelper=function(tooltipMgr){var tooltipMgr=tooltipMgr;this.registerWeaponSwapHandlers=function(){jQuery(".gw2BBCode_weaponSwap").unbind("click").click(weaponSwapHandler)};var weaponSwapHandler=function(event){if(typeof window.getSelection().removeAllRanges!=="undefined")window.getSelection().removeAllRanges();jQuery(event.target.parentElement).find(".gw2BBCode_weaponSet").each(function(){jQuery(this).css("display",jQuery(this).css("display")=="inline"?"none":"inline")});tooltipMgr.hideAll()}};Gw2DBSyndicationPlugin=function(){this.markAllGw2DBLink=function(){jQuery("a").each(function(){register(this)})};var register=function(a){if(a.host=="www.gw2db.com"){var match=/http:\/\/www.gw2db.com\/(\w+)\/(\d+)-/g.exec(a.href);if(match!==null&&!jQuery(a).hasClass("gw2DBTooltip"))jQuery(a).addClass("gw2DBTooltip gw2DB_{0}_{1}".format(match[1],match[2]))}}};PatternFinders=function(gw2DataMap){this.registeredPatterns=[];var gw2DataMap=gw2DataMap;this.registerPattern=function(pattern){this.registeredPatterns.push(pattern)};this.find=function(data){var result=[],i=0,j=0,bbCodeArr;for(i=0;i<this.registeredPatterns.length;i++){bbCodeArr=this.registeredPatterns[i].process(data);for(j=0;j<bbCodeArr.length;j++)result.push(bbCodeArr[j])}for(i=0;i<result.length;i++)gw2DataMap.findDataAndNameFor(result[i]);return result}};Gw2DBCOMGenerator=function(gw2Global){var gw2Global=gw2Global;this.getBBCode=function(bbCodeData){var content1="",content2="";if(bbCodeData.entry1!==null&&!bbCodeData.entry1.isMacro())content1=getBBCodeForItem(bbCodeData.entry1,bbCodeData);else if(bbCodeData.entry1!==null&&bbCodeData.entry1.isMacro())content1=getBBCodeForMacro(bbCodeData.entry1,bbCodeData);if(bbCodeData.entry2!==null&&!bbCodeData.entry2.isMacro())content2=getBBCodeForItem(bbCodeData.entry2,bbCodeData);else if(bbCodeData.entry2!==
null&&bbCodeData.entry2.isMacro())content2=getBBCodeForMacro(bbCodeData.entry2,bbCodeData);if(content1!==""&&content2==="")return content1;else if(content1!==""&&content2!=="")return weaponSwapWrapper(content1,content2);else return bbCodeData.orig};var getBBCodeForItem=function(entry,bbCodeData){var dataObj=entry.dataObj,name=getNameFrom(dataObj,entry.nameObj["lang"],"en");return generateBBCodeFor(dataObj["id"],Gw2DBHelper.getGw2DBID(dataObj),name,dataObj["t"],getImgOrTextDesc(name,dataObj,bbCodeData))};
var getBBCodeForMacro=function(entry,bbCodeData){var i,tmpArr=[],dataObj=null,name="",result="";for(i=0;i<entry.dataObj["m"].length;i++){dataObj=entry.dataObjSet[i];if(dataObj===null)throw new Error("[WeaponSet:{0}] No dataObj for id:{1}".format(entry.name,entry.dataObj["m"][i]));name=getNameFrom(dataObj,entry.nameObj["lang"],"en");tmpArr.push(generateBBCodeFor(dataObj["id"],Gw2DBHelper.getGw2DBID(dataObj),name,dataObj["t"],getImgOrTextDesc(name,dataObj,bbCodeData)))}for(i=0;i<tmpArr.length;i++)result+=
tmpArr[i]+(bbCodeData.showAsText&&i!==tmpArr.length-1?" ":"");return result};var generateBBCodeFor=function(id,gw2dbId,name,type,imgOrTextDesc){return"<a href='{0}' class='gw2DBTooltip gw2DB_{1}_{2}'>{3}</a>".format(getGoToUrl(gw2dbId,name,type),gw2Global.types_names[type],id,imgOrTextDesc)};var getGoToUrl=function(id,name,type){if(gw2Global.onClickGoTo==="gw2Wiki")return"{0}/{1}".format(gw2Global.gw2WikiUrl,get_wikiElement_name(name));else if(gw2Global.onClickGoTo==="gw2DB")return"{0}/{1}/{2}".format(gw2Global.gw2DBUrl,
gw2Global.types_names[type],id);else return"#"};var get_wikiElement_name=function(gw2ElementName){return gw2ElementName.replace(/\s/g,"-").replace(/['"!]/g,"")};var getImgOrTextDesc=function(name,dataObj,bbCodeData){if(bbCodeData.showAsText)return getImg(dataObj,bbCodeData,true)+name;else return getImg(dataObj,bbCodeData,false)};var getImg=function(dataObj,bbCodeData,small){var id=dataObj["id"],prof=dataObj["p"]||"",type=dataObj["t"],traitIdx=dataObj["ti"],gw2db=dataObj["gw2db"]||0,folder=gw2Global.types_names[type],
imgTag="";if(gw2db!==0)id=gw2db;if((folder||"")==="")throw new Error("Undefined img folder for type:"+type+" !");imgTag="<img src='{0}/{1}/{2}.png'"+(small?" style='width:18px;height:18px;vertical-align:text-bottom;'":"")+">";if(type==="tr"&&(prof===""||traitIdx===0))return imgTag.format(gw2Global.imagesUrl,folder,traitIdx);else if(type==="tr"&&prof!==""&&traitIdx===0)return imgTag.format(gw2Global.imagesUrl,folder,prof);else return imgTag.format(gw2Global.imagesUrl,folder,id)};var getNameFrom=function(dataObj,
preferredLang,mainLang){var result=dataObj["names"][preferredLang];if((result||"")!=="")return result;else return dataObj["names"][mainLang]||""};var weaponSwapWrapper=function(content1,content2){var tnSet2=(content2||"")!=="";return"<div class='gw2BBCode_weaponSetWraper'>{0}<div class='gw2BBCode_weaponSet'>{1}</div>{2}</div>".format(tnSet2?"<div class='gw2BBCode_weaponSwap'></div>":"",content1,tnSet2?"<div class='gw2BBCode_weaponSet' style='display:none;'>{0}</div>".format(content2):"")}};HTMLProcessor=function(contentGenerator,patternFinders){var contentGenerator=contentGenerator;var patternFinders=patternFinders;var excludes="html,head,style,title,link,meta,script,object,iframe,code,textarea,a";excludes+=",";this.processAll=function(){this.processNode(document.body)};this.processNode=function(node){if(node===null||node=="undefined")return;var childNodes=node.childNodes,i=0,bbCodeDataArr=null,currentNode=null;for(i=0;i<childNodes.length;i++){currentNode=childNodes[i];if(currentNode.nodeType===
1&&(excludes+",").indexOf(currentNode.nodeName.toLowerCase()+",")===-1)this.processNode(currentNode);if(currentNode.nodeType!==3||(currentNode.data||"").trim()==="")continue;bbCodeDataArr=patternFinders.find(currentNode.data);if(bbCodeDataArr.length!==0)generateBBCodeContentIn(currentNode,bbCodeDataArr,contentGenerator)}};var generateBBCodeContentIn=function(node,bbCodeDataArr,contentGenerator){var parent=node.parentNode,bbCodeDataArrLength=bbCodeDataArr.length,html=node.data,i=0,bbCodeData=null,
wrap=null,frag=null;for(i=0;i<bbCodeDataArrLength;i++){bbCodeData=bbCodeDataArr[i];if(bbCodeData.isCorrect())html=html.replace(bbCodeData.regex,contentGenerator.getBBCode(bbCodeData))}if(html===node.data)return;wrap=document.createElement("div");frag=document.createDocumentFragment();wrap.innerHTML=html;while(wrap.firstChild)frag.appendChild(wrap.firstChild);parent.insertBefore(frag,node);parent.removeChild(node)}};Gw2DataMap=function(gw2Global,resourceMgr,resourceList){this.dataMap={};this.nameMap={};var resourceMgr=resourceMgr;var gw2Global=gw2Global;var upToDate=true;var dataMapName="Gw2DataMap";var nameMapName="Gw2NameMap";this.init=function(resourceList){var i=0;if(!resourceMgr.isUpToDate(gw2Global.main_pack["url"],gw2Global.main_pack["ver"])){upToDate=false;resourceList.push(gw2Global.main_pack)}for(i=0;i<gw2Global.lang_packs.length;i++)if(!resourceMgr.isUpToDate(gw2Global.lang_packs[i]["url"],gw2Global.lang_packs[i]["ver"])){upToDate=
false;resourceList.push(gw2Global.lang_packs[i])}};this.init(resourceList);this.findDataAndNameFor=function(bbCodeData){var dataObj=null;if(bbCodeData.entry1!==null){dataObj=getDataObjectForName(this,bbCodeData.entry1.name,bbCodeData);if(dataObj!==null){bbCodeData.entry1.dataObj=dataObj["data"];bbCodeData.entry1.nameObj=dataObj["name"];bbCodeData.entry1.fillWeaponSetData(this)}}if(bbCodeData.entry2!==null){dataObj=getDataObjectForName(this,bbCodeData.entry2.name,bbCodeData);if(dataObj!==null){bbCodeData.entry2.dataObj=
dataObj["data"];bbCodeData.entry2.nameObj=dataObj["name"];bbCodeData.entry2.fillWeaponSetData(this)}}};this.fillGw2DataMap=function(){if(upToDate===true){this.dataMap=resourceMgr.getResource(dataMapName,1);this.nameMap=resourceMgr.getResource(nameMapName,1);upToDate=this.dataMap!==null&&this.nameMap!==null}if(!upToDate){var i,j,pack=null,currentItem,p;this.dataMap={};this.nameMap={};pack=resourceMgr.getResource(gw2Global.main_pack["url"],gw2Global.main_pack["ver"]);for(i=0;i<pack.length;i++){currentItem=
pack[i];currentItem["names"]={"en":currentItem["n"]};this.dataMap[currentItem["id"]]=currentItem;this.nameMap[getArrayIDFor(currentItem["n"])]=this.nameMap[getArrayIDFor(currentItem["n"])]||[];this.nameMap[getArrayIDFor(currentItem["n"])].push({"id":currentItem["id"],"n":currentItem["n"],"lang":"en","data":currentItem})}for(i=0;i<gw2Global.lang_packs.length;i++){pack=resourceMgr.getResource(gw2Global.lang_packs[i]["url"],gw2Global.lang_packs[i]["ver"]);for(j=0;j<pack.names.length;j++){currentItem=
pack.names[j];if((this.dataMap[currentItem[0]]||null)===null){console.log("ERROR: no data for id:{0}, name:{1} in langPack:{2}".format(currentItem[0],currentItem[1],pack["lang"]));this.dataMap[currentItem[0]]={"id":currentItem[0],"name":currentItem[1],"t":"?","names":{}}}this.nameMap[getArrayIDFor(currentItem[1])]=this.nameMap[getArrayIDFor(currentItem[1])]||[];this.nameMap[getArrayIDFor(currentItem[1])].push({"id":currentItem[0],"n":currentItem[1],"lang":pack["lang"],"data":this.dataMap[currentItem[0]]});
this.dataMap[currentItem[0]]["names"][pack["lang"]]=currentItem[1]}}for(p in this.nameMap)if(p.indexOf("gw2_")!==-1)this.nameMap[p].sort(compare);resourceMgr.putResource(dataMapName,this.dataMap,1,0);resourceMgr.putResource(nameMapName,this.nameMap,1,0);upToDate=true}};var getDataObjectForName=function(gw2DataMap,name,bbCodeData){var arr,i,matchedIdx=0,data=null,nameLow=name.toLowerCase();if(name==="")return null;arr=gw2DataMap.nameMap[getArrayIDFor(name)]||null;if(arr===null)return null;for(i=0;i<
arr.length;i++)if(arr[i]["n"].toLowerCase()===nameLow){data=gw2DataMap.dataMap[arr[i]["id"]]||null;if(data===null)throw new Error("no data for "+name);if((bbCodeData.stance!==""&&compareStrLow(bbCodeData.stance,data["st"]||"")||bbCodeData.stance==="")&&(bbCodeData.type!==""&&compareStrLow(bbCodeData.type,data["t"]||"")||bbCodeData.type==="")&&(bbCodeData.prof!==""&&compareStrLow(bbCodeData.prof,data["p"]||"")||bbCodeData.prof==="")&&++matchedIdx===bbCodeData.forcedIdx)return{"data":data,"name":arr[i]}}return null};
var getArrayIDFor=function(name){return"gw2_"+name.substr(0,3).toLowerCase()};var compare=function compare(a,b){if(a["n"]===b["n"]){if(a.data.t==="b"||a.data.t==="co")return-1;if(b.data.t==="b"||b.data.t==="co")return 1;if(a.id>0&&b.id>0||a.id<0&&b.id<0)return a.id>b.id?-1:1;else return a.id>0?-1:1}else return a.n>b.n?1:-1}};Gw2DBValidator=function(gw2Global,gw2DataMap){var gw2Global=gw2Global;var gw2DataMap=gw2DataMap;var tasks=[];var i=0;var __element=null;var __counter=null;var __taskList=null;this.validDB=function(element,counter){if(!gw2BBCode.isLoadedAndReady()){alert("not loaded yet");return}__element=element;__counter=counter;var task,p,dataObj;for(p in gw2DataMap.dataMap){dataObj=gw2DataMap.dataMap[p];if(dataObj&&dataObj["id"]&&dataObj["id"]>=0){task=new JSONTask(gw2Global.gw2DB_PopupHost.format(gw2Global.types_names[dataObj["t"]],
Gw2DBHelper.getGw2DBID(dataObj)));task.dataObj=dataObj;tasks.push(task)}}processNextTask()};this.validMacros=function(element){var i,p,dataObj;for(p in gw2DataMap.dataMap){dataObj=gw2DataMap.dataMap[p];if(dataObj&&dataObj["id"]&&dataObj["id"]<0)for(i=0;i<dataObj["m"].length;i++)if(!gw2DataMap.dataMap[dataObj["m"][i]])element.innerHTML+="[ERROR] id: {0} name: {1} prof: {2} idx: {3} || No data for id: <A href='{4}'>{5}</a><br>".format(dataObj["id"],dataObj["n"],dataObj["p"],i.toString(),gw2Global.gw2DB_PopupHost.format("skills",
dataObj["id"]),dataObj["m"][i])}element.innerHTML+="DONE<BR>"};this.validUniqnessOfIDS=function(element){var p,dataObj,reg={};for(p in gw2DataMap.dataMap){dataObj=gw2DataMap.dataMap[p];if(dataObj&&dataObj["id"]){if(reg[dataObj["id"]])element.innerHTML+="[ERROR] doubled ID={0}<br>".format(dataObj["id"]);reg[dataObj["id"]]=true}}element.innerHTML+="DONE<BR>"};var processNextTask=function(){if(i<tasks.length){__taskList=new TaskList(5);__taskList.addTask(tasks[i++]);__taskList.success(function(){processNextTask()});
__taskList.error(function(taskList){var id=taskList.tasks[0].dataObj["id"],name=taskList.tasks[0].dataObj["n"],url=taskList.tasks[0].url;__element.innerHTML+="[ERROR] id: {0} name: {1} <A HREF='{2}'>{2}</a> <A HREF='http://www.gw2db.com/search?search={1}'>Search for</a><br>".format(id,name,url);processNextTask()});__taskList.doWork();__counter.innerHTML="Processed {0}/{1}".format(i.toString(),tasks.length.toString())}else __element.innerHTML+="DONE<BR>"}};Gw2BBCode=function(){var self=this;var documentReady=false;var resourcesLoaded=false;this.gw2Global=new Gw2BBCodeGlobal;this.validator=null;var processor=null;var gw2DataMap=null;var resourceMgr=null;var patternFinders=null;var contentGenerator=null;var weaponSwapHelper=null;var tooltipContentObj=null;var syndicationPlugin=new Gw2DBSyndicationPlugin;var gw2TooltipMgr=null;this.isLoadedAndReady=function(){return resourcesLoaded&&documentReady};this.processNode=function(node){if(!self.isLoadedAndReady())return false;
processor.processNode(node);registerAllHandlers();return true};var init=function(){if(LocalStorageHelper.isSupported())resourceMgr=new ResourceManager;else resourceMgr=new NoLocalStorageResourceManager;var resourceList=[];loadStyle(self.gw2Global.gw2_cssURL);loadStyle(self.gw2Global.popup_cssURL);tooltipContentObj=new Gw2TooltipContentObj(self.gw2Global,resourceMgr);gw2TooltipMgr=new NestedTooltipMgr(tooltipContentObj,onTooltipContentChanged);gw2DataMap=new Gw2DataMap(self.gw2Global,resourceMgr,resourceList);
patternFinders=new PatternFinders(gw2DataMap);contentGenerator=new Gw2DBCOMGenerator(self.gw2Global);processor=new HTMLProcessor(contentGenerator,patternFinders);weaponSwapHelper=new WeaponSwapHelper(gw2TooltipMgr);self.validator=typeof Gw2DBValidator!=="undefined"?new Gw2DBValidator(self.gw2Global,gw2DataMap):null;resourceMgr.loadResourceList(resourceList,onResourcesLoaded);jQuery(document).ready(onDocumentReady)};var onResourcesLoaded=function(resources){resourcesLoaded=true;gw2DataMap.fillGw2DataMap();
patternFinders.registerPattern(new ClassicPattern(self.gw2Global,resourceMgr));onLoadedAndReady()};var onDocumentReady=function(){documentReady=true;onLoadedAndReady()};var onLoadedAndReady=function(){if(!self.isLoadedAndReady())return;self.processNode(document.body)};var registerAllHandlers=function(){if(!self.isLoadedAndReady())return false;syndicationPlugin.markAllGw2DBLink();weaponSwapHelper.registerWeaponSwapHandlers();gw2TooltipMgr.registerTooltipsHandlers(".gw2DBTooltip");return true};var onTooltipContentChanged=
function(tooltip,tooltipDiv){self.processNode(tooltipDiv)};init()};window["gw2BBCode"]=new Gw2BBCode;var testObject={"one":1,"two":2,"three":3};console.log("isLocalStorageSupported: ",LocalStorageHelper.isSupported());console.log("containsKey: ",LocalStorageHelper.containsKey("obj"));console.log("putObject: ",LocalStorageHelper.putObject("obj",testObject));console.log("containsKey: ",LocalStorageHelper.containsKey("obj"));console.log("getObject: ",LocalStorageHelper.getObject("obj"));console.log("containsKey: ",LocalStorageHelper.containsKey("obj"));console.log("remove: ",LocalStorageHelper.remove("obj"));
console.log("containsKey: ",LocalStorageHelper.containsKey("obj"));var taskList=new TaskList(30);taskList.success(function(taskList){console.log("AsyncTaskList: done")});taskList.error(function(taskList,errorMsg){console.log("Error "+errorMsg)});taskList.doWork();
