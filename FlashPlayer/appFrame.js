// Global variable for source file to be accessed by wrapper pages to determine file to load
var globalSourceFile = "";
var globalWidth = "";
var globalHeight = "";

function initAppFrame(x, y, width, height, appType, sourceFile) {
    //alert("initAppFrame(" + x + "," + y + "," + width + "," + height + "," + appType + "," + sourceFile + ")");
    var url;
    if (appType === 'nGrain'){                // branch to wrapper page based on appType
        url = "nGrainApp.html";
    }else if (appType === 'Unity'){                // branch to wrapper page based on appType
        url = "unity3dApp.html";
    }else if (appType === "HTML"){
        url = sourceFile;
    }else{
        url = "";        // default page
    }

    try {
        /*
        unit = "px"
    
        objAppFrame = document.getElementById("appFrame");
        objAppFrame.style.left = x + unit;
        objAppFrame.style.top = y + unit;
        objAppFrame.style.width = width + unit;
        objAppFrame.style.height = height + unit;
        */
        
        var objAppFrame = document.getElementById("appFrame");
        objAppFrame.src = url;
        globalSourceFile = sourceFile;

        //showAppFrame(x, y, width, height);
        //objAppFrame.contentWindow.onLoad(sendMessage("testing onload"));
        return true;
    }
    catch (Error) {
        alert("Error initializing Application Frame: " + Error.description);
        return false;
    }
}

function removeAppFrameContents()
{
    var objAppFrame = document.getElementById("appFrame");
    objAppFrame.src = "";
}

function sendMessage(message) {
   
    alert("Passing Message: " + message);
    document.getElementById("appFrame").contentWindow.recieveMessage(message);
   
}

function infoAppFrame() {
    var objAppFrame = document.getElementById("appFrame");
    alert("(" + objAppFrame.style.left + "," + objAppFrame.style.top + "," + objAppFrame.style.width + "," + objAppFrame.style.height + "," + objAppFrame.src + ")");
}

function showAppFrame(x, y, width, height) {
    var unit = "px";

    globalWidth = width + unit;
    globalHeight = height + unit;
    
    var objAppFrame = document.getElementById("appFrame");

    objAppFrame.style.left = x + unit;
    objAppFrame.style.top = y + unit;
    objAppFrame.style.width = width + unit;
    objAppFrame.style.height = height + unit;
    objAppFrame.style.visibility = "visible";

    //infoAppFrame();
}

function hideAppFrame() {
    document.getElementById("appFrame").style.visibility = "hidden";
}
