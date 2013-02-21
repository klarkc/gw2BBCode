function loadStyle(libUrl){var link=document.createElement("link");link.rel="stylesheet";link.type="text/css";link.href=libUrl;link.media="all";document.getElementsByTagName("head")[0].appendChild(link)}function compareStrLow(a,b){return a.toLowerCase()===b.toLowerCase()}String.prototype.format=function(){var args=arguments;return this.replace(/{(\d+)}/g,function(match,number){return typeof args[number]!="undefined"?args[number]:match})};Task=function(){this.status=0;this.workFn=null;this.errorFn=null;this.successFn=null};Task.prototype.isDone=function(){return this.status===2};Task.prototype.error=function(errorFn){this.errorFn=errorFn;return this};Task.prototype.success=function(successFn){this.successFn=successFn;return this};
Task.prototype.doWork=function(){if(this.isDone())return;if((this.workFn||null)==null)throw new Error("workFn not defined");if((this.errorFn||null)==null)throw new Error("errorFn not defined");if((this.successFn||null)==null)throw new Error("successFn not defined");this.status=1;this.workFn(this)};JSONTask=function(url){this.url=url||"";this.data=null;this.workFn=function(){var self=this;jQuery.getJSON(this.url).success(function(data){self.status=2;self.data=data;self.successFn(self)}).error(function(jqXhr,textStatus,error){self.status=-1;self.errorFn(self,"Error while retrieving data from "+self.url+" . ("+textStatus+")")})}};JSONTask.prototype=new Task;TaskList=function(timeout){this.timeout=(typeof tasksTimeout!=="undefined"?tasksTimeout:15)*1E3;this.tasks=[];var __timeout=null;this.clear=function(){this.tasks=[];this.status=0};this.addTask=function(task){var self=this;this.tasks.push(task.success(function(data){if(self.status!==-1&&self.isDone()){clearTimeout(__timeout);self.status=2;self.successFn(self)}}).error(function(textStatus){clearTimeout(__timeout);self.status=-1;self.errorFn(self,"Error while retrieving data. ("+textStatus+")")}))};
this.workFn=function(){var self=this,i=0;if(this.timeout!==null&&this.timeout>0)__timeout=setTimeout(function(){self.status=-1;throw new Error("TaskList: timeout reached.");},this.timeout);for(i=0;i<this.tasks.length;i++)this.tasks[i].doWork();if(this.tasks.length===0)this.successFn(this)};this.isDone=function(){for(var i=0;i<this.tasks.length;i++)if(!this.tasks[i].isDone())return false;return true}};TaskList.prototype=new Task;function LocalStorageHelper(){}LocalStorageHelper.isSupported=function(){return typeof Storage!=="undefined"&&JSON!=="undefined"};LocalStorageHelper.putObject=function(key,object,version,ttl){var storageObj={"data":object,"ver":Math.max(1,version||0),"ttl":Math.max(0,ttl||0),"created":Date.now()};localStorage.setItem(key,JSON.stringify(storageObj))};
LocalStorageHelper.getObject=function(key,version){var storageObj=JSON.parse(localStorage.getItem(key));if(this.isValid(storageObj,version))return storageObj.data;else return null};LocalStorageHelper.containsKey=function(key){return localStorage.getItem(key)!==null};LocalStorageHelper.remove=function(key){localStorage.removeItem(key)};LocalStorageHelper.clear=function(){localStorage.clear()};
LocalStorageHelper.isValid=function(storageObj,version){return storageObj!==null&&storageObj["ver"]===version&&(storageObj["ttl"]===0||storageObj["ttl"]!==0&&storageObj["created"]+storageObj["ttl"]<Date.now())};LocalStorageHelper.isUpToDate=function(key,ver){return LocalStorageHelper.getObject(key,ver)!==null};Gw2BBCodeGlobal=function(){this.imagesUrl="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/gw2_images";this.contentUrl="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/NEXT/";this.popup_cssURL="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/tooltip.css";this.gw2_cssURL="https://s3-eu-west-1.amazonaws.com/gw2bbcode.pl/gw2BBCode.css";this.main_pack={"url":this.contentUrl+"main_resource_pack.json","ver":2};this.stances_langEn=["air","earth","fire","water"];this.prof_s_langEn=["el","en","gu","me","ne",
"ra","th","wa"];this.prof_l_langEn=["Elementalist","Engineer","Guardian","Mesmer","Necromancer","Ranger","Thief","Warrior"];this.types_langEn=["skill","trait","boon","condition"];this.lang_packs=[{"url":this.contentUrl+"lang_pack_fr.json","ver":1,"lang":"fr"}];this.element_type={"s":"skills","tr":"traits","b":"boons","co":"conditions"};this.gw2WikiUrl="http://wiki.guildwars2.com/wiki";this.gw2DBUrl="http://www.gw2db.com";this.onClickGoTo="gw2DB";this.gw2DB_PopupHost="http://www.gw2db.com/{0}/{1}/tooltip?x&advanced=1&callback=?"};LoadResourceTask=function(gw2ResourceUrl,version,ttl){this.data=null;this.ttl=ttl;this.version=version;this.gw2ResourceUrl=gw2ResourceUrl;this.workFn=function(){var self=this,storageObj=null,JSONtask=null;if(LocalStorageHelper.isSupported())storageObj=LocalStorageHelper.getObject(this.gw2ResourceUrl,this.version);if(storageObj!==null){self.status=2;self.data=storageObj.data;self.successFn(self)}else{JSONtask=(new JSONTask(this.gw2ResourceUrl)).success(function(task){self.data=task.data;LocalStorageHelper.putObject(self.gw2ResourceUrl,
self.data,self.version,self.ttl);self.status=2;self.successFn(self)}).error(function(task,errorMsg){self.status=-1;self.errorFn(self,errorMsg)});JSONtask.doWork()}}};LoadResourceTask.prototype=new Task;ResourceManager=function(){this.loadResource=function(resourceUrl,version,ttl,callback){this.getResourceList([{"url":Gw2BBCodeConst.contentUrl+resourceUrl,"ver":version,"ttl":ttl,"data":null}],callback)};this.loadResourceList=function(resourceArr,callback){if(resourceArr===null||resourceArr.length===0)callback(resourceArr);else{var taskList=new TaskList(30),i=0;taskList.resourceArr=resourceArr;taskList.callback=callback;for(i=0;i<resourceArr.length;i++)taskList.addTask(new LoadResourceTask(resourceArr[i]["url"],
resourceArr[i]["ver"]||1,resourceArr[i]["ttl"]||0));taskList.success(function(taskList){for(var i=0;i<taskList.tasks.length;i++)taskList.resourceArr[i].data=taskList.tasks[i].data;taskList.callback(taskList.resourceArr)}).error(function(taskList,errorMsg){throw new Error(errorMsg);});taskList.doWork()}};this.isUpToDate=function(url,ver){return LocalStorageHelper.isSupported()&&LocalStorageHelper.isUpToDate(url,ver)};this.isUpToDateArr=function(arr){var i;for(i=0;i<arr.length;i++)if(!this.isUpToDate(arr[i]["url"],
arr[i]["ver"]))return false;return true};this.getResource=function(resourceUrl,version){return LocalStorageHelper.getObject(resourceUrl,version)};this.putResource=function(resourceUrl,data,version,ttl){LocalStorageHelper.putObject(resourceUrl,data,version,ttl)}};
NoLocalStorageResourceManager=function(){this.resources={};this.getResource=function(resourceUrl,version,ttl,callback){this.getResourceList([{"url":resourceUrl,"ver":version,"ttl":ttl,"data":null}],callback)};this.getResourceList=function(resourceList,callback){}};function LangPackHelper(){}LangPackHelper.getExprStr_profs=function(gw2Global,resourceMgr){return LangPackHelper.getExprStr_generic(gw2Global,resourceMgr,gw2Global.prof_s_langEn,"prof")};LangPackHelper.getExprStr_stances=function(gw2Global,resourceMgr){return LangPackHelper.getExprStr_generic(gw2Global,resourceMgr,gw2Global.stances_langEn,"stance")};
LangPackHelper.getExprStr_types=function(gw2Global,resourceMgr){return LangPackHelper.getExprStr_generic(gw2Global,resourceMgr,gw2Global.types_langEn,"types")};
LangPackHelper.getExprStr_generic=function(gw2Global,resourceMgr,masterPack_arr,dictName){var i=0,j=0,pack=null,result="";for(i=0;i<masterPack_arr.length;i++)result+=masterPack_arr[i]+"|";for(i=0;i<gw2Global.lang_packs.length;i++){pack=resourceMgr.getResource(gw2Global.lang_packs[i]["url"],gw2Global.lang_packs[i]["ver"]);if(pack===null)continue;for(j=0;j<pack.dicts[dictName].length;j++)if(result.indexOf(pack.dicts[dictName][j])===-1)result+=pack.dicts[dictName][j]+"|"}return result.slice(0,result.length-
1)};LangPackHelper.getProfIDFrom=function(gw2Global,resourceMgr,profStr){return LangPackHelper.getMasterItemIDFor(gw2Global,resourceMgr,profStr,gw2Global.prof_s_langEn,"prof")};LangPackHelper.getStanceIDFrom=function(gw2Global,resourceMgr,stanceStr){return LangPackHelper.getMasterItemIDFor(gw2Global,resourceMgr,stanceStr,gw2Global.stances_langEn,"stance")};
LangPackHelper.getTypeIDFrom=function(gw2Global,resourceMgr,typeStr){return LangPackHelper.getMasterItemIDFor(gw2Global,resourceMgr,typeStr,gw2Global.types_langEn,"types")};
LangPackHelper.getMasterItemIDFor=function(gw2Global,resourceMgr,itemStr,masterPack_arr,dictName){if(itemStr==="")return"";var i=0,j=0,pack=null,itemLow=itemStr.toLowerCase();for(i=0;i<masterPack_arr.length;i++)if(itemLow===masterPack_arr[i].toLowerCase())return masterPack_arr[i];for(i=0;i<gw2Global.lang_packs.length;i++){pack=resourceMgr.getResource(gw2Global.lang_packs[i]["url"],gw2Global.lang_packs[i]["ver"]);if(pack===null)continue;for(j=0;j<pack.dicts[dictName].length&&j<masterPack_arr.length;j++)if(itemLow===
pack.dicts[dictName][j].toLowerCase())return masterPack_arr[j]}return""};BBCodeDataEntry=function(name){this.name=name;this.dataObj=null;this.nameObj=null;this.isMacro=function(){return this.dataObj!==null&&this.dataObj["t"]==="m"};this.dataObjSet=[];this.fillWeaponSetData=function(gw2DataMap){if(this.isMacro())for(var i=0;i<this.dataObj["m"].length;i++)this.dataObjSet.push(gw2DataMap.dataMap[this.dataObj["m"][i]])}};
BBCodeData=function(gw2Global,resourceMgr,patternType){this.gw2Global=gw2Global;this.resourceMgr=resourceMgr;this.patternType=patternType;this.orig="";this.regex="";this.entry1=null;this.entry2=null;this.showAsText=false;this.isPrefixed=false;this.options="";this.stance="";this.forcedIdx=-1;this.type="";this.prof="";this.isWeaponSet=function(){return this.entry1!==null&&this.entry2!==null};this.toString=function(){return"regex: "+this.regex+"<br>"+"name1: "+this.name1+"<br>"+"name2: "+this.name2+
"<br>"+"showAsText: "+this.showAsText+"<br>"+"isPrefixed: "+this.isPrefixed+"<br>"+"stance: "+this.stance+"<br>"+"forcedIdx: "+this.forcedIdx+"<br>"+"type: "+this.type+"<br>"+"prof: "+this.prof+"<br><br>"};this.setStance=function(stanceStr){this.stance=LangPackHelper.getStanceIDFrom(gw2Global,resourceMgr,stanceStr)};this.setType=function(typeStr){this.type=LangPackHelper.getTypeIDFrom(gw2Global,resourceMgr,typeStr)};this.setProfession=function(profStr){this.prof=LangPackHelper.getProfIDFrom(gw2Global,
resourceMgr,profStr)};this.isCorrect=function(){if(this.entry1===null&&this.entry2!==null)return false;if(this.entry1!==null&&(this.entry1.dataObj===null||this.entry1.dataObj===null))return false;if(this.entry2!==null&&(this.entry2.dataObj===null||this.entry2.dataObj===null))return false;return true}};ClassicPattern=function(gw2Global,resourceMgr){var resourceMgr=resourceMgr;var gw2Global=gw2Global;var regExpr=new RegExp("\\[([@^_]*)(gw2:)?(("+LangPackHelper.getExprStr_profs(gw2Global,resourceMgr)+"):)?(("+LangPackHelper.getExprStr_types(gw2Global,resourceMgr)+"):)?(.*?)(\\|(.*?))?(:("+LangPackHelper.getExprStr_stances(gw2Global,resourceMgr)+"))?(\\.(\\d+))?\\]","gi");this.process=function(data){var result=[],match=regExpr.exec(data),finded=null;while(match!==null){finded=getResultForMatch(match);
match=regExpr.exec(data);result.push(finded)}return result};var getResultForMatch=function(match){var result=new BBCodeData(gw2Global,resourceMgr,"gw2BBCode");result.orig=match[0]||"";result.regex=new RegExp((match[0]||"").replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1"),"gi");result.showAsText=(match[1]||"").indexOf("@")!==-1;result.options=match[1]||"";result.isPrefixed=(match[2]||"").toLowerCase()==="gw2:";result.entry1=(match[7]||"")!==""?new BBCodeDataEntry(match[7]):null;result.entry2=(match[9]||"")!==
""?new BBCodeDataEntry(match[9]):null;result.forcedIdx=Math.max(1,match[13]||1);result.setProfession(match[4]||"");result.setType(match[6]||"");result.setStance(match[11]||"");return result}};TooltipMgr=function(gw2Global,resourceMgr){var tndoHide=false;var popup=null;var popup_info={id:-1,type:"",dispatcher:null};var self=this;var gw2Global=gw2Global;var resourceMgr=resourceMgr;var popup_cache=[];this.initPopups=function(){popup=document.createElement("div");popup.setAttribute("id","db-tooltip-container");document.getElementsByTagName("body")[0].appendChild(popup);this.registerTooltipsHandlers()};this.registerTooltipsHandlers=function(){jQuery(".gw2DBTooltip").each(function(){registerTooltipsHandler(this)});
jQuery(popup).unbind("mouseenter").mouseenter(function(eventObject){tndoHide=false}).unbind("mouseleave").mouseleave(function(eventObject){self.hideIn(150)})};this.showPopup=function(msg){tndoHide=false;jQuery(popup).css("display","none");jQuery(popup).html(msg);jQuery(".p-tooltip-image,.db-image").css("display","none");calculatePopupPosition();jQuery(popup).css("display","inline")};this.hideIn=function(milisec){if(tndoHide)return;tndoHide=true;setTimeout(this.hidePopup,milisec)};this.hidePopup=function(force){if(!force&&
!tndoHide)return;tndoHide=false;popup_info={id:-1,type:"",dispatcher:null};jQuery(popup).css("display","none");jQuery(popup).html=""};var registerTooltipsHandler=function(element){jQuery(element).unbind("mouseenter").mouseenter(mouseEnterHandler).unbind("mouseleave").mouseleave(function(eventObject){self.hideIn(150)})};var mouseEnterHandler=function(eventObject){var match=/gw2DB_(skills|tasks|traits|items|recipes|achievements|creatures|boons|conditions|guildupgrades)_(\d+)/.exec(this.getAttribute("class").toString());
if(!match)return;tndoHide=false;if(popup_info.id==match[2]&&popup_info.type==match[1]&&(popup_info.dispatcher===eventObject.currentTarget||popup_info.dispatcher===popup))return;jQuery(popup).css("top",eventObject.pageY+10);jQuery(popup).css("left",eventObject.pageX+10);popup_info={id:match[2],type:match[1],dispatcher:eventObject.currentTarget};self.showPopup("<div class='db-tooltip'><div class='db-description' style='width: auto'>Loading..</div></div>");loadData(match[1],match[2])};var calculatePopupPosition=
function(){var top=jQuery(popup).css("top").replace("px","");var left=jQuery(popup).css("left").replace("px","");if(popup_info.dispatcher){dispatcher=popup_info.dispatcher;var newTop=Math.max(1,jQuery(dispatcher).offset().top+jQuery(dispatcher).height()-3);if(newTop>jQuery(window).height()+jQuery(window).scrollTop()-jQuery(popup).outerHeight()-5)newTop=jQuery(dispatcher).offset().top+jQuery(dispatcher).height()-computeHeightOf(dispatcher)-jQuery(popup).outerHeight()-5;var newLeft=jQuery(dispatcher).offset().left;
if(newLeft>jQuery(window).width()+jQuery(window).scrollLeft()-367)newLeft=Math.min(left,jQuery(dispatcher).offset().left+jQuery(dispatcher).outerWidth()-367);jQuery(popup).css("top",newTop);jQuery(popup).css("left",newLeft)}};var computeHeightOf=function(obj){var result=jQuery(obj).height();jQuery(obj).children().each(function(){result=Math.max(result,computeHeightOf(this))});return result};var loadData=function(type,id){var data_fromCache=getFromCache(type,id);if(data_fromCache)self.showPopup(data_fromCache);
else jQuery.getJSON(gw2Global.gw2DB_PopupHost.format(type,id),function(data){saveInCache(type,id,formatResult(data));if(popup_info.id==-1||popup_info.id!=id||popup_info.type!=type)return;self.showPopup(formatResult(data))})};var getFromCache=function(type,id){for(var i=0;i<popup_cache.length;i++)if(popup_cache[i].id==id&&popup_cache[i].type==type)return popup_cache[i].data;return null};var saveInCache=function(type,id,data){if(!getFromCache(type,id)){var newData={"id":id,"type":type,"data":data};
popup_cache.push(newData)}};var formatResult=function(data){return data["Tooltip"].replace(/<div class="db-image">\s+<img src=".*?\/>\s+<\/div>/g,"").replace('<a href="','<a href="'+gw2Global.gw2DBUrl)}};WeaponSwapHelper=function(tooltipMgr){var tooltipMgr=tooltipMgr;this.registerWeaponSwapHandlers=function(){jQuery(".gw2BBCode_weaponSwap").unbind("click").click(weaponSwapHandler)};var weaponSwapHandler=function(event){if(typeof window.getSelection().removeAllRanges!=="undefined")window.getSelection().removeAllRanges();jQuery(event.target.parentElement).find(".gw2BBCode_weaponSet").each(function(){jQuery(this).css("display",jQuery(this).css("display")=="inline"?"none":"inline")});tooltipMgr.hidePopup(true)}};PatternFinders=function(gw2DataMap){this.registeredPatterns=[];var gw2DataMap=gw2DataMap;this.registerPattern=function(pattern){this.registeredPatterns.push(pattern)};this.find=function(data){var result=[],i=0,j=0,bbCodeArr;for(i=0;i<this.registeredPatterns.length;i++){bbCodeArr=this.registeredPatterns[i].process(data);for(j=0;j<bbCodeArr.length;j++)result.push(bbCodeArr[j])}for(i=0;i<result.length;i++)gw2DataMap.findDataAndNameFor(result[i]);return result}};Gw2DBCOMGenerator=function(gw2Global){var gw2Global=gw2Global;this.getBBCode=function(bbCodeData){var content1="",content2="";if(bbCodeData.entry1!==null&&!bbCodeData.entry1.isMacro())content1=getBBCodeForItem(bbCodeData.entry1,bbCodeData);else if(bbCodeData.entry1!==null&&bbCodeData.entry1.isMacro())content1=getBBCodeForMacro(bbCodeData.entry1,bbCodeData);if(bbCodeData.entry2!==null&&!bbCodeData.entry2.isMacro())content2=getBBCodeForItem(bbCodeData.entry2,bbCodeData);else if(bbCodeData.entry2!==
null&&bbCodeData.entry2.isMacro())content2=getBBCodeForMacro(bbCodeData.entry2,bbCodeData);if(content1!==""&&content2==="")return content1;else if(content1!==""&&content2!=="")return weaponSwapWrapper(content1,content2);else return bbCodeData.orig};var getBBCodeForItem=function(entry,bbCodeData){var dataObj=entry.dataObj,name=getNameFrom(dataObj,entry.nameObj["lang"],"en");return generateBBCodeFor(dataObj["id"],name,dataObj["t"],getImgOrTextDesc(name,dataObj,bbCodeData))};var getBBCodeForMacro=function(entry,
bbCodeData){var i,tmpArr=[],dataObj=null,name="",result="";for(i=0;i<entry.dataObj["m"].length;i++){dataObj=entry.dataObjSet[i];name=getNameFrom(dataObj,entry.nameObj["lang"],"en");tmpArr.push(generateBBCodeFor(dataObj["id"],name,dataObj["t"],getImgOrTextDesc(name,dataObj,bbCodeData)))}for(i=0;i<tmpArr.length;i++)result+=tmpArr[i]+(bbCodeData.showAsText&&i!==tmpArr.length-1?" ":"");return result};var generateBBCodeFor=function(id,name,type,imgOrTextDesc){return"<a href='{0}' class='gw2DBTooltip gw2DB_{1}_{2}'>{3}</a>".format(getGoToUrl(id,
name,type),gw2Global.element_type[type],id,imgOrTextDesc)};var getGoToUrl=function(id,name,type){if(gw2Global.onClickGoTo==="gw2Wiki")return"{0}/{1}".format(gw2Global.gw2WikiUrl,get_wikiElement_name(name));else if(gw2Global.onClickGoTo==="gw2DB")return"{0}/{1}/{2}".format(gw2Global.gw2DBUrl,gw2Global.element_type[type],id);else return"#"};var get_wikiElement_name=function(gw2ElementName){return gw2ElementName.replace(/\s/g,"-").replace(/['"!]/g,"")};var getImgOrTextDesc=function(name,dataObj,bbCodeData){if(bbCodeData.showAsText)return name;
else return getImg(dataObj["t"],dataObj["tr"]||"",dataObj["id"],bbCodeData)};var getImg=function(type,traitIdx,id,bbCodeData){if(type==="tr")return"<img src='{0}/{1}/{2}.png'>".format(gw2Global.imagesUrl,gw2Global.element_type[type],traitIdx);else return"<img src='{0}/{1}/{2}.png'>".format(gw2Global.imagesUrl,gw2Global.element_type[type],id)};var getNameFrom=function(dataObj,preferredLang,mainLang){var result=dataObj["names"][preferredLang];if(result||""!=="")return result;else return dataObj["names"][mainLang]||
""};var weaponSwapWrapper=function(content1,content2){var tnSet2=(content2||"")!=="";return"<div class='gw2BBCode_weaponSetWraper'>{0}<div class='gw2BBCode_weaponSet'>{1}</div>{2}</div>".format(tnSet2?"<div class='gw2BBCode_weaponSwap'></div>":"",content1,tnSet2?"<div class='gw2BBCode_weaponSet' style='display:none;'>{0}</div>".format(content2):"")}};HTMLProcessor=function(contentGenerator,patternFinders){var contentGenerator=contentGenerator;var patternFinders=patternFinders;var excludes="html,head,style,title,link,meta,script,object,iframe,code,textarea,a";excludes+=",";this.processAll=function(){this.processNode(document.body)};this.processNode=function(node){if(node===null||node=="undefined")return;var childNodes=node.childNodes,i=0,bbCodeDataArr=null,currentNode=null;for(i=0;i<childNodes.length;i++){currentNode=childNodes[i];if(currentNode.nodeType===
1&&(excludes+",").indexOf(currentNode.nodeName.toLowerCase()+",")===-1)this.processNode(currentNode);if(currentNode.nodeType!==3||(currentNode.data||"").trim()==="")continue;bbCodeDataArr=patternFinders.find(currentNode.data);if(bbCodeDataArr.length!==0)generateBBCodeContentIn(currentNode,bbCodeDataArr,contentGenerator)}};var generateBBCodeContentIn=function(node,bbCodeDataArr,contentGenerator){var parent=node.parentNode,bbCodeDataArrLength=bbCodeDataArr.length,html=node.data,i=0,bbCodeData=null,
wrap=null,frag=null;for(i=0;i<bbCodeDataArrLength;i++){bbCodeData=bbCodeDataArr[i];if(bbCodeData.isCorrect())html=html.replace(bbCodeData.regex,contentGenerator.getBBCode(bbCodeData))}if(html===node.data)return;wrap=document.createElement("div");frag=document.createDocumentFragment();wrap.innerHTML=html;while(wrap.firstChild)frag.appendChild(wrap.firstChild);parent.insertBefore(frag,node);parent.removeChild(node)}};Gw2DataMap=function(gw2Global,resourceMgr,resourceList){this.dataMap={};this.nameMap={};var resourceMgr=resourceMgr;var gw2Global=gw2Global;var upToDate=true;var dataMapName="Gw2DataMap";var nameMapName="Gw2NameMap";this.init=function(resourceList){var i=0;if(!resourceMgr.isUpToDate(gw2Global.main_pack["url"],gw2Global.main_pack["ver"])){upToDate=false;resourceList.push(gw2Global.main_pack)}for(i=0;i<gw2Global.lang_packs.length;i++)if(!resourceMgr.isUpToDate(gw2Global.lang_packs[i]["url"],gw2Global.lang_packs[i]["ver"])){upToDate=
false;resourceList.push(gw2Global.lang_packs[i])}};this.init(resourceList);this.findDataAndNameFor=function(bbCodeData){var dataObj=null;if(bbCodeData.entry1!==null){dataObj=getDataObjectForName(this,bbCodeData.entry1.name,bbCodeData);if(dataObj!==null){bbCodeData.entry1.dataObj=dataObj["data"];bbCodeData.entry1.nameObj=dataObj["name"];bbCodeData.entry1.fillWeaponSetData(this)}}if(bbCodeData.entry2!==null){dataObj=getDataObjectForName(this,bbCodeData.entry2.name,bbCodeData);if(dataObj!==null){bbCodeData.entry2.dataObj=
dataObj["data"];bbCodeData.entry2.nameObj=dataObj["name"];bbCodeData.entry2.fillWeaponSetData(this)}}};this.fillGw2DataMap=function(){if(upToDate===true){this.dataMap=resourceMgr.getResource(dataMapName,1);this.nameMap=resourceMgr.getResource(nameMapName,1);upToDate=this.dataMap!==null&&this.nameMap!==null}if(!upToDate){var i,j,pack=null,currentItem,p;this.dataMap={};this.nameMap={};pack=resourceMgr.getResource(gw2Global.main_pack["url"],gw2Global.main_pack["ver"]);for(i=0;i<pack.length;i++){currentItem=
pack[i];currentItem["names"]={"en":currentItem["n"]};this.dataMap[currentItem["id"]]=currentItem;this.nameMap[getArrayIDFor(currentItem["n"])]=this.nameMap[getArrayIDFor(currentItem["n"])]||[];this.nameMap[getArrayIDFor(currentItem["n"])].push({"id":currentItem["id"],"n":currentItem["n"],"lang":"en"})}for(i=0;i<gw2Global.lang_packs.length;i++){pack=resourceMgr.getResource(gw2Global.lang_packs[i]["url"],gw2Global.lang_packs[i]["ver"]);for(j=0;j<pack.names.length;j++){currentItem=pack.names[j];if((this.dataMap[currentItem[0]]||
null)===null){console.log("ERROR: no data for id:{0}, name:{1} in langPack:{2}".format(currentItem[0],currentItem[1],pack["lang"]));this.dataMap[currentItem[0]]={"id":currentItem[0],"name":currentItem[1],"t":"?","names":{}}}this.nameMap[getArrayIDFor(currentItem[1])]=this.nameMap[getArrayIDFor(currentItem[1])]||[];this.nameMap[getArrayIDFor(currentItem[1])].push({"id":currentItem[0],"n":currentItem[1],"lang":pack["lang"]});this.dataMap[currentItem[0]]["names"][pack["lang"]]=currentItem[1]}}for(p in this.nameMap)if(p.indexOf("gw2_")!==
-1)this.nameMap[p].sort(compare);resourceMgr.putResource(dataMapName,this.dataMap,1,0);resourceMgr.putResource(nameMapName,this.nameMap,1,0);upToDate=true}};var getDataObjectForName=function(gw2DataMap,name,bbCodeData){var arr,i,matchedIdx=0,data=null,nameLow=name.toLowerCase();if(name==="")return null;arr=gw2DataMap.nameMap[getArrayIDFor(name)]||null;if(arr===null)return null;for(i=0;i<arr.length;i++)if(arr[i]["n"].toLowerCase()===nameLow){data=gw2DataMap.dataMap[arr[i]["id"]]||null;if(data===null)throw new Error("no data for "+
name);if((bbCodeData.stance!==""&&compareStrLow(bbCodeData.stance,data["st"]||"")||bbCodeData.stance==="")&&(bbCodeData.type!==""&&compareStrLow(bbCodeData.type,data["t"]||"")||bbCodeData.type==="")&&(bbCodeData.prof!==""&&compareStrLow(bbCodeData.prof,data["p"]||"")||bbCodeData.prof==="")&&++matchedIdx===bbCodeData.forcedIdx)return{"data":data,"name":arr[i]}}return null};var getArrayIDFor=function(name){return"gw2_"+name.substr(0,3).toLowerCase()};var compare=function compare(a,b){if(a["n"]===b["n"])if(a.id>
0&&b.id>0||a.id<0&&b.id<0)return a.id>b.id?-1:1;else return a.id>0?-1:1;else return a.n>b.n?1:-1}};Gw2BBCode=function(){var self=this;var documentReady=false;var resourcesLoaded=false;this.gw2Global=new Gw2BBCodeGlobal;this.processor=null;this.gw2DataMap=null;this.tooltipMgr=null;this.resourceMgr=null;this.patternFinders=null;this.contentGenerator=null;this.weaponSwapHelper=null;this.init=function(){if(LocalStorageHelper.isSupported())this.resourceMgr=new ResourceManager;else throw new Error("Not implmeneted yet");var resourceList=[];loadStyle(this.gw2Global.gw2_cssURL);loadStyle(this.gw2Global.popup_cssURL);
this.tooltipMgr=new TooltipMgr(this.gw2Global,this.resourceMgr);this.gw2DataMap=new Gw2DataMap(this.gw2Global,this.resourceMgr,resourceList);this.patternFinders=new PatternFinders(this.gw2DataMap);this.contentGenerator=new Gw2DBCOMGenerator(this.gw2Global);this.processor=new HTMLProcessor(this.contentGenerator,this.patternFinders);this.weaponSwapHelper=new WeaponSwapHelper(this.tooltipMgr);this.resourceMgr.loadResourceList(resourceList,onResourcesLoaded);jQuery(document).ready(onDocumentReady)};this.isLoadedAndReady=
function(){return resourcesLoaded&&documentReady};this.registerAllHandlers=function(){if(!this.isLoadedAndReady())return;this.weaponSwapHelper.registerWeaponSwapHandlers();this.tooltipMgr.registerTooltipsHandlers()};var onResourcesLoaded=function(resources){resourcesLoaded=true;self.gw2DataMap.fillGw2DataMap();self.patternFinders.registerPattern(new ClassicPattern(self.gw2Global,self.resourceMgr));onLoadedAndReady()};var onDocumentReady=function(){documentReady=true;onLoadedAndReady()};var onLoadedAndReady=
function(){if(!self.isLoadedAndReady())return;self.processor.processAll();self.tooltipMgr.initPopups();self.registerAllHandlers()}};window["gw2BBCode"]=new Gw2BBCode;window["gw2BBCode"].init();var testObject={"one":1,"two":2,"three":3};console.log("isLocalStorageSupported: ",LocalStorageHelper.isSupported());console.log("containsKey: ",LocalStorageHelper.containsKey("obj"));console.log("putObject: ",LocalStorageHelper.putObject("obj",testObject));console.log("containsKey: ",LocalStorageHelper.containsKey("obj"));console.log("getObject: ",LocalStorageHelper.getObject("obj"));console.log("containsKey: ",LocalStorageHelper.containsKey("obj"));console.log("remove: ",LocalStorageHelper.remove("obj"));
console.log("containsKey: ",LocalStorageHelper.containsKey("obj"));var taskList=new TaskList(30);taskList.success(function(taskList){console.log("AsyncTaskList: done")});taskList.error(function(taskList,errorMsg){console.log("Error "+errorMsg)});taskList.doWork();