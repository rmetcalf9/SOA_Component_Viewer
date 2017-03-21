"use strict";	

var component_viewer_res_unestimated_tableCols = 4;

function component_viewer_res_unestimated_getHtml() {
	var ret = "";
	ret += "<h1>SOA Components that need Estimates</h1>";
	ret += "<p>This page lists all SOA Components that are not in the \"Completed\", \"In UAT\" or \"Obsolete\" states that do not have a Resource Allocation. (“Completed” Resource Allocations are ignored.) Components will appear multiple times if they have more than one tag associated.</p>"
	//This is implemented in the component_viewer_res_data_componentRequiresEstimate function
	
	if (accessLevel=="READWRITE") {
		component_viewer_res_unestimated_tableCols = 5;
	};
	
	ret += "<table id=\"component_viewer_res_unestimated_main\">";
	ret += "<tr><th>Source Sheet Name</th><th>Component Name</th><th>Status</th><th>Tags</th>";
	if (accessLevel=="READWRITE") {
		ret += "<th>Action</th>";
	};
	ret += "</tr>";
	
	//Generate the list for NO tag
	ret += component_viewer_res_unestimated_tableRowsForTAG("",component_viewer_res_unestimated_componentHasNoTag);
	
	//Go thorugh tags and generate ths list for items with that tag
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
	var ret = "";
	
	var first_row = true;
	for (var comp_idx in component_viewer_res_data_glob.componentsMissingEstimate) {
		var component_obj = ic_soa_data_getComponentFromUID(component_viewer_res_data_glob.componentsMissingEstimate[comp_idx]);
		if (decision_function(component_obj,tag)) {
			if (first_row) {
				//Make sure title is only shown where there is at least one item
				first_row = false;
				ret = "<tr>";
				ret += "<th colspan=\"" + component_viewer_res_unestimated_tableCols + "\">" + title + "</th>";
				ret += "</tr>";
			};
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
		}
	};
	
	return ret;
};

function component_viewer_res_unestimated_INIT() {
	$(document).off('click.component_viewer_res_unestimated').on('click.component_viewer_res_unestimated', "a[href$='#component_viewer_res_unestimated_click_table_row']", function (event) {
		component_viewer_res_unestimated_click_table_row($(this).closest("tr"));
		event.preventDefault();
	});
};

function component_viewer_res_unestimated_click_table_row(link_clicked) {
	var component_uid = link_clicked.data("uid");
	var component_obj = ic_soa_data_getComponentFromUID(component_uid);
	
	var days = ic_soa_data_getSheetMetrics()[component_obj.source_sheet].default_estimate;
	
	component_viewer_res_schedule_ui_addedit(
		false, //Edit Mode
		{
			text: component_obj.name, 
			lane: "",
			rate: "",
			remain: "",
			binpack: "99999",
		}, //Default Obk
		component_obj, //passback
		function (result_obj, component_obj) { //Ok Callback
			if (result_obj.remain==0) {
				rjmlib_ui_questionbox("Number of days for estimate must be greater than 0");
			} else {
				component_viewer_res_data_create_estimate(component_obj.uid, result_obj);
				
				//REMOVE FROM unestimated table
				$("#component_viewer_res_unestimated_main > tbody > tr[data-uid='" + component_obj.uid + "']").remove()

				//Automaticall re-schedule
				component_viewer_res_process_ScheduleResourses();
			};
		},
		function (component_obj, passback) { //Complete Callback
			console.log("ERROR - supposadaly unreachable code");
		},
		undefined //comp_status
	);		

};

