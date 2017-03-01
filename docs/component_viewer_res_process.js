"use strict";	

//Code and dataobjects for the resourse allocation process


function component_viewer_res_process_ScheduleResourses() {

	//console.log("TODO Sort resourse allocaitons by priority asc");
	dataObjects.RESOURCEALLOCATIONkeys = dataObjects.RESOURCEALLOCATIONkeys.sort(function (ak,bk) {
		if (dataObjects.RESOURCEALLOCATIONs[ak].binpackpriority==dataObjects.RESOURCEALLOCATIONs[bk].binpackpriority) return 0;
		if (dataObjects.RESOURCEALLOCATIONs[ak].binpackpriority<dataObjects.RESOURCEALLOCATIONs[bk].binpackpriority) return -1;
		return 1;
	});
	for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
		var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
		console.log(res_alloc_obj.text + " " + res_alloc_obj.binpackpriority);
	};
	
	//console.log("If sort order results in changes write new order to googlesheet");
	//This step will fill any any items with missing orders and spread out where mutiple items have same order
	board_prepare_saveBatch();
	var cur_rec = 0;
	var num_changed = 0;
	for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
		cur_rec += 10;
		var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
		if (res_alloc_obj.binpackpriority != cur_rec) {
			res_alloc_obj.binpackpriority = cur_rec;
			component_viewer_res_data_save_resourse_allocation_into_batch(res_alloc_obj.uid)
			num_changed ++;
		};
	}
	if (num_changed>0) {
		board_execute_saveBatch(spreadsheetId);
	};

	console.log("TODO Clear all current scheduled allocaitons");

	console.log("TODO Go throuhg ResoueseAllocaitons in order and schedule each one");
	
	
};

