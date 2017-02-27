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

function component_viewer_res_data_computeRequiredEstimates() {
	component_viewer_res_data_glob.componentsMissingEstimate = [];
	
	//EDFs
	for (var cur_do = 0; cur_do < dataObjects.EDFkeys.length; cur_do++) {
		if (component_viewer_res_data_componentRequiresEstimate(dataObjects.EDFs[dataObjects.EDFkeys[cur_do]])) {
			if (typeof(component_viewer_res_data_getResoueseEstimate(dataObjects.EDFkeys[cur_do]))=="undefined") {
				component_viewer_res_data_glob.componentsMissingEstimate.push(dataObjects.EDFkeys[cur_do]);
			}
		};
	}
	
	//INTs
	for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
		if (component_viewer_res_data_componentRequiresEstimate(dataObjects.INTs[dataObjects.INTkeys[cur_do]])) {
			if (typeof(component_viewer_res_data_getResoueseEstimate(dataObjects.INTkeys[cur_do]))=="undefined") {
				component_viewer_res_data_glob.componentsMissingEstimate.push(dataObjects.INTkeys[cur_do]);
			}
		};
	}
	
	//PRESs
	for (var cur_do = 0; cur_do < dataObjects.PRESkeys.length; cur_do++) {
		if (component_viewer_res_data_componentRequiresEstimate(dataObjects.PRESs[dataObjects.PRESkeys[cur_do]])) {
			if (typeof(component_viewer_res_data_getResoueseEstimate(dataObjects.PRESkeys[cur_do]))=="undefined") {
				component_viewer_res_data_glob.componentsMissingEstimate.push(dataObjects.PRESkeys[cur_do]);
			}
		};
	}
	
	//POINTs
	for (var cur_do = 0; cur_do < dataObjects.POINTkeys.length; cur_do++) {
		if (component_viewer_res_data_componentRequiresEstimate(dataObjects.POINTs[dataObjects.POINTkeys[cur_do]])) {
			if (typeof(component_viewer_res_data_getResoueseEstimate(dataObjects.POINTkeys[cur_do]))=="undefined") {
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
		component_viewer_res_data_glob.componentsMissingEstimate = jQuery.grep(component_viewer_res_data_glob.componentsMissingEstimate, function(value) {
			return value != uid;
		});
	};
	
};
