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
			ret += "<a href=\"#component_viewer_tags_click_unestimated\">Add Estimate</a>";
			ret += "</td>";
		};
		
		ret += "</tr>";
	});
	ret += "</table>";

	return ret;
}

function component_viewer_tags_click_unestimated_table_row(link_clicked) {
	component_viewer_res_unestimated_click_table_row(link_clicked, component_viewer_tags_secheduledResoursesUpdated);
}

function component_viewer_tags_secheduledResoursesUpdated() {
	if (typeof(component_viewer_tags_tabobj)=="undefined") return;
	$("#MAIN").html(component_viewer_tags_getHtml(component_viewer_tags_tabobj));
}

function component_viewer_tags_click_getResAllocTableRow(task_obj) {
	var ret = "";
	ret += "<tr class=\"" + component_viewer_res_data_getresourseallocobjCSSTag(task_obj.res_alloc_obj) + "\" data-uid=\"" + task_obj.res_alloc_obj.uid + "\">";
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
	if (accessLevel=="READWRITE") {
		ret += "<td>"; // action cell
		ret += "<a href=\"#component_viewer_tags_click_editRA\"\">Edit</a>";
		ret += "</td>";
	}
	
	ret += "</tr>";
	return ret;
}

function component_viewer_tags_getResourseAllocationHtml(tagobj) {
	var ret = "";
	ret += "<h2>Resourse Allocations</h2>";
	// Write table head an only include action header if accesslevel is readwrite
	ret += component_viewer_res_project_getTableStart("component_viewer_tags_res_alloc_main", (accessLevel=="READWRITE"));
	tagobj.getTasks().map(function (task_obj) {
		ret += component_viewer_tags_click_getResAllocTableRow(task_obj);
	})
	ret += component_viewer_res_project_getTableEnd();
	ret += "To delete Allocations use google sheets";
	
	ret += "<h3>Completed resourse allocations</h3>";
	ret += "<table id=\"component_viewer_res_completedresourseallocations_main\">";
	ret += "<tr>";
	ret += "<th>Text</th>";
	ret += "<th>Type</th>";
	ret += "<th>Description</th>";
	ret += "<th>Tags</th>";
	ret += "</tr>";
	tagobj.getResourseAllocations().filter( function (raobj) {
		return (raobj.status == "Completed");
	}).map( function (res_alloc_obj) {
		ret += "<tr class=\"" + component_viewer_res_data_getresourseallocobjCSSTag(res_alloc_obj) + "\">";
		ret += "<td>" + res_alloc_obj.text + "</td>";
		ret += "<td>" + component_viewer_res_data_getresourseallocobjUserType(res_alloc_obj) + "</td>";
		ret += "<td>" + rjmlib_blankStringInsteadOfUndefined(res_alloc_obj.description) + "</td>";
		ret += "<td>" + component_viewer_res_data_getcombinedtagString(res_alloc_obj);
		ret += "</tr>";
	});
	ret += "</table>";
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
	ret += "<h2>Sample ROM</h2>";
	ret += "TODO";

	return globalFunctions.GetPageContentWithMenu(ret);
};

function component_viewer_tags_editResourseAllocation(tableRowClicked) {
	if (accessLevel!="READWRITE") return;
	var resAlloc_obj = dataObjects.RESOURCEALLOCATIONs[tableRowClicked.data("uid")];
	var comp_status = undefined;
	if (typeof(resAlloc_obj.itemuid)!="undefined") {
		var component = ic_soa_data_getComponentFromUID(resAlloc_obj.itemuid);
		comp_status = component.status;
	}
	component_viewer_res_schedule_ui_addedit(
		true, //Edit Mode
		{
			text: resAlloc_obj.text, 
			description: resAlloc_obj.description,
			lane: resAlloc_obj.resourcelaneassignment,
			rate: resAlloc_obj.assignmentrate,
			remain: resAlloc_obj.remainingdays,
			binpack: resAlloc_obj.binpackpriority,
		}, //Default Ok
		{uid:tableRowClicked.data("uid"),orig_comp_status:comp_status}, //passback
		function (result_obj, pb) { //Ok Callback
			component_viewer_res_schedule_ui_addedit_commonpost(false, result_obj, pb, component_viewer_tags_secheduledResoursesUpdated)
		},
		function (result_obj, pb) { //Complete Callback
			component_viewer_res_schedule_ui_addedit_commonpost(true, result_obj, pb, component_viewer_tags_secheduledResoursesUpdated)
		},
		comp_status
	);
};

function component_viewer_tags_INIT() {
	$(document).off('click.component_viewer_tags_click_unestimated').on('click.component_viewer_tags_click_unestimated', "a[href$='#component_viewer_tags_click_unestimated']", function (event) {
		component_viewer_tags_click_unestimated_table_row($(this).closest("tr"));
		event.preventDefault();
	});
	$(document).off('click.component_viewer_tags_click_editRA').on('click.component_viewer_tags_click_editRA', "a[href$='#component_viewer_tags_click_editRA']", function (event) {
		component_viewer_tags_editResourseAllocation($(this).closest("tr"))
		event.preventDefault();
	});

};

var component_viewer_tags_tabobj;
function component_viewer_tags_display(tagname) {
	if (!component_viewer_res_process_ScheduleProcessDone()) component_viewer_res_process_ScheduleResourses();
	component_viewer_tags_tabobj = ic_soa_data_tags_getObject(tagname, dataObjects);
	$("#MAIN").html(component_viewer_tags_getHtml(component_viewer_tags_tabobj));
	$("#MAIN").css("display","inline");
};

