function clustersOnOff(){$("#goRadioText")[0].innerHTML="Clusters ON"==$("#goRadioText")[0].innerHTML?"Clusters OFF":"Clusters ON",EoLMap.change()}function get_center_lat_long(){var e=new google.maps.LatLngBounds;EoLMap.recs=data.records;for(var a=EoLMap.recs.length,t=0;a>t;t++)e.extend(new google.maps.LatLng(EoLMap.recs[t].h,EoLMap.recs[t].i));return e.getCenter()}function goFullScreen(){currCenter=EoLMap.map.getCenter();var e=document.getElementById("gmap");document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement?($("#goFullText")[0].innerHTML="Fullscreen OFF","Panel ON"==$("#goPanelText")[0].innerHTML?($("#panel")[0].style.height="500px",$("#panel")[0].style.width="200px",$("#map-canvas")[0].style.height="500px",$("#map-canvas")[0].style.width="700px"):($("#panel")[0].style.height="0px",$("#panel")[0].style.width="0px",$("#map-canvas")[0].style.height="500px",$("#map-canvas")[0].style.width="900px"),document.exitFullscreen?document.exitFullscreen():document.msExitFullscreen?document.msExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen&&(e.style.width="",document.webkitExitFullscreen())):($("#goFullText")[0].innerHTML="Fullscreen ON","Panel ON"==$("#goPanelText")[0].innerHTML?($("#panel")[0].style.height="100%",$("#panel")[0].style.width="17%",$("#map-canvas")[0].style.height="100%",$("#map-canvas")[0].style.width="83%"):($("#panel")[0].style.height="0px",$("#panel")[0].style.width="0px",$("#map-canvas")[0].style.height="100%",$("#map-canvas")[0].style.width="100%"),e.requestFullscreen?e.requestFullscreen():e.msRequestFullscreen?e.msRequestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen&&(e.style.width="100%",e.style.height="100%",e.webkitRequestFullscreen())),google.maps.event.trigger(EoLMap.map,"resize"),EoLMap.map.setCenter(currCenter)}function exitHandler(){if(is_full_screen){if(!document.webkitIsFullScreen){$("#goFullText")[0].innerHTML="Fullscreen OFF";var e=document.getElementById("gmap");e.style.width=""}document.mozFullScreen&&($("#goFullText")[0].innerHTML="Fullscreen ON")}is_full_screen()||("Panel ON"==$("#goPanelText")[0].innerHTML?($("#panel")[0].style.height="500px",$("#panel")[0].style.width="200px",$("#map-canvas")[0].style.height="500px",$("#map-canvas")[0].style.width="700px"):($("#map-canvas")[0].style.height="500px",$("#map-canvas")[0].style.width="900px")),google.maps.event.trigger(EoLMap.map,"resize"),EoLMap.map.setCenter(currCenter)}function is_full_screen(){var e=document.getElementById("gmap");if(e.requestFullscreen);else if(e.msRequestFullscreen){if(1==document.msFullscreenElement)return!0}else if(e.mozRequestFullScreen){if(1==document.mozFullScreen)return!0}else if(e.webkitRequestFullscreen&&1==document.webkitIsFullScreen)return!0;return!1}function panelShowHide(){$("#goPanelText")[0].innerHTML="Panel ON"==$("#goPanelText")[0].innerHTML?"Panel OFF":"Panel ON",is_full_screen()?($("#map-canvas")[0].style.height="100%","Panel ON"==$("#goPanelText")[0].innerHTML?($("#panel")[0].style.width="17%",$("#panel")[0].style.height="100%",$("#map-canvas")[0].style.width="83%"):($("#panel")[0].style.width="0px",$("#panel")[0].style.height="0px",$("#map-canvas")[0].style.width="100%")):($("#map-canvas")[0].style.height="500px","Panel ON"==$("#goPanelText")[0].innerHTML?($("#panel")[0].style.width="200px",$("#panel")[0].style.height="500px",$("#map-canvas")[0].style.width="700px"):($("#panel")[0].style.width="0px",$("#panel")[0].style.height="0px",$("#map-canvas")[0].style.width="900px")),currCenter=EoLMap.map.getCenter(),google.maps.event.trigger(EoLMap.map,"resize"),EoLMap.map.setCenter(currCenter)}function record_history(){var e={};e.center=EoLMap.map.getCenter(),e.zoom=EoLMap.map.getZoom(),e.mapTypeId=EoLMap.map.getMapTypeId(),statuz.push(e),statuz_all.push(e),initial_map||(initial_map=e),currCenter=EoLMap.map.getCenter()}function CenterControl(e,a,t){var n=document.createElement("div");n.id="goBackUI",n.title="Go back one step",e.appendChild(n);var r=document.createElement("div");r.id="goBackText",r.innerHTML="Go Back",n.appendChild(r);var o=document.createElement("div");o.id="goNextUI",o.title="Move forward one step",e.appendChild(o);var l=document.createElement("div");l.id="goNextText",l.innerHTML="Move Next",o.appendChild(l);var i=document.createElement("div");i.id="goOrigUI",i.title="Back to original map",e.appendChild(i);var p=document.createElement("div");if(p.id="goOrigText",p.innerHTML="Initial Map",i.appendChild(p),1==t){var s=document.createElement("div");s.id="goRadioUI",s.title="Toggle Clustering",e.appendChild(s);var c=document.createElement("div");c.id="goRadioText",c.innerHTML="Clusters ON",s.appendChild(c),s.addEventListener("click",function(){clustersOnOff()})}var d=document.createElement("div");d.id="goPanelUI",d.title="Toggle Panel",e.appendChild(d);var m=document.createElement("div");m.id="goPanelText",m.innerHTML="Panel OFF",d.appendChild(m);var u=document.createElement("div");u.id="goFullUI",u.title="Toggle Fullscreen",e.appendChild(u);var g=document.createElement("div");g.id="goFullText",g.innerHTML="Fullscreen OFF",u.appendChild(g),n.addEventListener("click",function(){EoLMap.back()}),o.addEventListener("click",function(){EoLMap.next()}),i.addEventListener("click",function(){EoLMap.map.setOptions(initial_map),statuz=[],statuz_all=[]}),d.addEventListener("click",function(){panelShowHide()}),u.addEventListener("click",function(){goFullScreen()})}var EoLMap={};EoLMap.recs=null,EoLMap.map=null,EoLMap.markerClusterer=null,EoLMap.markers=[],EoLMap.infoWindow=null;var markerSpiderfier=null,statuz=[],statuz_all=[],initial_map=!1;EoLMap.init=function(){center_latlong=get_center_lat_long();var e=new google.maps.LatLng(center_latlong.lat(),center_latlong.lng()),a={zoom:2,center:e,mapTypeId:google.maps.MapTypeId.ROADMAP,scaleControl:!0};EoLMap.map=new google.maps.Map($("#map-canvas")[0],a);{var t=document.createElement("div");new CenterControl(t,EoLMap.map,1)}t.index=1,t.style["padding-top"]="10px",EoLMap.map.controls[google.maps.ControlPosition.TOP_CENTER].push(t),EoLMap.recs=data.records,$("#total_markers")[0].innerHTML=data.actual+"<br>Plotted: "+data.count,EoLMap.map.enableKeyDragZoom();var n={keepSpiderfied:!0,event:"mouseover"};markerSpiderfier=new OverlappingMarkerSpiderfier(EoLMap.map,n),EoLMap.infoWindow=new google.maps.InfoWindow,EoLMap.showMarkers(),google.maps.event.addListener(EoLMap.map,"idle",function(){record_history()})},EoLMap.showMarkers=function(){EoLMap.markers=[],EoLMap.markerClusterer&&EoLMap.markerClusterer.clearMarkers();var e=$("#markerlist")[0];e.innerHTML="";for(var a=EoLMap.recs.length,t=0;a>t;t++){var n=EoLMap.recs[t].a;""===n&&(n="No catalog number");var r=document.createElement("DIV"),o=document.createElement("A");o.href="#",o.className="title",o.innerHTML=n,r.appendChild(o),e.appendChild(r);var l=new google.maps.LatLng(EoLMap.recs[t].h,EoLMap.recs[t].i),i=new google.maps.Marker({position:l,icon:"https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0"}),p=EoLMap.markerClickFunction(EoLMap.recs[t],l);google.maps.event.addListener(i,"click",p),google.maps.event.addDomListener(o,"click",p),EoLMap.markers.push(i),markerSpiderfier.addMarker(i)}markerSpiderfier.addListener("click",function(e){EoLMap.infoWindow.open(EoLMap.map,e)}),markerx=EoLMap.markers,markerSpiderfier.addListener("spiderfy",function(){EoLMap.infoWindow.close()}),window.setTimeout(EoLMap.time,0)},EoLMap.markerClickFunction=function(e,a){return function(t){t.cancelBubble=!0,t.returnValue=!1,t.stopPropagation&&(t.stopPropagation(),t.preventDefault());var n=e.b,r='<div class="info"><h3>'+n+"</h3>";e.l&&(r+='<div class="info-body"><img src="'+e.l+'" class="info-img"/></div><br/>'),e.a&&(r+="Catalog number: "+e.a+"<br/>"),r+='Source portal: <a href="http://www.gbif.org/occurrence/'+e.g+'" target="_blank">GBIF record</a><br/>Publisher: <a href="http://www.gbif.org/publisher/'+e.d+'" target="_blank">'+e.c+'</a><br/>Dataset: <a href="http://www.gbif.org/dataset/'+e.f+'" target="_blank">'+e.e+"</a><br/>",e.j&&(r+="Recorded by: "+e.j+"<br/>"),e.k&&(r+="Identified by: "+e.k+"<br/>"),e.m&&(r+="Event date: "+e.m+"<br/>"),r+="</div>",EoLMap.infoWindow.setContent(r),EoLMap.infoWindow.setPosition(a),EoLMap.infoWindow.open(EoLMap.map)}},EoLMap.clear=function(){for(var e,a=0;e=EoLMap.markers[a];a++)e.setMap(null)},EoLMap.change=function(){EoLMap.clear(),EoLMap.showMarkers()},EoLMap.time=function(){if(document.getElementById("goRadioText"))if("Clusters ON"==$("#goRadioText")[0].innerHTML)EoLMap.markerClusterer=new MarkerClusterer(EoLMap.map,EoLMap.markers);else for(var e,a=0;e=EoLMap.markers[a];a++)e.setMap(EoLMap.map);else EoLMap.markerClusterer=new MarkerClusterer(EoLMap.map,EoLMap.markers)};var currCenter="";document.addEventListener&&(document.addEventListener("webkitfullscreenchange",exitHandler,!1),document.addEventListener("mozfullscreenchange",exitHandler,!1),document.addEventListener("fullscreenchange",exitHandler,!1),document.addEventListener("MSFullscreenChange",exitHandler,!1)),EoLMap.back=function(){if(statuz.length>1){statuz.pop();var e=statuz.pop();EoLMap.map.setOptions(e),JSON.stringify(e)==JSON.stringify(initial_map)&&(statuz=[],statuz_all=[])}},EoLMap.next=function(){if(statuz_all.length>1){statuz_all.pop();var e=statuz_all.pop();EoLMap.map.setOptions(e),JSON.stringify(e)==JSON.stringify(initial_map)&&(statuz=[],statuz_all=[])}},$(document).ready(function(){EoLMap.init()});