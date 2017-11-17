"use strict";

// This file is for the code data object

function ic_soa_data_tags_getUnestimatedCompObjsForTagFN(tagobj) {
	return function () {
		return component_viewer_res_data_glob.componentsMissingEstimate.map(function (compID) {
			return ic_soa_data_getComponentFromUID(compID);
		}).filter(function (compObj) {
			return ic_soa_data_istaginlist(tagobj.name,compObj.tags)
		});
	}
}
function ic_soa_data_tags_getTasksForTagFN(tagobj) {
	return function () {
		var taskArr = [];
		for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
			var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
			var lane_obj = component_viewer_res_process_get_scheduled_lane(res_lane_obj.uid);
		
			//Loop through every resourse Allocation in this lane
			for (var cur_task in lane_obj.allocated_resourses) {
				var task_obj = lane_obj.allocated_resourses[cur_task];
				task_obj.resourseLane = res_lane_obj;
				taskArr.push(task_obj);
			}
		}
		return taskArr.filter(function (taskObj) {
			return taskObj.res_alloc_obj.getCombinedTagList().map(function (tagListItem) {
				return tagListItem.value;
			}).includes(tagobj.name);
		});
	}
}

function ic_soa_data_tags_getResourseAllocationsFN(tagobj) {
	return function () {
		return dataObjects.RESOURCEALLOCATIONkeys.map(function (rakey) {
			return dataObjects.RESOURCEALLOCATIONs[rakey]
		}).filter(function (res_alloc_obj) {
			return res_alloc_obj.getCombinedTagList().map(function (tagListItem) {
				return tagListItem.value;
			}).includes(tagobj.name);
		});
	}
}

// Create the object
function ic_soa_data_tags_getObject(name, dataObjects) {
	for (var property in dataObjects.TAGs) {
		if (dataObjects.TAGs.hasOwnProperty(property)) {
			if (name == property) {
				var ret = {
					name: property
				};
				ret.getUnestimatedObjects = ic_soa_data_tags_getUnestimatedCompObjsForTagFN(ret);
				ret.getTasks = ic_soa_data_tags_getTasksForTagFN(ret);
				ret.getResourseAllocations = ic_soa_data_tags_getResourseAllocationsFN(ret);
				return ret;
			}
		}
	}
	return undefined;
}

