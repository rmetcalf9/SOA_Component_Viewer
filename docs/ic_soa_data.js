"use strict";

function ic_soa_data_getSheetID() {
	return tenant_specific_data.google_sheets_sheet_id;
};
function ic_soa_data_getListsRange() {
	return 'Data!A2:A';
};

function ic_soa_data_getSheetList() {
	var ret = [];
	ret.push("EDF");
	ret.push("INT");
	ret.push("PRES");
	ret.push("POINT");
	ret.push("RESOURCELANES");
	ret.push("RESOURCEALLOCATION");
	return ret;
};

function getResourseAllocationObjectCombinedTagListFN(raobj) {
	return function () {
		return component_viewer_res_data_getcombinedtagList(raobj);
	};
};

var ic_soa_data_SheetMetrics = undefined;
function ic_soa_data_getSheetMetrics() {
	if (typeof(ic_soa_data_SheetMetrics)=="undefined") {
		ic_soa_data_SheetMetrics = {};
		
		ic_soa_data_SheetMetrics["EDF"] = {
			datarange: 'EDFList!A2:I',
			sheet_name: 'EDFList',
			user_component_type_name: 'EDF',
			css_tag: 'red',
			default_estimate: 12,
			indexcol: 1,
			toprow: 2,
			namecol: 2,
			listcol: 3,
			tagscol: 5,
			uidcol: 0,
			source_sys_col: 4,
			ebocol: 6,
			inbound_operation_text_col: 7,
			outbound_operation_text_col: 8
		};
		ic_soa_data_SheetMetrics["INT"] = {
			datarange: 'Integration!A2:I',
			sheet_name: 'Integration',
			user_component_type_name: 'Integration',
			css_tag: 'green',
			default_estimate: 7,
			indexcol: 1,
			toprow: 2,
			namecol: 4,
			listcol: 5,
			tagscol: 6,
			uidcol: 0,
			target_sys_col: 3,
			source_edf_col: 2,
			inbound_operation_text_col: 7,
			outbound_operation_text_col: 8
		};
		ic_soa_data_SheetMetrics["PRES"] = {
			datarange: 'Presentation!A2:H',
			sheet_name: 'Presentation',
			user_component_type_name: 'Presentation',
			css_tag: 'blue',
			default_estimate: 5,
			toprow: 2,
			uidcol: 0,
			indexcol: 1,
			namecol: 3,
			listcol: 4,
			tagscol: 5,
			provider_sys_col: 6,
			known_client_col: 7,
			rawnamecol: 2
		};
		ic_soa_data_SheetMetrics["POINT"] = {
			datarange: 'Point2Point!A2:H',
			sheet_name: 'Point2Point',
			user_component_type_name: 'Point2Point',
			css_tag: 'yellow',
			default_estimate: 10,
			toprow: 2,
			uidcol: 0,
			indexcol: 1,
			namecol: 3,
			listcol: 4,
			tagscol: 5,
			provider_sys_list_col: 6,
			client_list_col: 7,
			rawnamecol: 2
		};
		ic_soa_data_SheetMetrics["RESOURCELANES"] = {
			datarange: 'ResourceLanes!A2:D',
			sheet_name: 'ResourceLanes',
			toprow: 2,
			uidcol: 0,
			ratecol: 1,
			autoassigncol: 2,
			ordercol: 3
		};
		ic_soa_data_SheetMetrics["RESOURCEALLOCATION"] = {
			datarange: 'ResourceAllocation!A2:M',
			sheet_name: 'ResourceAllocation',
			toprow: 2,
			uidcol: 0,
			itemuidcol: 1,
			textcol: 2,
			resourcelaneassignmentcol: 3,
			assignmentratecol: 4,
			originaldayscol: 5,
			remainingdayscol: 6,
			lastupdatecol: 7,
			statuscol: 8,
			binpackprioritycol: 9,
			tagscol: 10,
			datecreatecol: 11,
			descriptioncol: 12,
		};	
	}; //if undefined
	return ic_soa_data_SheetMetrics;
};

/*
Function to load system array from comma seperated list
returns an array of systems
if required adds the system to the SYSTEMs list
*/
function ic_soa_data_loadSYSTEMSFromCommaList(commaListOfSystems, SYSTEMs, SYSTEMkeys) {
	var return_array = [];
	if (typeof(commaListOfSystems)!="undefined") {
		var sys_array = commaListOfSystems.split(",");
		for(var i = 0; i < sys_array.length; i++) {
			return_array.push(sys_array[i].trim());
		}
	};
	for(var i = 0; i < return_array.length; i++) {
		if (typeof(SYSTEMs[return_array[i]])=="undefined") {
			//Add known clients to SYSTEMs array
			SYSTEMkeys.push(return_array[i]);
			SYSTEMs[return_array[i]] = {
				uid: return_array[i],
				name: return_array[i]
			}
		};
	};
	return return_array;
};

//Given an input string add all it's tags to the tags array
// same function is also in the kanbancomponent.js
function ic_soa_data_buildtaglist_tag(comma_seperated_tag_list, outputTagList) {
	if (typeof(comma_seperated_tag_list)!="undefined") {
		comma_seperated_tag_list=comma_seperated_tag_list.trim();
		if (comma_seperated_tag_list.length>0) {
			var tags = comma_seperated_tag_list.split(",");
			for (var i=0;i<tags.length;i++) {
				if (typeof(tags[i])!="undefined") {
					var tag = tags[i].trim();
					if (tag!="") {
						if (typeof(outputTagList[tag])=="undefined") {
							outputTagList[tag] = tag;
						};
					};
				};
			};
		};
	};
};
//Given a comma seperated list of tags return true if the passed tag is in the list
function ic_soa_data_istaginlist(tag, comma_seperated_tag_list) {
	var TAGlis = [];
	ic_soa_data_buildtaglist_tag(comma_seperated_tag_list, TAGlis);
	return typeof(TAGlis[tag])!="undefined";
};

//Function number of tags in taglist
function ic_soa_data_num_of_tags(comma_seperated_tag_list) {
	if (typeof(comma_seperated_tag_list)=="undefined") return 0;
	var tmp = comma_seperated_tag_list.trim();
	if (tmp.length==0) return 0;
	return ((tmp.match(/,/g) || []).length) + 1;
};

function ic_soa_data_getDataObject(sheetList, sheetMetrics, googleAPIResult, numPre) {
	//numPre - number of ranges in the result before the sheets
	//   sheets must be at the end

	var EDFkeys = [];
	var EDFs = {};

	var INTkeys = [];
	var INTs = {};

	var PRESkeys = [];
	var PRESs = {};

	var POINTkeys = [];
	var POINTs = {};

	var RESOURCELANESkeys = [];
	var RESOURCELANESs = {};

	var RESOURCEALLOCATIONkeys = [];
	var RESOURCEALLOCATIONs = {};

	var SYSTEMkeys = [];
	var SYSTEMs = {};
	
	var TAGs = [];

	//console.log(googleAPIResult);
	//Can't rely on result to match it with Sheet
	//So assuming the order matches the order in getSheetList

	if (googleAPIResult.length != (sheetList.length + numPre)) {
		report_error("Bad response");
		return;
	};

	var sheetListIdx = 0;
	
	sheetListIdx = 0;  //0 = EDF
	var range = googleAPIResult[sheetListIdx + numPre];
	var cur_sheet_metrics = sheetMetrics[sheetList[sheetListIdx]];
	if (range.values.length > 0) {
		for (var i = 0; i < range.values.length; i++) {
			var row = range.values[i];
			var source_system = row[cur_sheet_metrics.source_sys_col];
			ic_soa_data_buildtaglist_tag(row[cur_sheet_metrics.tagscol],TAGs);
			EDFkeys.push(row[cur_sheet_metrics.uidcol]);
			EDFs[row[cur_sheet_metrics.uidcol]] = {
				source_sheet: sheetList[sheetListIdx],
				uid: row[cur_sheet_metrics.uidcol],
				name: row[cur_sheet_metrics.namecol],
				status: row[cur_sheet_metrics.listcol],
				tags: row[cur_sheet_metrics.tagscol],
				sheet_row: (i+cur_sheet_metrics.toprow),
				order: row[cur_sheet_metrics.indexcol],
				source_system: source_system,
				ebo: row[cur_sheet_metrics.ebocol],
				inbound_operation_text: row[cur_sheet_metrics.inbound_operation_text_col],
				outbound_operation_text: row[cur_sheet_metrics.outbound_operation_text_col],
			}
			if (typeof(SYSTEMs[source_system])=="undefined") {
				SYSTEMkeys.push(source_system);
				SYSTEMs[source_system] = {
					uid: source_system,
					name: source_system
				}
			}
		}
	} else {
		console.log(response);
		report_error("Bad Data in " + cur_sheet + " range");
		return;
	}

	sheetListIdx = 1;  //0 = INT
	range = googleAPIResult[sheetListIdx + numPre]; //1 = INT
	cur_sheet_metrics = sheetMetrics[sheetList[sheetListIdx]];
	if (range.values.length > 0) {
		for (var i = 0; i < range.values.length; i++) {
			var row = range.values[i];
			var target_system = row[cur_sheet_metrics.target_sys_col];
			ic_soa_data_buildtaglist_tag(row[cur_sheet_metrics.tagscol],TAGs);
			INTkeys.push(row[cur_sheet_metrics.uidcol]);
			INTs[row[cur_sheet_metrics.uidcol]] = {
				source_sheet: sheetList[sheetListIdx],
				uid: row[cur_sheet_metrics.uidcol],
				name: row[cur_sheet_metrics.namecol],
				status: row[cur_sheet_metrics.listcol],
				tags: row[cur_sheet_metrics.tagscol],
				sheet_row: (i+cur_sheet_metrics.toprow),
				order: row[cur_sheet_metrics.indexcol],
				target_system: target_system,
				source_edf: row[cur_sheet_metrics.source_edf_col],
				inbound_operation_text: row[cur_sheet_metrics.inbound_operation_text_col],
				outbound_operation_text: row[cur_sheet_metrics.outbound_operation_text_col],
			}
			if (typeof(SYSTEMs[target_system])=="undefined") {
				SYSTEMkeys.push(target_system);
				SYSTEMs[target_system] = {
					uid: target_system,
					name: target_system
				}
			}
		}
	} else {
		console.log(response);
		report_error("Bad Data in " + cur_sheet + " range");
		return;
	}

	sheetListIdx = 2;  //2 = PRES
	range = googleAPIResult[sheetListIdx + numPre]; //
	cur_sheet_metrics = sheetMetrics[sheetList[sheetListIdx]];
	if (range.values.length > 0) {
		for (var cur_range = 0; cur_range < range.values.length; cur_range++) {
			var row = range.values[cur_range];
			var provider_system = row[cur_sheet_metrics.provider_sys_col];
			ic_soa_data_buildtaglist_tag(row[cur_sheet_metrics.tagscol],TAGs);

			//Load known clients
			var known_clients = ic_soa_data_loadSYSTEMSFromCommaList(row[cur_sheet_metrics.known_client_col], SYSTEMs, SYSTEMkeys);

			PRESkeys.push(row[cur_sheet_metrics.uidcol]);
			PRESs[row[cur_sheet_metrics.uidcol]] = {
				source_sheet: sheetList[sheetListIdx],
				uid: row[cur_sheet_metrics.uidcol],
				name: row[cur_sheet_metrics.namecol],
				status: row[cur_sheet_metrics.listcol],
				tags: row[cur_sheet_metrics.tagscol],
				sheet_row: (cur_range+cur_sheet_metrics.toprow),
				order: row[cur_sheet_metrics.indexcol],
				provider_system: provider_system,
				rawname: row[cur_sheet_metrics.rawnamecol],
				known_clients: known_clients,
			}
			if (typeof(SYSTEMs[provider_system])=="undefined") {
				SYSTEMkeys.push(provider_system);
				SYSTEMs[provider_system] = {
					uid: provider_system,
					name: provider_system
				}
			}
		}
	} else {
		console.log(response);
		report_error("Bad Data in " + cur_sheet + " range");
		return;
	}

	sheetListIdx = 3;  //3 = POINT
	range = googleAPIResult[sheetListIdx + numPre]; //
	cur_sheet_metrics = sheetMetrics[sheetList[sheetListIdx]];
	if (range.values.length > 0) {
		for (var cur_range = 0; cur_range < range.values.length; cur_range++) {
			var row = range.values[cur_range];

			var provider_syss = ic_soa_data_loadSYSTEMSFromCommaList(row[cur_sheet_metrics.provider_sys_list_col], SYSTEMs, SYSTEMkeys);
			var client_syss = ic_soa_data_loadSYSTEMSFromCommaList(row[cur_sheet_metrics.client_list_col], SYSTEMs, SYSTEMkeys);
			ic_soa_data_buildtaglist_tag(row[cur_sheet_metrics.tagscol],TAGs);

			POINTkeys.push(row[cur_sheet_metrics.uidcol]);
			POINTs[row[cur_sheet_metrics.uidcol]] = {
				source_sheet: sheetList[sheetListIdx],
				uid: row[cur_sheet_metrics.uidcol],
				name: row[cur_sheet_metrics.namecol],
				status: row[cur_sheet_metrics.listcol],
				tags: row[cur_sheet_metrics.tagscol],
				sheet_row: (cur_range+cur_sheet_metrics.toprow),
				order: row[cur_sheet_metrics.indexcol],
				provider_systems: provider_syss,
				rawname: row[cur_sheet_metrics.rawnamecol],
				client_systems: client_syss,
			}
		}
	} else {
		console.log(response);
		report_error("Bad Data in " + cur_sheet + " range");
		return;
	}
	
	sheetListIdx = 4;  //4 = RESOURCELANES
	range = googleAPIResult[sheetListIdx + numPre]; //
	cur_sheet_metrics = sheetMetrics[sheetList[sheetListIdx]];
	if (range.values.length > 0) {
		for (var cur_range = 0; cur_range < range.values.length; cur_range++) {
			var row = range.values[cur_range];

			RESOURCELANESkeys.push(row[cur_sheet_metrics.uidcol]);
			RESOURCELANESs[row[cur_sheet_metrics.uidcol]] = {
				source_sheet: sheetList[sheetListIdx],
				sheet_row: (cur_range+cur_sheet_metrics.toprow),
				uid: row[cur_sheet_metrics.uidcol],
				rate: parseInt(row[cur_sheet_metrics.ratecol]),
				autoassign: ic_soa_data_parseYN(row[cur_sheet_metrics.autoassigncol],true),
				order: parseInt(row[cur_sheet_metrics.ordercol]),
			}
		}
	} else {
		console.log(response);
		report_error("Bad Data in " + cur_sheet + " range");
		return;
	}	
	
	sheetListIdx = 5;  //5 = RESOURCEALLOCATION
	range = googleAPIResult[sheetListIdx + numPre]; //
	cur_sheet_metrics = sheetMetrics[sheetList[sheetListIdx]];
	if (typeof(range.values)!="undefined") {
		if (range.values.length > 0) {
			for (var cur_range = 0; cur_range < range.values.length; cur_range++) {
				var row = range.values[cur_range];

				ic_soa_data_buildtaglist_tag(row[cur_sheet_metrics.tagscol],TAGs);				

				RESOURCEALLOCATIONkeys.push(row[cur_sheet_metrics.uidcol]);
				RESOURCEALLOCATIONs[row[cur_sheet_metrics.uidcol]] = {
					source_sheet: sheetList[sheetListIdx],
					sheet_row: (cur_range+cur_sheet_metrics.toprow),
					uid: row[cur_sheet_metrics.uidcol],
					itemuid: ic_soa_data_parseStringOrUndef(row[cur_sheet_metrics.itemuidcol]),
					text: row[cur_sheet_metrics.textcol],
					resourcelaneassignment: row[cur_sheet_metrics.resourcelaneassignmentcol],
					assignmentrate: ic_soa_data_parseFloatNaNZero(row[cur_sheet_metrics.assignmentratecol]),
					originaldays: parseInt(row[cur_sheet_metrics.originaldayscol]),
					remainingdays: ic_soa_data_parseFloatNaNZero(row[cur_sheet_metrics.remainingdayscol]),
					lastupdate: row[cur_sheet_metrics.lastupdatecol],
					status: row[cur_sheet_metrics.statuscol],
					binpackpriority: parseInt(row[cur_sheet_metrics.binpackprioritycol]),
					tags: row[cur_sheet_metrics.tagscol],
					datecreate: row[cur_sheet_metrics.datecreatecol],
					description: row[cur_sheet_metrics.descriptioncol],
				}
				RESOURCEALLOCATIONs[row[cur_sheet_metrics.uidcol]].getCombinedTagList = getResourseAllocationObjectCombinedTagListFN(RESOURCEALLOCATIONs[row[cur_sheet_metrics.uidcol]]);
			}
		} else {
			console.log(response);
			report_error("Bad Data in " + cur_sheet + " range");
			return;
		}	
	}

	SYSTEMkeys = SYSTEMkeys.sort();
	EDFkeys = EDFkeys.sort(function (ak,bk) {
		if (EDFs[ak].name==EDFs[bk].name) return 0;
		if (EDFs[ak].name<EDFs[bk].name) return -1;
		return 1;
	});
	INTkeys = INTkeys.sort(function (ak,bk) {
		if (INTs[ak].name==INTs[bk].name) return 0;
		if (INTs[ak].name<INTs[bk].name) return -1;
		return 1;
	});
	PRESkeys = PRESkeys.sort(function (ak,bk) {
		if (PRESs[ak].name==PRESs[bk].name) return 0;
		if (PRESs[ak].name<PRESs[bk].name) return -1;
		return 1;
	});
	POINTkeys = POINTkeys.sort(function (ak,bk) {
		if (POINTs[ak].name==POINTs[bk].name) return 0;
		if (POINTs[ak].name<POINTs[bk].name) return -1;
		return 1;
	});
	RESOURCELANESkeys = RESOURCELANESkeys.sort(function (ak,bk) {
		if (RESOURCELANESs[ak].order==RESOURCELANESs[bk].order) return 0;
		if (RESOURCELANESs[ak].order<RESOURCELANESs[bk].order) return -1;
		return 1;
	});
	
	return {
		EDFkeys: EDFkeys,
		EDFs: EDFs,
		INTkeys: INTkeys,
		INTs: INTs,
		SYSTEMkeys: SYSTEMkeys,
		SYSTEMs: SYSTEMs,
		PRESkeys: PRESkeys,
		PRESs: PRESs,
		POINTkeys: POINTkeys,
		POINTs: POINTs,
		TAGs: TAGs,
		RESOURCELANESkeys: RESOURCELANESkeys,
		RESOURCELANESs: RESOURCELANESs,
		RESOURCEALLOCATIONkeys: RESOURCEALLOCATIONkeys,
		RESOURCEALLOCATIONs: RESOURCEALLOCATIONs,
	};
};

//Given the name of an edf return it's object from dataobjects
function ic_soa_data_getEDFFromName(edfName, dataObjects) {
	for (var cur_do = 0; cur_do < dataObjects.EDFkeys.length; cur_do++) {
		if (dataObjects.EDFs[dataObjects.EDFkeys[cur_do]].name==edfName) return dataObjects.EDFs[dataObjects.EDFkeys[cur_do]];
	}
	//console.log("Failed to find edf named " + edfName);
	return undefined;
};

//Given the name of an int return it's object from dataobjects
function ic_soa_data_getINTFromName(intName, dataObjects) {
	for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
		if (dataObjects.INTs[dataObjects.INTkeys[cur_do]].name==intName) return dataObjects.INTs[dataObjects.INTkeys[cur_do]];
	}
	//console.log("Failed to find int named " + intName);
	return undefined;
};

//Given the name of a system return it's object from dataobjects
function ic_soa_data_getSystemFromName(systemName, dataObjects) {
	for (var cur_do = 0; cur_do < dataObjects.SYSTEMkeys.length; cur_do++) {
		if (dataObjects.SYSTEMs[dataObjects.SYSTEMkeys[cur_do]].name==systemName) return dataObjects.SYSTEMs[dataObjects.SYSTEMkeys[cur_do]];
	}
	//console.log("Failed to find edf named " + edfName);
	return undefined;
};

function ic_soa_data_getComponentFromUID(uid) {
	if (typeof(dataObjects.EDFs[uid])!="undefined") return dataObjects.EDFs[uid];
	if (typeof(dataObjects.INTs[uid])!="undefined") return dataObjects.INTs[uid];
	if (typeof(dataObjects.POINTs[uid])!="undefined") return dataObjects.POINTs[uid];
	if (typeof(dataObjects.PRESs[uid])!="undefined") return dataObjects.PRESs[uid];
	
	return undefined;
};

//Parse a value as a number but if it is undefined or NaN then return 0
function ic_soa_data_parseIntNaNZero(inp) {
	if (typeof(inp)=="undefined") return 0;
	var out = parseInt(inp);
	if (isNaN(out)) return 0;	
	return out;
};

//Parse a value as a number but if it is undefined or NaN then return 0
function ic_soa_data_parseFloatNaNZero(inp) {
	if (typeof(inp)=="undefined") return 0;
	var out = parseFloat(inp);
	if (isNaN(out)) return 0;	
	return out;
};

//Parse a value as true or false from Y or N (Case insensitive first char only checked)
function ic_soa_data_parseYN(inp,def) {
	var t = inp.substr(0,1).toUpperCase();
	if (t=="Y") return true;
	if (t=="N") return false;
	return def;
};

//Parse string but if it is empty use undefined
function ic_soa_data_parseStringOrUndef(inp) {
	if (typeof(inp)=="undefined") return undefined;
	if (inp=="") return undefined;
	return inp;
};
