//# sourceURL=J_PingSensorEx.js
"use strict";

var ALTUI_PingSensorExDisplays= ( function( window, undefined ) {  

	// return styles needed by this plugin module
	function _getStyle() {
		var style="";
        style += ".altui-multistring-text-div, .altui-vswitch-text-div, .altui-veraalerts-text-div, .altui-autovera-text-div, .altui-combsw-text-div, .altui-sonos-text-div, .altui-upnpproxy-text-div { margin-left: 50px; margin-top: 2px; font-size: 11px; }";

        style += ".altui-veraalerts-text-div, .altui-autovera-text, .altui-combsw-text-div { margin-top: 14px; }"; // new top margin 14px vs default 2px
        style += ".altui-upnpproxy-text-div { margin-top: 22px; }"; // new top margin vs default 2px
        
        style += ".altui-multistring-text-div, .altui-vswitch-text-div { height: 48px; overflow: hidden; }"; // constrain the content area for variable content
        
        style += ".altui-veraalerts-text, .altui-autovera-text { margin-left: 4px; }";  // for text, sometimes we want to add a little left room when the icons are bigger
        style += ".altui-upnpproxy-text { margin-left: 2px; }";  // the same
        
        style += ".altui-multistring-text-some, { font-size: 11px; }"; style += ".altui-multistring-text-all { font-size: 7px; }";

        style += ".altui-plts-btn-div { margin-top: 4px; height: 48px; overflow:hidden; } .altui-plts-btn { width: 50px; font-size: 11px; line-height: 1.5; } .altui-plts-btn-on { color: white; background-color: #006C44; } .altui-plts-btn-on:hover, .altui-plts-btn-on:focus, .altui-plts-btn-on:active, .altui-plts-btn-on:active:focus, .altui-plts-btn-on.active:focus { color: white; background-color: #006C44; outline: 0 none; box-shadow: none; } .altui-plts-time-text-span { xfloat: left; margin-left: 6px; margin-top: 5px; margin-right: 0px; font-size: 9px; overflow: hidden; }";
		style += ".altui-multiswitch-container { position:absolute; left:58px; right:16px; } .altui-multiswitch-container .row { padding-top:1px; padding-bottom:1px; margin-left:0px; margin-right:0px;} .altui-multiswitch-container .col-xs-3 { padding-left:1px; padding-right:1px; }  .altui-multiswitch-open { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left:0px; padding-right:0px; margin-left:0px; margin-right:0px; width: 100%; max-width: 100% }";
		return style;
	}
    
    // return the html string inside the .panel-body of the .altui-device#id panel
    function _drawPnPProxy( device ) {
        var html = "";
        var status = MultiBox.getStatus( device, 'urn:futzle-com:serviceId:UPnPProxy1', 'StatusText' );
        if (status != null) {
            html += "<div class='altui-upnpproxy-text text-muted'>Status: {0}</div>".format(status);
        }
        return html;
    }

    // return the html string inside the .panel-body of the .altui-device#id panel
    function _drawVeraAlerts( device ) {
        var html = "";
        var lastmsgsent = MultiBox.getStatus(device, 'urn:richardgreen:serviceId:VeraAlert1', 'LastMsgSent');
        var lastrecipient = MultiBox.getStatus(device, 'urn:richardgreen:serviceId:VeraAlert1', 'LastRecipient');
        if (lastmsgsent != null && lastrecipient != null) {
            html += "<div class='altui-veraalerts-text-div'>";
            html += "<div class='altui-veraalerts-text text-muted'>Last Msg Sent: {0}</div>".format(lastmsgsent);
            html += "<div class='altui-veraalerts-text text-muted'>Profile Used: {0}</div>".format(lastrecipient);
            html += "</div>";
        }
        return html;
    }
	
    // return the html string inside the .panel-body of the .altui-device#id panel
    function _drawAutoVeraDashboard( device ) {
        var html = "";
        var status = "AutoVera";
        html += "<div class='altui-autovera-text-div'>";
        html += "<div class='altui-autovera-text text-muted'>{0}</div>".format(status);
        html += "</div>";
        return html;
    }
    
    function _drawAutoVeraIcon( device ) {
        var html = "";
        html += "<img class='altui-device-icon pull-left img-rounded' src='/cmh/skins/default/img/icons/AutoVeraIcon.png' alt='' onerror='UIManager.onDeviceIconError('"+device.altuid+"')'></img>";
        return html;
    }
        
    // return the html string inside the .panel-body of the .altui-device#id panel
	function _drawMultiSwitch( device ) {
		var btnid = 0;
		var html ="";

		var names = MultiBox.getStatus(device,"urn:dcineco-com:serviceId:MSwitch1","BtnNames") || "[]";
		names = JSON.parse(names);

		html += "<div class='altui-multiswitch-container pull-right'>";
		for (var line=0; line<2 ; line++) {
			html += "<div class='row'>";
			for (var col=0; col<4; col ++) {
				var name = names[btnid] ? names[btnid] : ("Btn_"+btnid);
				var status = parseInt(MultiBox.getStatus(device,"urn:dcineco-com:serviceId:MSwitch1","Status"+(btnid+1)));

				html += "<div class='col-xs-3'>";
				html+= ("<button id='{0}' type='button' class='altui-multiswitch-open btn btn-default btn-xs {2}' >{1}</button>".format( 
					btnid ,
					name  ,
					(status==1) ? 'btn-info' : ''
					)) ;
				// html+= "x";
				html += "</div>";
				
				btnid ++;
			}
			html += "</div>";
		}
		html += "</div>";
		html += "<script type='text/javascript'>";
		html += " $('button.altui-multiswitch-open').on('click', function() { 	";
		html += " 	var btnid = parseInt($(this).prop('id'))+1;					";
		html += "   var action = 'SetStatus'+btnid; 							";
		html += "   var params = {}; params['newStatus'+btnid]=-1;				";
		html += "	MultiBox.runActionByAltuiID('{0}', 'urn:dcineco-com:serviceId:MSwitch1', action, params);".format(device.altuiid);
		html += "});"
		html += "</script>";
		return html;
	}
    
	// return the html string inside the .panel-body of the .altui-device#id panel
    function _drawPingSensorEx( device ) {
        var html = "";
        
        try {
            var armed = parseInt(MultiBox.getStatus( device, 'urn:micasaverde-com:serviceId:SecuritySensor1', 'Armed' )); 
            html += ALTUI_PluginDisplays.createOnOffButton( armed,"altui-armbypassbtn-"+device.altuiid, _T("Bypass,Arm"), "pull-right" );

            var status = parseInt(MultiBox.getStatus( device, 'urn:upnp-org:serviceId:SwitchPower1', 'Status' )); 
            html += ALTUI_PluginDisplays.createOnOffButton( status,"altui-onoffbtn-"+device.altuiid, _T("Off,On") , "pull-right" );

            var lasttrip = MultiBox.getStatus( device, 'urn:micasaverde-com:serviceId:SecuritySensor1', 'LastTrip' );
            if (lasttrip != null) {
                var lasttripdate = _toIso(new Date(lasttrip*1000),' ');
                html+= "<div class='altui-lasttrip-text text-muted'>{0} {1}</div>".format( timeGlyph,lasttripdate );
            }

            // armed, tripped
            var tripped = parseInt(MultiBox.getStatus( device, 'urn:micasaverde-com:serviceId:SecuritySensor1', 'Tripped' )); 
            html += ("<span class='altui-motion' >{0}</span>".format( (tripped==true) ? "<span class='glyphicon glyphicon-flash text-danger' aria-hidden='true'></span>" : ""));

            // armed
            html += "<script type='text/javascript'>";
            html += " $('div#altui-armbypassbtn-{0}').on('click touchend', function() { ALTUI_PluginDisplays.toggleArmed('{0}','div#altui-armbypassbtn-{0}'); } );".format(device.altuiid);
            html += " $('div#altui-onoffbtn-{0}').on('click touchend', function() { ALTUI_PluginDisplays.toggleOnOffButton('{0}','div#altui-onoffbtn-{0}'); } );".format(device.altuiid);
            html += "</script>";
            
        } catch (e) {
            html = "<span>Error, sorry</span>";
        }
        return html;
    }
    
    // return the html string inside the .panel-body of the .altui-device#id panel
    function _drawProgLogicTimerSwitch( device ) {
        var html = "";
        var onoff = MultiBox.getStatus(device, 'urn:rts-services-com:serviceId:ProgramLogicTS', 'Status');
        var armed = MultiBox.getStatus(device, 'urn:rts-services-com:serviceId:ProgramLogicTS', 'Armed');
        var state = MultiBox.getStatus(device, 'urn:rts-services-com:serviceId:ProgramLogicTS', 'State');
        var rtime = MultiBox.getStatus(device, 'urn:rts-services-com:serviceId:ProgramLogicTS', 'TimeRemaining');
        html += "<div class='pull-right altui-plts-btn-div'>";
        html += " <div class='btn-group'>";
        html += "  <button id='altui-armbtn-{0}' type='button' class='altui-plts-btn btn btn-default btn-xs {2}'>{1}</button>".format(device.altuiid, _T("Arm"), armed==1?'altui-plts-btn-on':'');
        html += "  <button id='altui-bypassbtn-{0}' type='button' class='altui-plts-btn btn btn-default btn-xs {2}'>{1}</button>".format(device.altuiid, _T("Bypass"), armed==0?'altui-plts-btn-on':'');
        html += "  <button id='altui-triggerbtn-{0}' type='button' class='altui-plts-btn btn btn-default btn-xs {2}'>{1}</button>".format(device.altuiid, _T("Trigger"), state==1?'altui-plts-btn-on':'');
        html += "  <button id='altui-restartbtn-{0}' type='button' class='altui-plts-btn btn btn-default btn-xs'>{1}</button>".format(device.altuiid, _T("Restart"));
        html += " </div><br>";
        html += " <div class='btn-group'>";
        html += "  <button id='altui-onbtn-{0}' type='button' class='altui-plts-btn btn btn-default btn-xs {2}'>{1}</button>".format(device.altuiid, _T("On"), onoff==1?'altui-plts-btn-on':'');
        html += "  <button id='altui-offbtn-{0}' type='button' class='altui-plts-btn btn btn-default btn-xs {2}'>{1}</button>".format(device.altuiid, _T("Off"), onoff==0?'altui-plts-btn-on':'');
        html += "  <button id='altui-resetbtn-{0}' type='button' class='altui-plts-btn btn btn-default btn-xs {2}'>{1}</button>".format(device.altuiid, _T("Reset"), state==0?'altui-plts-btn-on':'');
        if (state == 3 && rtime != null) {
            var h = '00'; var m = '00'; var s = '00'; var hms = rtime.split(':');
            if ( hms.length == 3) { h = hms[0]; m = hms[1]; s = hms[2] } else if ( hms.length == 2) { m = hms[0]; s = hms[1] } else { s = hms[0] }
            html += "<span id='altui-plts-rtime' class='altui-plts-time-text-span text-muted'>" + "{0}:{1}:{2}".format(h,m,s) + "</div>";            
        }
        html += " </div>";
        html += "</div>";
        html += "<script type='text/javascript'>";
        html += " function resizepltsbtn() { var w = $('div.altui-device-body').width(); w=w<250?(w-50)/4-1:50; $('button.altui-plts-btn').css('width', w); $('#altui-plts-rtime').css('width', w-10); }; resizepltsbtn();";
        html += " $(window).resize(function(){ resizepltsbtn(); });"
        html += " $('button#altui-restartbtn-{0}').on('click', function() { var device = MultiBox.getDeviceByAltuiID('{0}'); var state = MultiBox.getStatus(device, 'urn:rts-services-com:serviceId:ProgramLogicTS', 'State'); if (state==3) { MultiBox.runActionByAltuiID('{0}','urn:rts-services-com:serviceId:ProgramLogicTS','SetState',{'newStateValue':'2'}); $('button#altui-restartbtn-{0}').addClass('altui-plts-btn-on'); } else if (state==0) { MultiBox.runActionByAltuiID('{0}','urn:rts-services-com:serviceId:ProgramLogicTS','SetState',{'newStateValue':'0'}); } });".format(device.altuiid);
        html += " $('button#altui-triggerbtn-{0}').on('click', function() { MultiBox.runActionByAltuiID('{0}','urn:rts-services-com:serviceId:ProgramLogicTS','SetState',{'newStateValue':'1'}); $('button#altui-triggerbtn-{0}').addClass('altui-plts-btn-on'); });".format(device.altuiid);
        html += " $('button#altui-bypassbtn-{0}').on('click', function() { MultiBox.runActionByAltuiID('{0}','urn:rts-services-com:serviceId:ProgramLogicTS','SetArmed',{'newArmedValue':'0'}); $('button#altui-bypassbtn-{0}').addClass('altui-plts-btn-on'); $('button#altui-armbtn-{0}').removeClass('altui-plts-btn-on'); });".format(device.altuiid);
        html += " $('button#altui-armbtn-{0}').on('click', function() { MultiBox.runActionByAltuiID('{0}','urn:rts-services-com:serviceId:ProgramLogicTS','SetArmed',{'newArmedValue':'1'}); $('button#altui-armbtn-{0}').addClass('altui-plts-btn-on'); $('button#altui-bypassbtn-{0}').removeClass('altui-plts-btn-on'); });".format(device.altuiid);
        html += " $('button#altui-resetbtn-{0}').on('click', function() { MultiBox.runActionByAltuiID('{0}','urn:rts-services-com:serviceId:ProgramLogicTS','SetState',{'newStateValue':'0'}); $('button#altui-resetbtn-{0}').addClass('altui-plts-btn-on'); });".format(device.altuiid);
        html += " $('button#altui-offbtn-{0}').on('click', function() { MultiBox.runActionByAltuiID('{0}','urn:rts-services-com:serviceId:ProgramLogicTS','SetTarget',{'newTargetValue':'0'}); $('button#altui-offbtn-{0}').addClass('altui-plts-btn-on'); $('button#altui-onbtn-{0}').removeClass('altui-plts-btn-on'); });".format(device.altuiid);
        html += " $('button#altui-onbtn-{0}').on('click', function() { MultiBox.runActionByAltuiID('{0}','urn:rts-services-com:serviceId:ProgramLogicTS','SetTarget',{'newTargetValue':'1'}); $('button#altui-onbtn-{0}').addClass('altui-plts-btn-on'); $('button#altui-offbtn-{0}').removeClass('altui-plts-btn-on'); });".format(device.altuiid);
        html += "</script>";
        return html;
    }
	
    // return the html string inside the .panel-body of the .altui-device#id panel
    function _drawMultiString( device ) {
        var html = ""; var sAll = _T("All"); var sMore = _T("More"); var sLess = _T("Less");
        if ($('button#altui-morebtn-'+device.altuiid).html() == undefined) {
            var initstate = {}; initstate['devicestate'] = 0;
            MyLocalStorage.setSettings("MULTISTRINGUISTATE"+device.altuiid, initstate);
        }        
        var state = MyLocalStorage.getSettings("MULTISTRINGUISTATE"+device.altuiid);
        var display = state != null ? state['devicestate'] : 0;
        html += "<div class='btn-group pull-right'>";
        html += " <button id='altui-allbtn-{0}' type='button' class='altui-window-btn btn btn-default btn-xs'>{1}</button>".format( device.altuiid,sAll);
        html += " <button id='altui-morebtn-{0}' type='button' class='altui-window-btn btn btn-default btn-xs'>{1}</button>".format( device.altuiid,(display != 2 ? sMore : sLess));
        html += "</div>";
        html += "<div class='altui-multistring-text-div'>";
        for (var v = 1; v <= 5 ; v++) {
            var label = MultiBox.getStatus( device, 'urn:upnp-org:serviceId:VContainer1', "VariableName" + v ); 
            var value = MultiBox.getStatus( device, 'urn:upnp-org:serviceId:VContainer1', "Variable" + v );
            var style = "";
            if (v <= 3) { style = "class='" + (display != 2 ? "altui-multistring-text-some" : "altui-multistring-text-all") + " altui-multistring-text-1 text-muted'"; }
            else {
                style = "class='" + (display != 2 ? "altui-multistring-text-some" : "altui-multistring-text-all") + " altui-multistring-text-2 text-muted'";
                if (display != 2) { style += " style='display: none;'"; } 
            }            
            if (label != null && value != null) {
                html += $(" <div " + style + "></div>").text(label + ": " + value).wrap( "<div></div>" ).parent().html();
            }
        }
        html += "</div>";
        html += "<script type='text/javascript'>";
        html += " var state = MyLocalStorage.getSettings('MULTISTRINGUISTATE{0}');".format(device.altuiid);
        html += " if (state['devicestate'] == 1) { $('.altui-multistring-text-1').toggle(); $('.altui-multistring-text-2').toggle(); }";
        html += " $('button#altui-allbtn-{0}').on('click', function() { $('.altui-multistring-text-some').removeClass('altui-multistring-text-some').addClass('altui-multistring-text-all').show(); $('#altui-morebtn-{0}').html('{1}'); state['devicestate'] = 2; MyLocalStorage.setSettings('MULTISTRINGUISTATE{0}', state); });".format(device.altuiid,sLess);            
        html += " $('button#altui-morebtn-{0}').on('click', function() { if ($(this).html() == '{1}') { $('.altui-multistring-text-all').removeClass('altui-multistring-text-all').addClass('altui-multistring-text-some'); $('.altui-multistring-text-2').hide(); $('#altui-morebtn-{0}').html('{2}'); state['devicestate'] = 0; MyLocalStorage.setSettings('MULTISTRINGUISTATE{0}', state); } else { $('.altui-multistring-text-1').toggle(); $('.altui-multistring-text-2').toggle(); state['devicestate'] = state['devicestate'] == 0 ? 1 : 0; MyLocalStorage.setSettings('MULTISTRINGUISTATE{0}', state); } });".format(device.altuiid,sLess,sMore);            
        html += "</script>";
        return html;
    }
    
    // add div for positioning text within the dashboard
    // return the html string inside the .panel-body of the .altui-device#id panel
	function _drawVswitch( device ) {
		var html ="";
		var status = parseInt(MultiBox.getStatus( device, 'urn:upnp-org:serviceId:VSwitch1', 'Status' )); 
		html += ALTUI_PluginDisplays.createOnOffButton( status,"altui-vswitch-"+device.altuiid, _T("OFF,ON") , "pull-right");
        html += "<div class='altui-vswitch-text-div'>";
		$.each( ['Text1','Text2'],function(i,v) {
			var dl1 = MultiBox.getStatus( device, 'urn:upnp-org:serviceId:VSwitch1', v ); 
			if (dl1 != null) 
				html += $("<div class='altui-vswitch-text text-muted'></div>").text(dl1).wrap( "<div></div>" ).parent().html()
		});
        html += "</div>";
		// on off 
		html += "<script type='text/javascript'>";
		html += "$('div#altui-vswitch-{0}').on('click touchend', function() { ALTUI_PluginDisplays.toggleVswitch('{0}','div#altui-vswitch-{0}'); } );".format(device.altuiid);
		html += "</script>";
		return html;
	}
    
    // add div for positioning text within the dashboard
    // return the html string inside the .panel-body of the .altui-device#id panel
    function _drawCombinationSwitch( device ) {
        var html = "";
        html += "<button id='altui-pokebtn-{0}' type='button' class='pull-right altui-window-btn btn btn-default btn-sm '>{1}</button>".format(device.altuiid, _T("Poke")) ;
        html += "<div class='altui-combsw-text-div'>";
        var label = MultiBox.getStatus(device, 'urn:futzle-com:serviceId:CombinationSwitch1', 'Label');
        if (label != null) { html += "<div class='altui-combsw-text text-muted'>Watched Items: {0}</div>".format(label); }
        html += "</div>";
        html += "<script type='text/javascript'>";
        html += " $('button#altui-pokebtn-{0}').on('click',function(){ MultiBox.runActionByAltuiID('{0}','urn:futzle-com:serviceId:CombinationSwitch1','Trigger',{});});".format(device.altuiid);
        html += "</script>";
        return html;
    };
    
    function _drawSysMonitor( device ) {
        var html = "";
        var memoryavail = MultiBox.getStatus(device, 'urn:cd-jackson-com:serviceId:SystemMonitor', 'memoryAvailable');
        var cpuload = MultiBox.getStatus(device, 'urn:cd-jackson-com:serviceId:SystemMonitor', 'cpuLoad5');
        if (memoryavail != null && cpuload != null) {
            html += "<div class='altui-sysmon-text text-muted'><br>Memory Available: {0}<br>CPU Load (5 minute): {1}</div>".format(memoryavail, cpuload);
        }
        return html;
    }
    
	function _drawInfoViewerDashboard( device) {
		var html ="";
		var pattern = MultiBox.getStatus( device, 'urn:a-lurker-com:serviceId:InfoViewer1', 'LuaPattern');
		var urlhead = MultiBox.getUrlHead(device.altuiid);
		if (pattern!="")
			html+= "<span class=''>Pattern: {0}</span>".format( pattern.htmlEncode() );
		html += "<div class='btn-group pull-right'>";
		html+= ("<button id='altui-infoviewer-{0}' type='button' class='altui-infoviewer-btn btn btn-default btn-sm '>{1}</button>" .format( device.altuiid,_T("Open") )) ;
		html+= ("<button id='altui-infoviewer-log-{0}' type='button' class='altui-infoviewer-log-btn btn btn-default btn-sm '>{1}</button>" .format( device.altuiid,_T("Logs") )) ;
		html += "</div>";
		html += "<script type='text/javascript'>";
		html += " $('button.altui-infoviewer-btn').on('click', function() { window.open('{1}?id=lr_al_info','_blank'); } );".format(device.altuiid,urlhead);
		html += " $('button.altui-infoviewer-log-btn').on('click', function() { window.open('{1}?id=lr_al_info&fnc=getLog&app=localapp','_blank'); } );".format(device.altuiid,urlhead);
		html += "</script>";
		return html;
	};	
    
    function _drawInfoViewerIcon( device ) {
        var html = "";
        html += "<img class='altui-device-icon pull-left img-rounded' src='/cmh/skins/default/img/icons/InfoViewerIcon.png' alt='' onerror='UIManager.onDeviceIconError('"+device.altuid+"')'></img>";
        return html;
    }
    
    function _drawCombDeviceDashboard( device ) {
        var html = "";
        var minfo = MultiBox.getStatus( device, 'urn:micasaverde-com:serviceId:ZWaveDevice1', 'ManufacturerInfo');
        if (minfo == "96,6,1") {
            var devname = "Everspring Temp/Hum Sensor"
            html += "<div class='altui-autovera-text-div'>";
            html += "<div class='altui-autovera-text text-muted'>{0}</div>".format(devname);
            html += "</div>";
        }
        if (minfo == "30,2,1") {
            var devname = "HomeSeer HSM100 Multi-Sensor"
            html += "<div class='altui-autovera-text-div'>";
            html += "<div class='altui-autovera-text text-muted'>{0}</div>".format(devname);
            html += "</div>";
        }
        return html;
    }
	
    function _drawCombDeviceIcon( device ) {
        var html = "";
        var minfo = MultiBox.getStatus( device, 'urn:micasaverde-com:serviceId:ZWaveDevice1', 'ManufacturerInfo');
        if (minfo == "96,6,1") {
            html += "<img class='altui-device-icon pull-left img-rounded' src='/cmh/skins/default/img/icons/EverspringTempHumIcon.png' alt='' onerror='UIManager.onDeviceIconError('"+device.altuid+"')'></img>";
        }
        if (minfo == "30,2,1") {
            html += "<img class='altui-device-icon pull-left img-rounded' src='/cmh/skins/default/img/icons/Combo3in1DeviceIcon.png' alt='' onerror='UIManager.onDeviceIconError('"+device.altuid+"')'></img>";
        }
        return html;
    }
    
    // explicitly return public methods when this object is instantiated
    return {
        //---------------------------------------------------------
        // PUBLIC  functions
        //---------------------------------------------------------
        getStyle                : _getStyle,
        drawPingSensorEx        : _drawPingSensorEx,
        drawMultiString         : _drawMultiString,
        drawPnPProxy            : _drawPnPProxy,
        drawVswitch             : _drawVswitch,
        drawCombinationSwitch   : _drawCombinationSwitch,
        drawSysMonitor          : _drawSysMonitor,
        drawProgLogicTimerSwitch: _drawProgLogicTimerSwitch,
        drawMultiSwitch         : _drawMultiSwitch,
        drawVeraAlerts          : _drawVeraAlerts,
        drawAutoVeraDashboard   : _drawAutoVeraDashboard,
        drawAutoVeraIcon        : _drawAutoVeraIcon,
        drawInfoViewerDashboard : _drawInfoViewerDashboard,
        drawInfoViewerIcon      : _drawInfoViewerIcon,
        drawCombDeviceDashboard : _drawCombDeviceDashboard,
        drawCombDeviceIcon      : _drawCombDeviceIcon
    };
})( window );
