"use strict";

//https://developers.google.com/api-client-library/javascript/reference/referencedocs


var board_CLIENT_ID = tenant_specific_data.google_docs_client_id;

var board_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];


var board = {
	onAuthFn: undefined,
	onErrorFn: undefined,
};

function board_error(msg) {
	if (typeof(board.onErrorFn)=="undefined") {
		board.onErrorFn(msg);
	} else {
		console.log("Board error no error function - " + msg);
	};
};

function board_checkAuth(onAuthFn,onErrorFn) {
board.onAuthFn = onAuthFn;
board.onErrorFn = onErrorFn;
gapi.auth.authorize(
  {
	'client_id': board_CLIENT_ID,
	'scope': board_SCOPES.join(' '),
	'immediate': true
  }, board_handleAuthResult);
}	  

/**
* Handle response from authorization server.
*
* @param {Object} authResult Authorization result.
*/
function board_handleAuthResult(authResult) {
if (authResult && !authResult.error) {
  // Hide auth UI, then load client library.
  board_hideAuthButton();
  var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
  gapi.client.load(discoveryUrl).then(board.onAuthFn);
} else {
  // Show auth UI, allowing the user to initiate authorization by
  // clicking authorize button.
  board_writeAuth();
  if (!authResult.error) {
	$("#myspan").text(authResult.error);
  };
}
}

var board_authBoxWritten = false;
function board_writeAuth() {
	if (board_authBoxWritten) return;
	$(document.body).append("<div id=\"board_authorize-div\"><span id=\"board_auth_error\"></span><br><span>Authorize access to Google Sheets API</span><button id=\"board_authorize-button\" onclick=\"board_handleAuthClick(event)\">Authorize</button></div>");
};
function board_hideAuthButton() {
  var authorizeDiv = $("#board_authorize-div");
  if (typeof(authorizeDiv)!="undefined") {
	  if (null!=authorizeDiv) authorizeDiv.css("display","none");
  };
};
	  
/*
Get data from a spreadsheet
 return call to respfn with array of arranges
*/
function board_getDataRangesFromSheet(spreadsheetId,ranges,respfn) {
	gapi.client.sheets.spreadsheets.values.batchGet({
		spreadsheetId: spreadsheetId,
		ranges: ranges,
	}).then(function(response) {
		if (response.status!=200) {
			board_error("ERROR A - response " + response.status);
			return;
		};
		respfn(response.result.valueRanges);
	});
};

function board_handleAuthClick(event) {
	gapi.auth.authorize(
		{client_id: board_CLIENT_ID, scope: board_SCOPES, immediate: false},
		board_handleAuthResult
	);
	return false;
}

function board_columnToLetter(column)
{
  column=column+1;
  
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

var board_saveBatch = [];
function board_prepare_saveBatch() {
	board_saveBatch = [];
};
function board_append_saveBatch(saveObj) {
	board_saveBatch.push(saveObj);
};
function board_execute_saveBatch(spreadsheetId) {
	if (board_saveBatch.length==0) {
		//console.log("Nothing to save");
		return;
	} else {
		//console.log("Making " + board_saveBatch.length + " updates");
	};
	var batchUpdateData = {
		"valueInputOption": "RAW",
		"data": board_saveBatch
	};
	gapi.client.sheets.spreadsheets.values.batchUpdate({
		spreadsheetId: spreadsheetId,
		resource: batchUpdateData,
	}).then(function(response) {
		if (response.status!=200) {
			board_error("ERROR Saving - response " + response.status);
			return;
		};
		//No Confirmation call
	})	
};

/*
Function to check what access level the current user has for a particular sheet
return values:
 - NONE
 - READONLY_NOWRITETEST
 - READONLY
 - READWRITE
*/
function board_check_sheet_accessLevel(sheetID,cbfunction) {
	//console.log("board_check_sheet_accessLevel start");

	gapi.client.sheets.spreadsheets.get({
		spreadsheetId: sheetID,
		includeGridData: false,
		ranges: "A1",
		fields:"sheets"
	}).then(function(response) {
		if (response.status!=200) {
			cbfunction("NONE");
			return;
		};
		if (0==response.result.sheets.length) {
			cbfunction("READONLY_NOWRITETEST");
			return;
		};
		var sheetName = response.result.sheets[0].properties.title;
		var sheetA1Value = response.result.sheets[0].data[0].rowData[0].values[0].effectiveValue.stringValue;
		var targetRange = sheetName + "!A1";
		//console.log(sheetA1Value);

		var resource = {
			"values": [[sheetA1Value]],
		};


		gapi.client.sheets.spreadsheets.values.update({
			spreadsheetId: sheetID,
			"range": targetRange,
			"valueInputOption": "RAW",
			resource:resource
		}).then(function(response2) {
			if (response2.status!=200) {
				cbfunction("READONLY");
				return;
			};
			//console.log(response2);
			cbfunction("READWRITE");
			return;
		}, function (reason) {
			cbfunction("READONLY");
		});
	}, function (reason) {
		console.log(reason);
		cbfunction("NONE");
	});



};

