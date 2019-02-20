function init(sessionID, unitID, userName, caller, previewerWidth, previewerHeight, timeout, webserviceURL, baseSWF) {
    var resizeWidth = 0;
    var resizeHeight = 0;
    var windowWidth = document.documentElement.clientWidth;
    var windowHeight = document.documentElement.clientHeight;
    
    //alert("target window size: width = " + previewerWidth + "   height = " + previewerHeight);

    if (windowWidth != previewerWidth) {
        resizeWidth = previewerWidth - windowWidth;
        //alert("resizeWidth = " + resizeWidth);
    }
    if (windowHeight != previewerHeight) {
        resizeHeight = previewerHeight - windowHeight;
        //alert("resizeHeight = " + resizeHeight);
    }
     
    if (resizeWidth != 0 || resizeHeight != 0) {
        resizeBy(resizeWidth, resizeHeight);
    }

    var flashVars = "sessionID=" + sessionID + "&UnitID=" + unitID + "&uName=" + userName + "&Caller=" + caller + "&playerWidth=" + previewerWidth + "&playerHeight=" + previewerHeight + "&timeout=" + timeout + "&webserviceURL=" + webserviceURL;

	var theHTML = "<object classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0' width='"+previewerWidth+"' height='"+previewerHeight+"' id='PreviewerObj' align='middle'>";
	//theHTML    += "<param id='FlashVarsLabel'  name='FlashVars' value='sessionID="+sessionID+"&UnitID="+unitID+"&uName="+userName+"&Caller="+caller+"&timeout="+timeout+"' />";
	theHTML    += "<param id='FlashVarsLabel'  name='FlashVars' value='" + flashVars + "' />";
	theHTML    += "<param name='allowScriptAccess' value='sameDomain' />";
	theHTML    += "<param name='allowFullScreen' value='false' />";
	theHTML    += "<param name='SeamlessTabbing' value='false'>";
	theHTML    += "<param name='movie' value='" + baseSWF + "' />";
	theHTML    += "<param name='quality' value='high' />";
	theHTML    += "<param name='bgcolor' value='#666666' />";
	theHTML    += "<param name='wmode' value='transparent' />";
	theHTML += "<embed src='"+baseSWF+ "' FlashVars='" + flashVars + "' quality='high' wmode='transparent' bgcolor='#666666' width='" + previewerWidth + "' height='" + previewerHeight + "' SeamlessTabbing='false' name='PreviewerEmb' id='PreviewerEmb' align='middle' allowScriptAccess='sameDomain' allowFullScreen='false' type='application/x-shockwave-flash' pluginspage='http://www.macromedia.com/go/getflashplayer' />";
	theHTML    += "</object>";
	var theRef = document.getElementById("holder");
    theRef.innerHTML = theHTML;
}

