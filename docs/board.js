"use strict";
	
var board_CLIENT_ID = '1079972761471-j4b2l90p0rpkrkplf1j6avkue436c74p.apps.googleusercontent.com';

var board_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];


var board {
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
	document.getElementById("myspan").innerHTML=authResult.error;
  };
}
}

var board_authBoxWritten = false;
function board_writeAuth() {
	if (board_authBoxWritten) return;
	document.write("<div id=\"board_authorize-div\"><span id=\"board_auth_error\"></span><br><span>Authorize access to Google Sheets API</span><button id=\"board_authorize-button\" onclick=\"board_handleAuthClick(event)\">Authorize</button></div>");
};
function board_hideAuthButton() {
  var authorizeDiv = document.getElementById('board_authorize-div');
  if (typeof(authorizeDiv)!="undefined") {
	  if (null!=authorizeDiv) authorizeDiv.style.display = 'none';
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



