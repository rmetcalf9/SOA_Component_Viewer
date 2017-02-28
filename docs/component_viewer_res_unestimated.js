"use strict";	

var component_viewer_res_unestimated_tableCols = 3;

function component_viewer_res_unestimated_getHtml() {
	var ret = "";
	ret += "<h1>SOA Components that need Estimates</h1>";
	ret += "<p>This page lists all SOA Components that are not in the “Completed” or “Obsolete” states that do not have a Resource Allocation. (“Completed” Resource Allocations are ignored.) Components will appear multiple times if they have more than one tag associated.</p>"
	
	
	ret += "<table id=\"component_viewer_res_unestimated_main\">";
	ret += "<tr><th>Source Sheet Name</th><th>Component Name</th><th>Status</th></tr>";
	
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
			ret += "<tr class=\"" + ic_soa_data_getSheetMetrics()[component_obj.source_sheet].css_tag + "\">";
			
			ret += "<td>" + ic_soa_data_getSheetMetrics()[component_obj.source_sheet].sheet_name + "</td>";
			ret += "<td>" + component_obj.name + "</td>";
			ret += "<td>" + component_obj.status + "</td>";
			ret += "</tr>";
		}
	};
	
	return ret;
};
