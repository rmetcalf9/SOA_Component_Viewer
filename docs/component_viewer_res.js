"use strict";	

//Component Viewer Resourses section code

function component_viewer_res_getMenuHtml() {
	var ret = "";
	ret += "<table><tr>";
	//ret += "<th>Resourse Management</th>"
	//ret += "</tr><tr>";
	ret +=  '<td><a href="javascript:component_viewer_res_displayRES(\'Unestimated\')">Unestimated Work (<span id="component_viewer_res_componentsMissingEstimate">';
	ret += component_viewer_res_data_glob.componentsMissingEstimate.length;
	ret += '</span>)</a></td> '
	ret += "</tr></table>";

	return ret;
}
function component_viewer_res_updateMenuText() {
	var comp = $("#component_viewer_res_componentsMissingEstimate");
	if (typeof(comp)!="undefined") {
		comp.text(component_viewer_res_data_glob.componentsMissingEstimate.length);
	};
}

function component_viewer_res_getRESHtml(page) {
	var ret = "";
	ret += '<table>';
	ret += '<tr>';
	ret += '<td>';

	ret += '</td>';
	ret += '</tr>';
	ret += '<tr class="main">';
	ret += '<td valign="top">';
	
	ret += GetMenu();
	ret += component_viewer_res_unestimated_getHtml();
	ret += '</td>';
	ret += '</tr>';
	ret += '</table>';	
	return ret;
};

function component_viewer_res_displayRES(page) {
	if (page=="Unestimated") {
		$("#MAIN").html(component_viewer_res_getRESHtml(page));
		$("#MAIN").css("display","inline");
		component_viewer_res_unestimated_INIT();
	} else {
		alert("Error - unknown page " + page);
	}
};
