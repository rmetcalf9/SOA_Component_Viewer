"use strict";
function rjmlib_safeidstring(str) {
	var nstr = str.replace(/\s+/g, '');
	nstr = nstr.replace('.', '');
	nstr = nstr.replace('\\', '');
	return nstr;
};
function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function rjmlib_hittest(obj, x, y) {
	var offset = obj.offset();
	if (x<offset.left) return false;
	//console.log("y=" + y + ":" + offset.top);
	if (y<offset.top) return false;
	if (x>(offset.left+obj.width())) return false;
	if (y>(offset.top+obj.height())) return false;
	return true;
}

function rjmlib_createGuid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var rjmlib_debuglevel = 0; //to be overridden in code
function rjmlib_debug(level,msg) {
	if (level<=rjmlib_debuglevel) console.log("DEBUG(" + level + "):" + msg);
};

function rjmlib_isParseError(parsedDocument) {
    // parser and parsererrorNS could be cached on startup for efficiency
    var parser = new DOMParser(),
        errorneousParse = parser.parseFromString('<', 'text/xml'),
        parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
        // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
        return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
};

function rjmlib_copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  textArea.style.width = '2em';
  textArea.style.height = '2em';

  textArea.style.padding = 0;

  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  textArea.style.background = 'transparent';

  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  var ok = false;
  try {
    var copyres = document.execCommand('copy');
    if (copyres == true) {
    	ok = true;
    };
  } catch (err) {
  }

  document.body.removeChild(textArea);
  
  return ok;
}

//Function created for Personal Services
function rjmllib_ps_geturistring(xPathRes, xmlDoc) {
	//console.log(xPathRes);
	var cur = xPathRes.iterateNext ();
	while (cur) {
		//console.log(cur);
		var prefix = "http://";
		var backHOST = xmlDoc.evaluate("xp:URI/xp:host",cur, nsResolver, XPathResult.STRING_TYPE).stringValue;
		var backPORT = xmlDoc.evaluate("xp:URI/xp:port",cur, nsResolver, XPathResult.STRING_TYPE).stringValue;
		var backURI = backHOST + ":" + backPORT;
		if (backURI==":") return "";

		var https = xmlDoc.evaluate("xp:URI/xp:https",cur, nsResolver, XPathResult.STRING_TYPE).stringValue;
		if (https=="true") prefix="https://";
		return prefix + backURI;
		cur = xPathRes.iterateNext();
	}
	return "ERROR rjmllib_ps_geturistring"
}

function rjmllib_randU32(strong) {
	return window.crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;
}

function rjmllib_ArrayRemove(arr,v) {
    if (arr.indexOf(v) != -1) {
        arr.splice(arr.indexOf(v), 1);
        return true;
    }
    return false;
};

