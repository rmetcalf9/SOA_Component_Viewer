"use strict";	

var component_viewer_res_data_glob = {};

//Component Viewer Resourses data manipulation code
//All API's for changing result type data

//passed the results of ic_soa_data_getComponentFromUID(uid)
function component_viewer_res_data_componentRequiresEstimate(component_object) {
	//Given the UID of a component determine if it requires an estimate
	if (typeof(component_object)=="undefined") {
		console.log("Warning - passing undefined object to component_viewer_res_data_componentRequiresEstimate");
		return false;
	};
	if (typeof(component_object.status)=="undefined") {
		console.log("Warning - passing object with no status to component_viewer_res_data_componentRequiresEstimate");
		return false;
	};
	if (component_object.status=="In Support") return false;
	if (component_object.status=="Abandoned") return false;
	return true;
};

//From ResourceAllocation UID
function component_viewer_res_data_getResoueseEstimate(uid) {
	return dataObjects.RESOURCEALLOCATIONs[uid];
};

//Returns an active estimate for a component if it has one
function component_viewer_res_data_get_active_estimate_for_component(component_uid) {
	for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
		var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
		if (res_alloc_obj.itemuid==component_uid) {
			if (res_alloc_obj.status!="Completed") return res_alloc_obj;
		};
	}
	return undefined;
};

//Return true if this component has an active estimate. (Ignore completed estimates)
function component_viewer_res_data_component_has_active_estimate
(component_uid) {
	return component_viewer_res_data_get_active_estimate_for_component(component_uid)!=undefined;
};

function component_viewer_res_data_computeRequiredEstimates() {
	component_viewer_res_data_glob.componentsMissingEstimate = [];
	
	//EDFs
	for (var cur_do = 0; cur_do < dataObjects.EDFkeys.length; cur_do++) {
		if (component_viewer_res_data_componentRequiresEstimate(dataObjects.EDFs[dataObjects.EDFkeys[cur_do]])) {
			if (!component_viewer_res_data_component_has_active_estimate
(dataObjects.EDFkeys[cur_do])) {
				component_viewer_res_data_glob.componentsMissingEstimate.push(dataObjects.EDFkeys[cur_do]);
			}
		};
	}
	
	//INTs
	for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
		if (component_viewer_res_data_componentRequiresEstimate(dataObjects.INTs[dataObjects.INTkeys[cur_do]])) {
			if (!component_viewer_res_data_component_has_active_estimate
(dataObjects.INTkeys[cur_do])) {
				component_viewer_res_data_glob.componentsMissingEstimate.push(dataObjects.INTkeys[cur_do]);
			}
		};
	}
	
	//PRESs
	for (var cur_do = 0; cur_do < dataObjects.PRESkeys.length; cur_do++) {
		if (component_viewer_res_data_componentRequiresEstimate(dataObjects.PRESs[dataObjects.PRESkeys[cur_do]])) {
			if (!component_viewer_res_data_component_has_active_estimate
(dataObjects.PRESkeys[cur_do])) {
				component_viewer_res_data_glob.componentsMissingEstimate.push(dataObjects.PRESkeys[cur_do]);
			}
		};
	}
	
	//POINTs
	for (var cur_do = 0; cur_do < dataObjects.POINTkeys.length; cur_do++) {
		if (component_viewer_res_data_componentRequiresEstimate(dataObjects.POINTs[dataObjects.POINTkeys[cur_do]])) {
			if (!component_viewer_res_data_component_has_active_estimate
(dataObjects.POINTkeys[cur_do])) {
				component_viewer_res_data_glob.componentsMissingEstimate.push(dataObjects.POINTkeys[cur_do]);
			}
		};
	}
	
};

//Return true if this uid is in the missing estimate list
function component_viewer_res_data_notify_component_has_entry_in_missing_estimate_list(uid) {
	for (var cur_do = 0; cur_do < component_viewer_res_data_glob.componentsMissingEstimate.length; cur_do++) {
		if (component_viewer_res_data_glob.componentsMissingEstimate[cur_do]==uid) return true;
	}
	return false;
};

//Callers must call 	component_viewer_res_updateMenuText();
// on completion
function component_viewer_res_data_notify_component_state_change(uid) {
	//console.log("Change of state for " + uid);
	var comp = ic_soa_data_getComponentFromUID(uid);
	var missing_estimate = false;
	if (component_viewer_res_data_componentRequiresEstimate(comp)) {
		if (typeof(component_viewer_res_data_getResoueseEstimate(uid))=="undefined") {
			missing_estimate = true;
		}
	};
	
	//If we do not need to change the missing estimate list return
	if (missing_estimate==component_viewer_res_data_notify_component_has_entry_in_missing_estimate_list(uid)) return;
	
	if (missing_estimate) {
		//console.log("Adding " + uid + " to estimate missing list");
		component_viewer_res_data_glob.componentsMissingEstimate.push(uid);		
	} else {
		//console.log("Remove entry from missing elements list");
		component_viewer_res_data_ensure_component_not_in_missing_estimate_list(uid);
	};
	
};

function component_viewer_res_data_ensure_component_not_in_missing_estimate_list(uid) {
	component_viewer_res_data_glob.componentsMissingEstimate = jQuery.grep(component_viewer_res_data_glob.componentsMissingEstimate, function(value) {
		return value != uid;
	});
};

//Caculate the next availiable row we should be adding data to
function component_viewer_res_data_calc_next_avail() {
	var next_row = ic_soa_data_getSheetMetrics()["RESOURCEALLOCATION"].toprow;
	for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
		var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
		if (res_alloc_obj.sheet_row >= next_row) next_row = res_alloc_obj.sheet_row+1;
	};
	component_viewer_res_data_glob.next_avail = {
		next_row: next_row
	};
	//console.log("Next row is " + next_row);
};

function component_viewer_res_data_save_resourse_allocation_into_batch(resourseAllocaiton_uid) {
	var rec = dataObjects.RESOURCEALLOCATIONs[resourseAllocaiton_uid]
	var sheet_data_item = ic_soa_data_getSheetMetrics()["RESOURCEALLOCATION"]
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.uidcol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.uid]
		],
	});
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.itemuidcol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.itemuid]
		],
	});
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.textcol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.text]
		],
	});
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.originaldayscol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.originaldays]
		],
	});
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.remainingdayscol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.remainingdays]
		],
	});
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.lastupdatecol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.lastupdate]
		],
	});
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.statuscol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.status]
		],
	});	
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.binpackprioritycol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.binpackpriority]
		],
	});	
};

//Create an estimate for an unestimated component
function component_viewer_res_data_create_estimate(component_uid, work_text, days) {
	if (typeof(component_viewer_res_data_glob.next_avail)=="undefined") {
		component_viewer_res_data_calc_next_avail();
	};
	
	var new_row_uid = rjmlib_createGuid();
	/*
	console.log("Add row to spreadsheet for:");
	console.log("  uid=:" + new_row_uid);
	console.log(" Cuid=:" + component_uid);
	console.log("  txt=:" + work_text);
	console.log(" days=:" + days);
	console.log("  row=:" + component_viewer_res_data_glob.next_avail.next_row);
	*/
	
	//Push to new row in internal data structure
	var d = new Date();	
	dataObjects.RESOURCEALLOCATIONkeys.push(new_row_uid);
	dataObjects.RESOURCEALLOCATIONs[new_row_uid] = {
		source_sheet: "RESOURCEALLOCATION",
		sheet_row: (component_viewer_res_data_glob.next_avail.next_row),
		uid: new_row_uid,
		itemuid: component_uid,
		text: work_text,
		resourcelaneassignment: "",
		assignmentrate: "",
		originaldays: days,
		remainingdays: days,
		lastupdate: d.toString(),
		status: "Allocated",
		binpackpriority: undefined,
		tags: undefined,
	}
	
	//Write data to spreadsheet
	board_prepare_saveBatch();
	component_viewer_res_data_save_resourse_allocation_into_batch(new_row_uid);
	board_execute_saveBatch(spreadsheetId);
	component_viewer_res_data_glob.next_avail.next_row = component_viewer_res_data_glob.next_avail.next_row + 1;

	//REMOVE FROM estimate missing list
	component_viewer_res_data_ensure_component_not_in_missing_estimate_list(component_uid);
	
	//Refresh Number in menu
	component_viewer_res_updateMenuText();
	
};