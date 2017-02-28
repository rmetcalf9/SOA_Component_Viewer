"use strict";	

var component_viewer_res_unestimated_tableCols = 3;

function component_viewer_res_unestimated_getHtml() {
	var ret = "";
	ret += "<h1>SOA Components that need Estimates</h1>";
	ret += "<p>This page lists all SOA Components that are not in the “Completed” or “Obsolete” states that do not have a Resource Allocation. (“Completed” Resource Allocations are ignored.) Components will appear multiple times if they have more than one tag associated.</p>"
	
	
	if (accessLevel=="READWRITE") {
		component_viewer_res_unestimated_tableCols = 4;
	};
	
	ret += "<table id=\"component_viewer_res_unestimated_main\">";
	ret += "<tr><th>Source Sheet Name</th><th>Component Name</th><th>Status</th>";
	if (accessLevel=="READWRITE") {
		ret += "<th>Action</th>";
	};
	ret += "</tr>";
	
	ret += component_viewer_res_unestimated_tableRowsForTAG("",component_viewer_res_unestimated_componentHasNoTag);
	for (var tag in dataObjects.TAGs) {
		ret += component_viewer_res_unestimated_tableRowsForTAG(tag,component_viewer_res_unestimated_componentHasTag);
	}
	ret += "</table>";
	
	return ret;
};

function component_viewer_res_unestimated_componentHasNoTag(component_obj,tag) {
	return (ic_soa_data_num_of_tags(component_obj.tags)==0);
};
function component_viewer_res_unestimated_componentHasTag(component_obj,tag) {
	return (ic_soa_data_istaginlist(tag,component_obj.tags));
}

//decision function is the function used to decide if a component should be in this list
function component_viewer_res_unestimated_tableRowsForTAG(tag, decision_function) {
	var title = tag;
	if (title=="") title = "No Tags";
	var ret = "<tr>";
	ret += "<th colspan=\"" + component_viewer_res_unestimated_tableCols + "\">" + title + "</th>";
	ret += "</tr>";
	
	for (var comp_idx in component_viewer_res_data_glob.componentsMissingEstimate) {
		var component_obj = ic_soa_data_getComponentFromUID(component_viewer_res_data_glob.componentsMissingEstimate[comp_idx]);
		if (decision_function(component_obj,tag)) {
			ret += "<tr class=\"" + ic_soa_data_getSheetMetrics()[component_obj.source_sheet].css_tag + "\" data-uid=\"" + component_obj.uid + "\">";
			
			ret += "<td>" + ic_soa_data_getSheetMetrics()[component_obj.source_sheet].sheet_name + "</td>";
			ret += "<td>" + component_obj.name + "</td>";
			ret += "<td>" + component_obj.status + "</td>";
			if (accessLevel=="READWRITE") {
				ret += "<td>";
				ret += "<a href=\"#component_viewer_res_unestimated_click_table_row\">Add Estimate</a>";
				ret += "</td>";
			};
			
			ret += "</tr>";
		}
	};
	
	return ret;
};

function component_viewer_res_unestimated_INIT() {
	$(document).on('click.component_viewer_res_unestimated', "a[href$='#component_viewer_res_unestimated_click_table_row']", function (event) {
		component_viewer_res_unestimated_click_table_row($(this).closest("tr"));
		event.preventDefault();
	});
};

function component_viewer_res_unestimated_click_table_row(link_clicked) {
	var component_uid = link_clicked.data("uid");
	console.log("TODO Prompt for work item text");
	console.log("TODO Prompt for days");
	console.log("TODO Prompt for days");
	console.log("TODO component_viewer_res_unestimated_create_estimate for " + component_uid);
};

function component_viewer_res_unestimated_create_estimate(component_uid, work_text, days) {
	component_viewer_res_data_create_estimate(component_uid, work_text, days);
	
	//REMOVE FROM unestimated table
	$("#component_viewer_res_unestimated_main > tbody > tr[data-uid='" + component_uid + "']").remove()
	
};
