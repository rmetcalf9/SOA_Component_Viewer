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
	if (component_object.status=="In UAT") return false;
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
function component_viewer_res_data_notify_component_state_change(component_uid) {
	//console.log("Change of state for " + component_uid);
	var comp = ic_soa_data_getComponentFromUID(component_uid);
	var missing_estimate = false;
	if (component_viewer_res_data_componentRequiresEstimate(comp)) {
		if (typeof(component_viewer_res_data_get_active_estimate_for_component(component_uid))=="undefined") {
			missing_estimate = true;
		}
	};
	
	//If we do not need to change the missing estimate list return
	if (missing_estimate==component_viewer_res_data_notify_component_has_entry_in_missing_estimate_list(component_uid)) return;
	
	if (missing_estimate) {
		//console.log("Adding " + component_uid + " to estimate missing list");
		component_viewer_res_data_glob.componentsMissingEstimate.push(component_uid);		
	} else {
		//console.log("Remove entry from missing elements list");
		component_viewer_res_data_ensure_component_not_in_missing_estimate_list(component_uid);
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

function component_viewer_res_data_save_resourse_allocation_into_batch(resourseAllocaiton_uid, creating) {
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
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.assignmentratecol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[rec.assignmentrate / 100]
		],
	});	
	var tmp = rec.resourcelaneassignment;
	if (typeof(tmp)=="undefined") tmp = "";
	if (tmp==null) tmp = "";
	board_append_saveBatch({
		"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.resourcelaneassignmentcol) + rec.sheet_row,
		"majorDimension": "ROWS",
		"values": [
			[tmp]
		],
	});	
	if (typeof(creating)!="undefined") {
		if (creating==true) {
			board_append_saveBatch({
				"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.datecreatecol) + rec.sheet_row,
				"majorDimension": "ROWS",
				"values": [
					[rec.datecreate]
				],
			});	
		};
	};
};

//Create an unlinked estimate without a compnent
function component_viewer_res_data_create_unlinked_estimate(edited_value_obj) {
	component_viewer_res_data_create_estimate_INTERNAL(
		edited_value_obj, 
		"", //No component
		edited_value_obj.remain //Origional days same as remain
	);
}
	
function component_viewer_res_data_create_estimate_INTERNAL(edited_value_obj, component_uid, origional_days) {
	if (typeof(component_viewer_res_data_glob.next_avail)=="undefined") {
		component_viewer_res_data_calc_next_avail();
	};
	var new_row_uid = rjmlib_createGuid();

	var d = new Date();	
	dataObjects.RESOURCEALLOCATIONkeys.push(new_row_uid);
	dataObjects.RESOURCEALLOCATIONs[new_row_uid] = {
		source_sheet: "RESOURCEALLOCATION",
		sheet_row: (component_viewer_res_data_glob.next_avail.next_row),
		uid: new_row_uid,
		itemuid: component_uid,
		text: edited_value_obj.text,
		resourcelaneassignment: edited_value_obj.lane,
		assignmentrate: edited_value_obj.rate,
		originaldays: origional_days,
		remainingdays: edited_value_obj.remain,
		lastupdate: d.toString(),
		status: "Allocated",
		binpackpriority: edited_value_obj.binpack,
		tags: undefined,
		datecreate: d.toString(),
	}
	
	//Write data to spreadsheet
	board_prepare_saveBatch();
	component_viewer_res_data_save_resourse_allocation_into_batch(new_row_uid, true);
	board_execute_saveBatch(spreadsheetId);
	component_viewer_res_data_glob.next_avail.next_row = component_viewer_res_data_glob.next_avail.next_row + 1;	
	
};

//Create an estimate for an unestimated component
function component_viewer_res_data_create_estimate(component_uid, edited_value_obj) {
	component_viewer_res_data_create_estimate_INTERNAL(
		edited_value_obj, 
		component_uid, //No component
		edited_value_obj.remain //Origional days same as remain
	);

	//REMOVE FROM estimate missing list
	component_viewer_res_data_ensure_component_not_in_missing_estimate_list(component_uid);
	
	//Refresh Number in menu
	component_viewer_res_updateMenuText();
	
};

//Edit estimate
// if change_comp_status is not undefined then also alter the component status
function component_viewer_res_data_edit_estimate(estimate_uid, edited_value_obj, change_comp_status) {
	var resAlloc_obj = dataObjects.RESOURCEALLOCATIONs[estimate_uid];
	if (typeof(resAlloc_obj)=="undefined") {
		console.log("ERROR couldn't save bad uid");
		return;
	};
	
	resAlloc_obj.text = edited_value_obj.text;
	resAlloc_obj.resourcelaneassignment = edited_value_obj.lane;
	resAlloc_obj.assignmentrate = edited_value_obj.rate;
	resAlloc_obj.remainingdays = edited_value_obj.remain;
	resAlloc_obj.binpackpriority = edited_value_obj.binpack;
	var d = new Date();	
	resAlloc_obj.lastupdate = d.toString();
	
	if (resAlloc_obj.remainingdays==0) {
		resAlloc_obj.status = "Completed";
	};
	
	//Write data to spreadsheet
	board_prepare_saveBatch();
	component_viewer_res_data_save_resourse_allocation_into_batch(estimate_uid);
	if (typeof(change_comp_status)!="undefined") {
		
		var component_obj = ic_soa_data_getComponentFromUID(resAlloc_obj.itemuid);
		if (typeof(component_obj)=="undefined") {
			console.log("ERROR got undefined for component " + resAlloc_obj.itemuid + " not saving component status (Other changes saved)");
		} else {
			var sheet_data_item = sheet_data[component_obj.source_sheet];
			if (typeof(sheet_data_item)=="undefined") {
				console.log("ERROR got undefined for source sheet " + component_obj.source_sheet + " not saving component status (Other changes saved)");
			} else {
				//console.log("change component status of " + resAlloc_obj.itemuid + " to " + change_comp_status.new_status);
				
				component_obj.status = change_comp_status.new_status;
				//Calling function from component_viewer_kanban.js
				saveObj(sheet_data_item,component_obj.sheet_row,component_obj)
			};
		};
		
		
	};
	board_execute_saveBatch(spreadsheetId);

	if (typeof(resAlloc_obj.itemuid)!="undefined") {
		//Check if this needs to be added to estimate missing list
		component_viewer_res_data_notify_component_state_change(resAlloc_obj.itemuid);
		//Refresh Number in menu
		component_viewer_res_updateMenuText();
	};

}




//**Functions below deal with scheduled data

//Returns the highest lane end day
// passed the scheduled lane object
function component_viewer_res_data_sch_getHighestLaneEndDay(lane_obj) {
	var max_end = 0;
	for (var alloc_res in lane_obj.allocated_resourses) {
		if (lane_obj.allocated_resourses[alloc_res].end_day>max_end) max_end=lane_obj.allocated_resourses[alloc_res].end_day;
	};
	return max_end;
};

function component_viewer_res_data_getcombinedtagList(res_alloc_obj) {
	var res = [];
	
	//Step 1 push all EDF/Int/etc tags
	var component_obj = ic_soa_data_getComponentFromUID(res_alloc_obj.itemuid);
	
	if (typeof(component_obj)!="undefined") {
		var arr = [];
		ic_soa_data_buildtaglist_tag(component_obj.tags, arr)
		for (var x in arr) {
			res.push({
				orig: "obj",
				value: arr[x]
			});
		};
	};
	
	//Step 2 push all local tags
	var arr = [];
	ic_soa_data_buildtaglist_tag(res_alloc_obj.tags, arr)
	for (var x in arr) {
		res.push({
			orig: "res",
			value: arr[x]
		});
	};
	
	return res;
};

function component_viewer_res_data_getcombinedtagString(res_alloc_obj) {
	var res = "";
	var arr = component_viewer_res_data_getcombinedtagList(res_alloc_obj);
	if (typeof(arr)=="undefined") return "";
	if (arr.length==0) return "";
	for (var x in arr) {
		if (x>0) res += ", ";
		if (arr[x].orig=="res") {
			res += "*";
		};
		res += arr[x].value;
	};
	return res;
};
