
var DIF = {}; 								//DIF 'namespace' helps ensure no conflicts with possible other "SCORM" variables
DIF.UTILS = {}; 							//For holding UTILS functions
DIF.debug = { isActive: true }; 				//Enable (true) or disable (false) for debug mode

DIF.SCORM = {									//Define the SCORM object
    version: null,              					//Store SCORM version.
    handleCompletionStatus: false, 				//Whether or not the wrapper should automatically handle the initial completion status
    handleExitMode: true, 						//Whether or not the wrapper should automatically handle the exit mode
    API: { handle: null,
        isFound: false
    }, 				//Create API child object
    connection: { isActive: false }, 			//Create connection child object
    data: { completionStatus: null,
        exitStatus: null
    }, 			//Create data child object
    debug: {},                 					//Create debug child object


    sessionTime: {elapsedTime: 0,               //object for session timer
                    timer: null
    }
};



/* --------------------------------------------------------------------------------
DIF.SCORM.isAvailable
A simple function to allow Flash ExternalInterface to confirm 
presence of JS wrapper before attempting any LMS communication.

Parameters: none
Returns:    Boolean (true)
----------------------------------------------------------------------------------- */

DIF.SCORM.isAvailable = function() {
    return true;
};



// ------------------------------------------------------------------------- //
// --- SCORM.API functions ------------------------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
DIF.SCORM.API.find(window)
Looks for an object named API in parent and opener windows
   
Parameters: window (the browser window object).
Returns:    Object if API is found, null if no API found
---------------------------------------------------------------------------- */

DIF.SCORM.API.find = function(win) {

    var API = null,
		findAttempts = 0,
        findAttemptLimit = 500,
		traceMsgPrefix = "SCORM.API.find",
		trace = DIF.UTILS.trace,
		scorm = DIF.SCORM;

    while ((!win.API && !win.API_1484_11) &&
           (win.parent) &&
           (win.parent != win) &&
           (findAttempts <= findAttemptLimit)) {

        findAttempts++;
        win = win.parent;

    }

    if (scorm.version) {											//If SCORM version is specified by user, look for specific API

        switch (scorm.version) {

            case "2004":

                if (win.API_1484_11) {

                    API = win.API_1484_11;

                } else {

                    trace(traceMsgPrefix + ": SCORM version 2004 was specified by user, but API_1484_11 cannot be found.");

                }

                break;

            case "1.2":

                if (win.API) {

                    API = win.API;

                } else {

                    trace(traceMsgPrefix + ": SCORM version 1.2 was specified by user, but API cannot be found.");

                }

                break;

        }

    } else {													//If SCORM version not specified by user, look for APIs

        if (win.API_1484_11) {									//SCORM 2004-specific API.

            scorm.version = "2004"; 							//Set version
            API = win.API_1484_11;

        } else if (win.API) {										//SCORM 1.2-specific API

            scorm.version = "1.2"; 							//Set version
            API = win.API;

        }

    }

    if (API) {

        trace(traceMsgPrefix + ": API found. Version: " + scorm.version);
        trace("API: " + API);

    } else {

        trace(traceMsgPrefix + ": Error finding API. \nFind attempts: " + findAttempts + ". \nFind attempt limit: " + findAttemptLimit);

    }

    return API;

};


/* -------------------------------------------------------------------------
DIF.SCORM.API.get()
Looks for an object named API, first in the current window's frame
hierarchy and then, if necessary, in the current window's opener window
hierarchy (if there is an opener window).

Parameters:  None. 
Returns:     Object if API found, null if no API found
---------------------------------------------------------------------------- */

DIF.SCORM.API.get = function() {

    var API = null,
		win = window,
		find = DIF.SCORM.API.find,
		trace = DIF.UTILS.trace;

    if (win.parent && win.parent != win) {

        API = find(win.parent);

    }

    if (!API && win.top.opener) {

        API = find(win.top.opener);

    }

    if (API) {

        DIF.SCORM.API.isFound = true;

    } else {

        trace("API.get failed: Can't find the API!");

    }

    return API;

};


/* -------------------------------------------------------------------------
DIF.SCORM.API.getHandle()
Returns the handle to API object if it was previously set

Parameters:  None.
Returns:     Object (the DIF.SCORM.API.handle variable).
---------------------------------------------------------------------------- */

DIF.SCORM.API.getHandle = function() {

    var API = DIF.SCORM.API;

    if (!API.handle && !API.isFound) {

        API.handle = API.get();

    }

    return API.handle;

};



// ------------------------------------------------------------------------- //
// --- DIF.SCORM.connection functions --------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
DIF.SCORM.connection.initialize()
Tells the LMS to initiate the communication session.

Parameters:  None
Returns:     Boolean
---------------------------------------------------------------------------- */

DIF.SCORM.connection.initialize = function() {

    var success = false,
		scorm = DIF.SCORM,
		completionStatus = DIF.SCORM.data.completionStatus,
		trace = DIF.UTILS.trace,
		makeBoolean = DIF.UTILS.StringToBoolean,
		debug = DIF.SCORM.debug,
		traceMsgPrefix = "SCORM.connection.initialize ";

    //trace("connection.initialize called.");

    if (!scorm.connection.isActive) {

        var API = scorm.API.getHandle(),
            errorCode = 0;

        if (API) {

            switch (scorm.version) {
                case "1.2": success = makeBoolean(API.LMSInitialize("")); break;
                case "2004": success = makeBoolean(API.Initialize("")); break;
            }

            if (success) {

                //Double-check that connection is active and working before returning 'true' boolean
                errorCode = debug.getCode();

                if (errorCode !== null && errorCode === 0) {

                    scorm.connection.isActive = true;

                    if (scorm.handleCompletionStatus) {

                        //Automatically set new launches to incomplete 
                        completionStatus = DIF.SCORM.status("get");

                        if (completionStatus) {

                            switch (completionStatus) {

                                //Both SCORM 1.2 and 2004 
                                case "not attempted": DIF.SCORM.status("set", "incomplete"); break;

                                //SCORM 2004 only 
                                case "unknown": DIF.SCORM.status("set", "incomplete"); break;

                                //Additional options, presented here in case you'd like to use them 
                                //case "completed"  : break; 
                                //case "incomplete" : break; 
                                //case "passed"     : break;	//SCORM 1.2 only 
                                //case "failed"     : break;	//SCORM 1.2 only 
                                //case "browsed"    : break;	//SCORM 1.2 only 

                            }

                        }

                    }

                } else {

                    success = false;
                    trace(traceMsgPrefix + "failed. \nError code: " + errorCode + " \nError info: " + debug.getInfo(errorCode));

                }

                DIF.SCORM.sessionTime.timer = setInterval(function(){DIF.SCORM.sessionTime.tick()},10); //start session_time timer

            } else {

                errorCode = debug.getCode();

                if (errorCode !== null && errorCode !== 0) {

                    trace(traceMsgPrefix + "failed. \nError code: " + errorCode + " \nError info: " + debug.getInfo(errorCode));

                } else {

                    trace(traceMsgPrefix + "failed: No response from server.");

                }
            }

        } else {

            trace(traceMsgPrefix + "failed: API is null.");

        }

    } else {

        trace(traceMsgPrefix + "aborted: Connection already active.");

    }
    return success;

};


/* -------------------------------------------------------------------------
DIF.SCORM.connection.terminate()
Tells the LMS to terminate the communication session

Parameters:  None
Returns:     Boolean
---------------------------------------------------------------------------- */

DIF.SCORM.connection.terminate = function() {

    var success = false,
		scorm = DIF.SCORM,
		exitStatus = DIF.SCORM.data.exitStatus,
		completionStatus = DIF.SCORM.data.completionStatus,
		trace = DIF.UTILS.trace,
		makeBoolean = DIF.UTILS.StringToBoolean,
		debug = DIF.SCORM.debug,
        sessionTime = DIF.SCORM.sessionTime.get(),//get current sessiontime
		traceMsgPrefix = "SCORM.connection.terminate ";


    if (scorm.connection.isActive) {

        trace("Atempting " + traceMsgPrefix);

        var API = scorm.API.getHandle(),
            errorCode = 0;

        if (API) {

            scorm.set("cmi.session_time", sessionTime);

            switch (scorm.version) {
                case "1.2": success = makeBoolean(API.LMSFinish("")); break;
                case "2004": success = makeBoolean(API.Terminate("")); break;
            }

            if (success) {

                scorm.connection.isActive = false;
            } else {

                errorCode = debug.getCode();
                trace(traceMsgPrefix + "failed. \nError code: " + errorCode + " \nError info: " + debug.getInfo(errorCode));

            }

        } else {

            trace(traceMsgPrefix + "failed: API is null.");
        }

    } else {

        trace(traceMsgPrefix + "aborted: Connection already terminated.");
        return true;
    }

    return success;

};

// ------------------------------------------------------------------------- //
// --- DIF.SCORM.data functions --------------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
DIF.SCORM.data.get(parameter)
Requests information from the LMS.

Parameter: parameter (string, name of the SCORM data model element)
Returns:   string (the value of the specified data model element)
---------------------------------------------------------------------------- */
DIF.SCORM.data.get = function(parameter) {

	parameter = Scorm12equivalent(parameter);
	if(parameter === "")return "";

    var value = null,
		scorm = DIF.SCORM,
		trace = DIF.UTILS.trace,
		debug = DIF.SCORM.debug,
		traceMsgPrefix = "SCORM.data.get(" + parameter + ") ";
    	

    if (scorm.connection.isActive) {

        var API = scorm.API.getHandle(),
            errorCode = 0;

        if (API) {

            switch (scorm.version) {
                case "1.2": value = API.LMSGetValue(parameter);break;
                case "2004": value = API.GetValue(parameter); break;
                //case "2004": wait(10000); value = API.GetValue(parameter); break;  
                //case "2004": setTimeout("value = API.GetValue(parameter); break;", 5000);    
                //case "2004": setTimeout("modalWin();", 1); value = API.GetValue(parameter); break; 
            }
            //modalWin();

            errorCode = debug.getCode();

            //GetValue returns an empty string on errors
            //Double-check errorCode to make sure empty string
            //is really an error and not field value
            if (value !== "" && errorCode === 0) {

                switch (parameter) {

                    case "cmi.core.lesson_status":
                    case "cmi.completion_status": scorm.data.completionStatus = value; break;

                    case "cmi.core.exit":
                    case "cmi.exit": scorm.data.exitStatus = value; break;

                }

            } else {

                trace(traceMsgPrefix + "failed. \nError code: " + errorCode + "\nError info: " + debug.getInfo(errorCode));

            }

        } else {

            trace(traceMsgPrefix + "failed: API is null.");

        }

    } else {

        trace(traceMsgPrefix + "failed: API connection is inactive.");

    }

    trace(traceMsgPrefix + " parameter: " + parameter + " value: " + value);

    //the return value of this line is not being used on the flash side and for some reason this line is causing the next line not to run in some browsers 
    //DIF.UTILS.ReturnValue(value);
    return String(value);

};


/* -------------------------------------------------------------------------
DIF.SCORM.data.set()
Tells the LMS to assign the value to the named data model element.
Also stores the SCO's completion status in a variable named
DIF.SCORM.data.completionStatus. This variable is checked whenever
DIF.SCORM.connection.terminate() is invoked.

Parameters: parameter (string). The data model element
value (string). The value for the data model element
Returns:    Boolean
---------------------------------------------------------------------------- */

DIF.SCORM.data.set = function (parameter, value, maxChar) {
    console.log('@@@111SCORMset parameter=' + parameter + '   value=' + value);
    if (DIF.SCORM.version === "1.2") {
        parameter = Scorm12equivalent(parameter);
        if (parameter === "") return "true";

        value = DIF.SCORM.scorm12StringFormatter(parameter, value);
        console.log('@@@222SCORMset parameter=' + parameter + '   value=' + value);

    }
    //Modification to truncate description @MOD
    maxChar = typeof maxChar !== 'undefined' ? maxChar : 0;
    if (maxChar > 0 && parameter.search("cmi.interactions.") != -1 && parameter.search(".description") != -1) {
        value = DIF.SCORM.truncateString(value, maxChar);
    }
    //End Mod 
    var success = false,
		scorm = DIF.SCORM,
		trace = DIF.UTILS.trace,
		makeBoolean = DIF.UTILS.StringToBoolean,
		debug = DIF.SCORM.debug,
		traceMsgPrefix = "SCORM.data.set(" + parameter + ") ";

	//alert("parameter: value "+ parameter+":"+value);
    if (scorm.connection.isActive) {

        var API = scorm.API.getHandle(),
            errorCode = 0;

        if (API) {

            switch (scorm.version) {
                case "1.2": success = makeBoolean(API.LMSSetValue(parameter, value)); break;
                case "2004": success = makeBoolean(API.SetValue(parameter, value)); break;
            }

            if (success) {

                trace(traceMsgPrefix + " : parameter : " + parameter + " : value : " + value)

                //@removeMe this is the javascript keeping track of completion 
                if (parameter === "cmi.core.lesson_status" || parameter === "cmi.completion_status") {

                    scorm.data.completionStatus = value;

                }

            } else {

                trace(traceMsgPrefix + "failed. \nError code: " + errorCode + ". \nError info: " + debug.getInfo(errorCode));

            }

        } else {

            trace(traceMsgPrefix + "failed: API is null.");

        }

    } else {

        trace(traceMsgPrefix + "failed: API connection is inactive.");

    }

    return success;

};


/* -------------------------------------------------------------------------
DIF.SCORM.data.save()
Instructs the LMS to persist all data to this point in the session

Parameters: None
Returns:    Boolean
---------------------------------------------------------------------------- */

DIF.SCORM.data.save = function() {

    var success = false,
		scorm = DIF.SCORM,
		trace = DIF.UTILS.trace,
		makeBoolean = DIF.UTILS.StringToBoolean,
		traceMsgPrefix = "SCORM.data.save";


    if (scorm.connection.isActive) {

        var API = scorm.API.getHandle();

        if (API) {

            switch (scorm.version) {
                case "1.2": success = makeBoolean(API.LMSCommit("")); break;
                case "2004": success = makeBoolean(API.Commit("")); break;
            }

            if(success) trace(traceMsgPrefix + " success!");

        } else {

            trace(traceMsgPrefix + ": API is null.");

        }

    } else {

        trace(traceMsgPrefix + ": API connection is inactive.");

    }

    return success;

};


DIF.SCORM.status = function(action, status) {

    var success = false,
		scorm = DIF.SCORM,
		trace = DIF.UTILS.trace,
		traceMsgPrefix = "SCORM.getStatus failed",
		cmi = "";

    if (action !== null) {

        switch (scorm.version) {
            case "1.2": cmi = "cmi.core.lesson_status"; break;
            case "2004": cmi = "cmi.completion_status"; break;
        }

        switch (action) {

            case "get": success = DIF.SCORM.data.get(cmi); break;

            case "set": if (status !== null) {

                    success = DIF.SCORM.data.set(cmi, status);

                } else {

                    success = false;
                    trace(traceMsgPrefix + ": status was not specified.");

                }

                break;

            default: success = false;
                trace(traceMsgPrefix + ": no valid action was specified.");

        }

    } else {

        trace(traceMsgPrefix + ": action was not specified.");

    }

    return success;

};


// ------------------------------------------------------------------------- //
// --- DIF.SCORM.debug functions -------------------------------------- //
// ------------------------------------------------------------------------- //


/* -------------------------------------------------------------------------
DIF.SCORM.debug.getCode
Requests the error code for the current error state from the LMS

Parameters: None
Returns:    Integer (the last error code).
---------------------------------------------------------------------------- */

DIF.SCORM.debug.getCode = function() {

    var API = DIF.SCORM.API.getHandle(),
		scorm = DIF.SCORM,
		trace = DIF.UTILS.trace,
        code = 0;

    if (API) {

        switch (scorm.version) {
            case "1.2": code = parseInt(API.LMSGetLastError(), 10); break;
            case "2004": code = parseInt(API.GetLastError(), 10); break;
        }

    } else {

        trace("SCORM.debug.getCode failed: API is null.");

    }

    return code;

};


/* -------------------------------------------------------------------------
DIF.SCORM.debug.getInfo()
"Used by a SCO to request the textual description for the error code
specified by the value of [errorCode]."

Parameters: errorCode (integer).  
Returns:    String.
----------------------------------------------------------------------------- */

DIF.SCORM.debug.getInfo = function(errorCode) {

    var API = DIF.SCORM.API.getHandle(),
		scorm = DIF.SCORM,
		trace = DIF.UTILS.trace,
        result = "";


    if (API) {

        switch (scorm.version) {
            case "1.2": result = API.LMSGetErrorString(errorCode.toString()); break;
            case "2004": result = API.GetErrorString(errorCode.toString()); break;
        }

    } else {

        trace("SCORM.debug.getInfo failed: API is null.");

    }

    return String(result);

};


/* -------------------------------------------------------------------------
DIF.SCORM.debug.getDiagnosticInfo
"Exists for LMS specific use. It allows the LMS to define additional
diagnostic information through the API Instance."

Parameters: errorCode (integer).  
Returns:    String (Additional diagnostic information about the given error code).
---------------------------------------------------------------------------- */

DIF.SCORM.debug.getDiagnosticInfo = function(errorCode) {

    var API = DIF.SCORM.API.getHandle(),
		scorm = DIF.SCORM,
		trace = DIF.UTILS.trace,
        result = "";

    if (API) {

        switch (scorm.version) {
            case "1.2": result = API.LMSGetDiagnostic(errorCode); break;
            case "2004": result = API.GetDiagnostic(errorCode); break;
        }

    } else {

        trace("SCORM.debug.getDiagnosticInfo failed: API is null.");

    }

    return String(result);

};



/* -------------------------------------------------------------------------
DIF.SCORM.data.Scorm12equivalent()

Convert Scorm 2004 data model to Scorm 1.2 data model if Scorm vesion is 1.2

Its a uncompleted list, need to add more if necessary;  

Parameters: data2004 (string)  
Return:     string
---------------------------------------------------------------------------- */

function Scorm12equivalent(data2004){

	var convertstr = data2004;

	if(DIF.SCORM.version === "1.2") {
		
		if(data2004 === "cmi.completion_status" ) {
			convertstr = 	"cmi.core.lesson_status";

		} else if(data2004 === "cmi.exit" ) {
			convertstr = "cmi.core.exit";

		} else if(data2004 === "cmi.location" ) {
			convertstr = "cmi.core.lesson_location";

		} else if(data2004 === "cmi.learner_id" ) {
			convertstr = "cmi.core.student_id";

		} else if(data2004 === "cmi.learner_name" ) {
			convertstr = "cmi.core.student_name";

		} else if(data2004 === "cmi.score.raw" ) {
			convertstr = "cmi.core.score.raw";

		} else if(data2004 === "cmi.score.min" ) {
			convertstr = "cmi.core.score.min";

		} else if(data2004 === "cmi.score.max" ) {
			convertstr = "cmi.core.score.max";
		
		} else if(data2004.indexOf("cmi.interactions.") === 0 && data2004.indexOf(".timestamp") > 16) {
			convertstr = data2004.replace(".timestamp",".time");

		} else if(data2004.indexOf("cmi.interactions.") === 0 && data2004.indexOf(".learner_response") > 16) {
			convertstr = data2004.replace(".learner_response",".student_response");

		} else if(data2004 === "adl.nav.request" ) {
			convertstr = "";

		} else if(data2004 === "cmi.success_status" ) {
			convertstr = "cmi.core.lesson_status";
		
		}else if(data2004.indexOf("cmi.interactions.") === 0 && data2004.indexOf(".description") > 16) {
			convertstr = "";
		}else if(data2004 === "cmi.session_time"){
            convertstr = "cmi.core.session_time";
        }
	}
	//alert("----Scorm12equivalent@3---- "+convertstr);
	return convertstr;

}


/* -------------------------------------------------------------------------
        timeintervalToCMITimespant()

        Convert Scorm 2004 data model values to Scorm 1.2 data model values if Scorm vesion is 1.2

        Note: Currently not setup to work with Get  

        Parameters: 2004 timeinterval  P[yY][mM][dD][T[hH][nM][s[.s]S]] (string)  
        Return:     1.2 CMITimespan hhhh:mm:ss.ss string
---------------------------------------------------------------------------- */
DIF.SCORM.scorm12StringFormatter = function(parameter, value){
    switch(parameter) {
        case "cmi.core.session_time":
            value = DIF.SCORM.timeintervalToCMITimespan(value);
            break;
    }
    return value;
}

/*--------------------------------------------------------------------------
        Value Convertion Functions
----------------------------------------------------------------------------*/


/* -------------------------------------------------------------------------
        timeintervalToCMITimespant()

        Convert Scorm 2004 timeinterval to Scorm 1.2 CMITimespan

        Example: 
        2 days 3 hours 4 minutes and 55.66 seconds
        is passed in as a timeinterval that = "P2DT3H4M55.66S"

        its returned as a CMITimespan that = "0051:04:55.66";


        Parameters: 2004 timeinterval  P[yY][mM][dD][T[hH][nM][s[.s]S]] (string)  
        Return:     1.2 CMITimespan hhhh:mm:ss.ss string
---------------------------------------------------------------------------- */
            
        DIF.SCORM.timeintervalToCMITimespan = function(timeinterval){
            var lastIndexFound = 1;
            var years = 0;
            var months = 0;
            var days = 0;
            var hours = 0;
            var minutes = 0;
            var seconds = 0;
            var fractSeconds = 0; //100th of a second 

            //for clearity +string converts a string to an integer
            // and int+"" converts and interger to a string
            // i know javascript is dumb :)

            if(timeinterval.indexOf("Y")!= -1){
                years = +timeinterval.substring(lastIndexFound,timeinterval.indexOf("Y"));
                lastIndexFound = timeinterval.indexOf("Y")+1;
            }
            if(timeinterval.indexOf("M")!= -1 && timeinterval.indexOf("M") < timeinterval.indexOf("T")){
                months = +timeinterval.substring(lastIndexFound,timeinterval.indexOf("M"));
                lastIndexFound = timeinterval.indexOf("M")+1;
            }
            if(timeinterval.indexOf("D")!= -1){
                days = +timeinterval.substring(lastIndexFound,timeinterval.indexOf("D"));
                lastIndexFound = timeinterval.indexOf("D")+1;
            }

            timeinterval = timeinterval.substring(timeinterval.indexOf("T"));
            lastIndexFound = timeinterval.indexOf("T")+1; //adjusting for The T

            if(timeinterval.indexOf("H")!= -1){
                hours = +timeinterval.substring(lastIndexFound,timeinterval.indexOf("H"));
                lastIndexFound = timeinterval.indexOf("H")+1;
            }
            if(timeinterval.indexOf("M")!= -1){
                minutes = ""+timeinterval.substring(lastIndexFound,timeinterval.indexOf("M"));
                lastIndexFound = timeinterval.indexOf("M")+1;
            }
            if(timeinterval.indexOf("S")!= -1){
                seconds = ""+Math.floor(timeinterval.substring(lastIndexFound,timeinterval.indexOf("S"))); //I Don't want fractions of seconds
                fractSeconds = timeinterval.substring(timeinterval.indexOf(".")+1,timeinterval.indexOf("S"));
                lastIndexFound = timeinterval.indexOf("S")+1;
            }

            //months is impossible to convert to hours but htis shouldn't be an issue for us in fact it should never be used but i'll add an estimation to get us close just in case

            var CMIHours = (years * 8760) + (months * 730) + (days * 24) + hours;

            if(CMIHours > 9999) return "9999:99:99.99";// caped at 4 digits or 9999 hours.

            //make sure hours has 4 characters
            CMIHours += ""; 
            if(CMIHours.length < 4){
                for(var i = 4 - CMIHours.length; i > 0; i--){
                     CMIHours = "0" + CMIHours;
                }
            }

            minutes = ""+minutes//make sure its a string so it definatly has a length
            var CMIMinutes = (minutes.length == 1) ? "0" + minutes : minutes; //make sure minutes has 2 characters
            var CMISeconds = (seconds.length == 1) ? "0" + seconds : seconds; //make sure seconds has 2 characters
            var CMIFractSeconds = (fractSeconds.length == 1) ? fractSeconds + "0" : fractSeconds; //because its a decimal to 0 goes after

            var CMITimespan = CMIHours + ":" + CMIMinutes + ":" + CMISeconds + "." + CMIFractSeconds; //i'm assumeing that the string recieved by this function was formated properly so im not gonna cheack if minutes/sec > 60
            return CMITimespan;
        }

        /*
            Session time incermenter function:
        */
        DIF.SCORM.sessionTime.tick = function(){
            DIF.SCORM.sessionTime.elapsedTime++;
        }

        //this function returns a scorm 2004 formated timeinterval string of the current session time
        DIF.SCORM.sessionTime.get = function(){
            var elapsedTime = DIF.SCORM.sessionTime.elapsedTime;
            return DIF.SCORM.timeintervalConvertion(elapsedTime*10);
        }

        /*
            This function Converts milliseconds into a SCORM 2004 timeinterval formated String

            Parameters: miliseconds (int)
            Return: 2004 timeinterval  P[yY][mM][dD][T[hH][nM][s[.s]S]] (string)
        */ 
        DIF.SCORM.timeintervalConvertion = function(miliseconds){

            if(miliseconds != 0){
                var _miliseconds = miliseconds;
                
                var milisec = _miliseconds % 1000;
                var remainder =(_miliseconds - milisec)/1000;
                var sec = remainder % 60;
                remainder = (remainder - sec) / 60;
                //SCORM only supports Centiseconds 
                //sec = sec + Math.round((milisec/1000)*100)/100; //this is the long math
                sec = sec + Math.round(milisec/10)/100; //simplified
                    
                var min = remainder % 60;
                remainder = (remainder - min)/60;
                    
                var hours = remainder % 24;
                remainder = (remainder - hours)/24;
                    
                var days = remainder;
                    
                var _asString = "P";
                _asString = _asString + (days > 0 ? days +"D": "");
                _asString = _asString + ((hours > 0 || min > 0 || sec > 0) ? "T" : "");
                _asString = _asString + (hours > 0 ? hours +"H": "");
                _asString = _asString + (min > 0 ? min +"M": "");
                _asString = _asString + (sec > 0 ? sec + "S": "");
                
                return _asString;
            }
                
        }
        //Modification to truncate description @MOD
        DIF.SCORM.truncateString = function(value, maxChar) {
            if(value.length > maxChar){
                value = value.substr(0,maxChar-3);
                value += "...";
            }
            return value;
        }
        //End of Modification





        // ------------------------------------------------------------------------- //
        // --- DIF.UTILS functions -------------------------------------------- //
        // ------------------------------------------------------------------------- //


        /* -------------------------------------------------------------------------
        DIF.UTILS.StringToBoolean()
        Converts 'boolean strings' into actual valid booleans.
   
        (Most values returned from the API are the strings "true" and "false".)

        Parameters: String
        Returns:    Boolean
        ---------------------------------------------------------------------------- */

        DIF.UTILS.StringToBoolean = function (string) {
            switch (string.toLowerCase()) {
                case "true": case "yes": case "1": return true;
                case "false": case "no": case "0": case null: return false;
                default: return Boolean(string);
            }
        };



        /* -------------------------------------------------------------------------
        DIF.UTILS.trace()
        Displays error messages when in debug mode.

        Parameters: msg (string)  
        Return:     None
        ---------------------------------------------------------------------------- */

        DIF.UTILS.trace = function (msg) {

            if (DIF.debug.isActive) {

                //Firefox users can use the 'Firebug' extension's console.
                if (window.console && window.console.firebug) {
                    console.log(msg);
                } else {
                    //alert("@@@ "+msg);
                }

            }
        };

        /* -------------------------------------------------------------------------
        DIF.UTILS.ReturnValue()
        Flash callback function return API-called value back to Flash
   
        Parameters: String
        Returns:    String
        ---------------------------------------------------------------------------- */

        DIF.UTILS.ReturnValue = function (value) {
            //alert(value);
            //alert(window.form1.Previewer);
            window.form1.Previewer.DIFSetReturnValue(value);
        };


        function modalWin() {
            if (window.showModalDialog) {
                window.showModalDialog("sco1.htm", "name",
"dialogWidth:255px;dialogHeight:250px");
            } else {
                window.open('xsco1htm', 'name', 'height=255,width=250,toolbar=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no ,modal=yes');
            }
        }

        function wait(msecs) {
            var start = new Date().getTime();
            var cur = start
            while (cur - start < msecs) {
                cur = new Date().getTime();
            }
        }

// ------------------------------------------------------------------------- //
// --- Shortcuts! ---------------------------------------------------------- //
// ------------------------------------------------------------------------- //

        // Because nobody likes typing verbose code.

        DIF.SCORM.init = DIF.SCORM.connection.initialize;
        DIF.SCORM.get = DIF.SCORM.data.get;
        DIF.SCORM.set = DIF.SCORM.data.set;
        DIF.SCORM.save = DIF.SCORM.data.save;
        DIF.SCORM.quit = DIF.SCORM.connection.terminate;


// ----Window OnBeforeUnload Event Handler---------------------------------- //
// --- When user click X to close window //
// --- it will run scrom terminate process first //
// --- This function should be removed out of the SCORM package eventually-- //
// ------------------------------------------------------------------------- //

        DIF.SCORM.setWindowOnBeforeUnload = function () {
            // alert("set onbeforeunload");
            window.onbeforeunload = function () { DIF.SCORM.quit(); };
        };

// ------------------------------------------------------------------------- //
// --- When user click menu 'Exit'  to close window //
// --- scrom terminate process should be called first in Flash code before calling this functino //
// --- This function should be removed out of the SCORM package eventually-- //
// ------------------------------------------------------------------------- //

        DIF.SCORM.closeTraining = function () {
            // alert("close training");
            window.onbeforeunload = null; //disable onbedoreunload
            window.close();
        };



