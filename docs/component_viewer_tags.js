"use strict";	

function component_viewer_tags_navigate(navtofn) {
	navigateTo(navtofn,'Back to Tag ' + component_viewer_tags_tabobj.name,function () {component_viewer_tags_display(component_viewer_tags_tabobj.name)});
}

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
			ret += "<a href=\"#component_viewer_tags_click_unestimated\">Add Estimate</a> ";
			var viewfntext = component_obj.getViewFunctionText();
			if (typeof(viewfntext) != "undefined") {
				ret += "<a href=\"javascript:component_viewer_tags_navigate(function () {" + viewfntext + "})\">View</a>";
			};
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
	if (accessLevel=="READWRITE") {
		ret += " <a href=\"#component_viewer_tags_new_resourse_allocation\">Create new Resourse Allocation</a>";
	};
	ret += component_viewer_res_project_getTableStart("component_viewer_tags_res_alloc_main", (accessLevel=="READWRITE"));
	tagobj.getTasks().map(function (task_obj) {
		ret += component_viewer_tags_click_getResAllocTableRow(task_obj);
	})
	ret += component_viewer_res_project_getTableEnd();
	ret += "To delete Allocations use google sheets";
	
	ret += "<h3>Completed resourse allocations</h3>";
	var completedResourseAllocations = tagobj.getResourseAllocations().filter( function (raobj) {
		return (raobj.status == "Completed");
	});
	if (completedResourseAllocations.length == 0) {
		ret += "None";
	} else {
		ret += "<table id=\"component_viewer_res_completedresourseallocations_main\">";
		ret += "<tr>";
		ret += "<th>Text</th>";
		ret += "<th>Type</th>";
		ret += "<th>Description</th>";
		ret += "<th>Tags</th>";
		ret += "</tr>";
		completedResourseAllocations.map( function (res_alloc_obj) {
			ret += "<tr class=\"" + component_viewer_res_data_getresourseallocobjCSSTag(res_alloc_obj) + "\">";
			ret += "<td>" + res_alloc_obj.text + "</td>";
			ret += "<td>" + component_viewer_res_data_getresourseallocobjUserType(res_alloc_obj) + "</td>";
			ret += "<td>" + rjmlib_blankStringInsteadOfUndefined(res_alloc_obj.description) + "</td>";
			ret += "<td>" + component_viewer_res_data_getcombinedtagString(res_alloc_obj);
			ret += "</tr>";
		});
		ret += "</table>";
	}
	return ret;
}

function component_viewer_tags_RomSample_getHtml(tagobj) {
	var ret = "";
	ret += "<h2>Sample ROM</h2>";
	ret += "Developer days are the remaining days, completed items not shown."
	ret += "<table id=\"component_viewer_res_sample_rom\">";
	ret += "<tr>";
	ret += "<th>Owner</th>";
	ret += "<th>Task</th>";
	ret += "<th>ROM<BR>(Developer Days)</th>";
	ret += "<th>Notes";
	ret += " <a href=\"#component_viewer_res_project_sel\">Select for Copy</a>";
	ret += "</th>";
	ret += "</tr>";
	var developmentTotal = 0;
	tagobj.getResourseAllocations().filter( function (raobj) {
		return (raobj.status != "Completed");
	}).map( function (res_alloc_obj) {
		developmentTotal += res_alloc_obj.remainingdays;
		ret += "<tr class=\"" + component_viewer_res_data_getresourseallocobjCSSTag(res_alloc_obj) + "\">";
		if (component_viewer_res_data_getresourseallocobjCSSTag(res_alloc_obj) == "unknown") {
			ret += "<td></td>"; // Owner
		} else {
			ret += "<td>SOA Development</td>"; // Owner
		}
		ret += "<td>" + res_alloc_obj.text + "</td>"; //Task
		ret += "<td class=\"est_cell\">" + res_alloc_obj.remainingdays + " days" + "</td>"; //ROM
		ret += "<td>" + rjmlib_blankStringInsteadOfUndefined(res_alloc_obj.description) + "</td>"; //Notes
		ret += "</tr>";
	});
	var uatTotal = Math.round(developmentTotal * 0.15);
	var earlyLifeTotal = Math.round(developmentTotal * 0.05);
	var workstreamLeadTotal = Math.round(developmentTotal * 0.2);
	var ROMTotal = developmentTotal + uatTotal + earlyLifeTotal + workstreamLeadTotal;
	ret += "<tr><th></th><th>Development Total</th><th class=\"est_cell\">" + developmentTotal + " days</th><th></th></tr>";
	ret += "<tr><td></td><td>+ UAT Support (15%)</td><td class=\"est_cell\">" + uatTotal + " days</td><td></td></tr>";
	ret += "<tr><td></td><td>+ Early Life Support (5%)</td><td class=\"est_cell\">" + earlyLifeTotal + " days</td><td></td></tr>";
	ret += "<tr><td></td><td>+ Technical Workstream Lead / SOA Enterprise Lead (20%)</td><td class=\"est_cell\">" + workstreamLeadTotal + " days</td><td></td></tr>";
	ret += "<tr><th></th><th>ROM Total</th><th class=\"est_cell\">" + ROMTotal + " days</th><th></th></tr>";
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
	ret += component_viewer_tags_RomSample_getHtml(tagobj);

	return globalFunctions.GetPageContentWithMenu(ret);
};

function component_viewer_tags_editResourseAllocation(tableRowClicked) {
	if (accessLevel!="READWRITE") return;
	var resAlloc_obj = dataObjects.RESOURCEALLOCATIONs[tableRowClicked.data("uid")];
	var comp_status = undefined;
	var component_tag_array = [];
	if (typeof(resAlloc_obj.itemuid)!="undefined") {
		var component = ic_soa_data_getComponentFromUID(resAlloc_obj.itemuid);
		comp_status = component.status;
		component_tag_array = component.tags.split(",").map(function (v) {return v.trim(" ","")})
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
		comp_status,
		component_tag_array,
		resAlloc_obj.tags.split(",").map(function (v) {return v.trim(" ","")}) //res_tag_array
	);
};

function component_viewer_tags_createNewRsourseAllocation() {
	if (accessLevel=="READWRITE") {
		component_viewer_res_schedule_ui_addedit(
			false, //Edit Mode
			{
				text: "", 
				description: "",
				lane: "",
				rate: "",
				remain: "",
				binpack: "99999",
			}, //Default Ok
			undefined, //passback
			function (result_obj, passback) { //Ok Callback
				component_viewer_res_schedule_ui_new_commonpost(undefined, result_obj, component_viewer_tags_secheduledResoursesUpdated)
			},
			function (result_obj, passback) { //Complete Callback
				console.log("ERROR - supposadaly unreachable code");
			},
			undefined, //comp_status
			[], //comp_tag_array, - creating a RA without component so no array here
			[component_viewer_tags_tabobj.name] //newly created item start with this TAG
		);		
	};
}

function component_viewer_tags_INIT() {
	$(document).off('click.component_viewer_tags_click_unestimated').on('click.component_viewer_tags_click_unestimated', "a[href$='#component_viewer_tags_click_unestimated']", function (event) {
		component_viewer_tags_click_unestimated_table_row($(this).closest("tr"));
		event.preventDefault();
	});
	$(document).off('click.component_viewer_tags_click_editRA').on('click.component_viewer_tags_click_editRA', "a[href$='#component_viewer_tags_click_editRA']", function (event) {
		component_viewer_tags_editResourseAllocation($(this).closest("tr"))
		event.preventDefault();
	});
	$(document).off('click.component_viewer_tags_new_resourse_allocation').on('click.component_viewer_tags_new_resourse_allocation', "a[href$='#component_viewer_tags_new_resourse_allocation']", function (event) {
		component_viewer_tags_createNewRsourseAllocation();
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

