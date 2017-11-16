"use strict";	

var component_viewer_res_project = {
	tableCols: 7,
	surpressed_tags: ['NEW'],
};


function component_viewer_res_project_getHtml() {
	var ret = "";
	ret += "<h1>Project Estimates</h1>";
	ret += "<p>List of all the active (non-zero remaining days) estimates. Estimates are grouped by TAG (project). The following tags are suppressed: ";
	for (var x in component_viewer_res_project.surpressed_tags) {
		if (x>1) ret+= ", ";
		ret += component_viewer_res_project.surpressed_tags[x];
	};
	ret += "</p>"
	
	if (!component_viewer_res_process_ScheduleProcessDone()) component_viewer_res_process_ScheduleResourses();
	ret += component_viewer_res_getFailedToScheduleHTML();
	
	
	
	//Generate the list for NO tag
	ret += component_viewer_res_project_tableRowsForTAG("",component_viewer_res_project_resAllocHasNoTag);
	
	//Go thorugh tags and generate ths list for items with that tag
	for (var tag in dataObjects.TAGs) {
		var inc = true;
		for (var x in component_viewer_res_project.surpressed_tags) {
			if 	(component_viewer_res_project.surpressed_tags[x]==tag) inc = false;
		}
		if (inc) {
			ret += component_viewer_res_project_tableRowsForTAG(tag,component_viewer_res_project_resAllocHasTag);
		};
	}
	
	return ret;
};

//Called after the HTML has been put in the Dom
function component_viewer_res_project_postHtmlInDom() {
	rjmlib_ui_table_make_tables_sortable("table[id='component_viewer_res_project_main']");
};

function component_viewer_res_project_getTableStart(tblid) {
	if (typeof(tblid) == "undefined") tblid = "component_viewer_res_project_main";
	var ret = "";
	ret += "<table id=\"" + tblid + "\">";
	ret += "<tr><th>Text</th><th>Type</th><th>Resource</th><th>Start Day</th><th>Rate</th><th>Remaining Days</th><th>End Day</th>";
	ret += "<th>Status</th>";
	ret += "<th>Description</th>";
	ret += "<th>Tags ";
	ret += " <a href=\"#component_viewer_res_project_sel\">Select for Copy</a>";
	ret += "</th>";
	ret += "</tr>";
	return ret;
}
function component_viewer_res_project_getTableEnd() {
	var ret = "";
	ret += "</table>";
	return ret;
}

function component_viewer_res_project_remove_supressed_tags(taglisobj_arr) {
	var ret = [];
	for (var x in taglisobj_arr) {
		var required = true;
		for (var cur_st in component_viewer_res_project.surpressed_tags) {
			if (component_viewer_res_project.surpressed_tags[cur_st]==taglisobj_arr[x].value) required = false;
		};
		if (required) {
			ret.push(taglisobj_arr[x]);
		};
	};
	return ret;
};

function component_viewer_res_project_resAllocHasNoTag(taglisobj_arr,tag) {
	return (taglisobj_arr.length==0);
};
function component_viewer_res_project_resAllocHasTag(taglisobj_arr,tag) {
	for (var x in taglisobj_arr) {
		if (taglisobj_arr[x].value==tag) return true;
	};
	return false;
}

//decision function is the function used to decide if a component should be in this list
function component_viewer_res_project_tableRowsForTAG(tag, decision_function) {
	var title = tag;
	if (title=="") title = "No Tags";
	var ret = "";
	
	var first_row = true;
	
	//Loop through every resourse LANE
	for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
		var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
		//console.log(res_lane_obj);
		var lane_obj = component_viewer_res_process_get_scheduled_lane(res_lane_obj.uid);
		//console.log(lane_obj);
	
		//Loop through every resourse Allocation in this lane
		for (var cur_task in lane_obj.allocated_resourses) {
			var task_obj = lane_obj.allocated_resourses[cur_task];
			var component_obj = ic_soa_data_getComponentFromUID(task_obj.res_alloc_obj.itemuid);
			var combined_tag_list = component_viewer_res_project_remove_supressed_tags(component_viewer_res_data_getcombinedtagList(task_obj.res_alloc_obj));
			
			if (decision_function(combined_tag_list,tag)) {
				if (first_row) {
					//Make sure title is only shown where there is at least one item
					first_row = false;
					ret += "<h2>" + title + "</h2>";
					ret += component_viewer_res_project_getTableStart();
				};

				//console.log("X");
				//console.log(task_obj);
				//console.log(task_obj.res_alloc_obj.source_sheet);
				//console.log(combined_tag_list);
				
				ret += "<tr class=\"" + component_viewer_res_data_getresourseallocobjCSSTag(task_obj.res_alloc_obj) + "\">";
				ret += "<td>" + task_obj.res_alloc_obj.text + "</td>";
				ret += "<td>" + component_viewer_res_data_getresourseallocobjUserType(task_obj.res_alloc_obj) + "</td>";
				ret += "<td>" + res_lane_obj.uid + "</td>";
				ret += "<td>" + task_obj.start_day + "</td>";
				ret += "<td>" + task_obj.rate + "%</td>";
				//ret += "<td>" + task_obj.duration + "</td>";
				ret += "<td>" + task_obj.res_alloc_obj.remainingdays + "</td>";
				ret += "<td>" + task_obj.end_day + "</td>";
				ret += "<td>" + task_obj.res_alloc_obj.status + "</td>";
				ret += "<td>" + rjmlib_blankStringInsteadOfUndefined(task_obj.res_alloc_obj.description) + "</td>";
				ret += "<td>" + component_viewer_res_data_getcombinedtagString(task_obj.res_alloc_obj);
				if (combined_tag_list.length>1) ret += " WARNING MUTIPLE REPORT!!";
				ret +=	"</td>";
				
				ret += "</tr>";
			};
		};
	};
	if (first_row==false) {
		ret += component_viewer_res_project_getTableEnd();
	};

	return ret;
};

function component_viewer_res_project_INIT() {
		$(document).off('click.component_viewer_res_project').on('click.component_viewer_res_project', "a[href$='#component_viewer_res_project_sel']", function (event) {
		rjmlib_ui_table_selectTableForCopy($(this).closest("table"));
		event.preventDefault();
	});
};


