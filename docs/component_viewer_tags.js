"use strict";	


function component_viewer_tags_getUnestimatedHtml(tagobj) {
	var ret = ""
	ret += "<h2>Unestimated work</h2>";
	ret += "<table id=\"component_viewer_res_unestimated_main\">";
	ret += "<tr><th>Source Sheet Name</th><th>Component Name</th><th>Status</th><th>Tags</th>";
	if (accessLevel=="READWRITE") {
		component_viewer_res_unestimated.tableCols = component_viewer_res_unestimated.tableCols + 1;
		ret += "<th>Action</th>";
	};
	ret += "</tr>";
	tagobj.getUnestimatedObjects().map(function (component_obj) {
		ret += "<tr class=\"" + ic_soa_data_getSheetMetrics()[component_obj.source_sheet].css_tag + "\" data-uid=\"" + component_obj.uid + "\">";
		
		ret += "<td>" + ic_soa_data_getSheetMetrics()[component_obj.source_sheet].sheet_name + "</td>";
		ret += "<td>" + component_obj.name + "</td>";
		ret += "<td>" + component_obj.status + "</td>";
		ret += "<td>" + component_obj.tags + "</td>";
		if (accessLevel=="READWRITE") {
			ret += "<td>";
			ret += "<a href=\"#component_viewer_res_unestimated_click_table_row\">Add Estimate</a>";
			ret += "</td>";
		};
		
		ret += "</tr>";
	});
	ret += "</table>";

	return ret;
}
function component_viewer_tags_getResourseAllocationHtml(tagobj) {
	var ret = "";
	ret += "<h2>Resourse Allocations</h2>";
	ret += component_viewer_res_project_getTableStart();
	tagobj.getTasks().map(function (task_obj) {
		ret += "<tr class=\"" + component_viewer_res_data_getresourseallocobjCSSTag(task_obj.res_alloc_obj) + "\">";
		ret += "<td>" + task_obj.res_alloc_obj.text + "</td>";
		ret += "<td>" + component_viewer_res_data_getresourseallocobjUserType(task_obj.res_alloc_obj) + "</td>";
		ret += "<td>" + task_obj.resourseLane.uid + "</td>";
		ret += "<td>" + task_obj.start_day + "</td>";
		ret += "<td>" + task_obj.rate + "%</td>";
		//ret += "<td>" + task_obj.duration + "</td>";
		ret += "<td>" + task_obj.res_alloc_obj.remainingdays + "</td>";
		ret += "<td>" + task_obj.end_day + "</td>";
		ret += "<td>" + task_obj.res_alloc_obj.status + "</td>";
		ret += "<td>" + rjmlib_blankStringInsteadOfUndefined(task_obj.res_alloc_obj.description) + "</td>";
		ret += "<td>" + component_viewer_res_data_getcombinedtagString(task_obj.res_alloc_obj);
		ret +=	"</td>";
		
		ret += "</tr>";
	})
	ret += component_viewer_res_project_getTableEnd();
	return ret;
}

function component_viewer_tags_getHtml(tagobj) {
	
	var ret = ""
	
	ret += "<h1>Information for " + tagobj.name + "</h1>";
	ret += "<table>";
	ret += "<tr><td valign=\"top\">";
	ret += component_viewer_tags_getUnestimatedHtml(tagobj);
	ret += "</td><td valign=\"top\">";
	ret += component_viewer_tags_getResourseAllocationHtml(tagobj);
	ret += "</td></tr>";
	ret += "</table>";
	ret += "TODO";

	console.log(tagobj);

	return globalFunctions.GetPageContentWithMenu(ret);
};


function component_viewer_tags_INIT() {
	//TODO
};

function component_viewer_tags_display(tagname) {
	if (!component_viewer_res_process_ScheduleProcessDone()) component_viewer_res_process_ScheduleResourses();
	var tagobj = ic_soa_data_tags_getObject(tagname, dataObjects);
	$("#MAIN").html(component_viewer_tags_getHtml(tagobj));
	$("#MAIN").css("display","inline");
};

