"use strict";	

//Component Viewer Resourses section code

function component_viewer_res_getMenuHtml() {
	var ret = "";
	ret += "<table><tr>";
	//ret += "<th>Resourse Management</th>"
	//ret += "</tr><tr>";
	ret +=  '<td><a href="javascript:component_viewer_res_displayRES(\'Unestimated\')">Unestimated Work (X)</a></td> '
	ret += "</tr></table>";

	return ret;
}

function component_viewer_res_getRESUnestimatedHtml() {
	var ret = "";
	ret += "<h1>TODO</h1>";
	return ret;
};

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
	ret += component_viewer_res_unestimaged_getHtml();
	ret += '</td>';
	ret += '</tr>';
	ret += '</table>';	
	return ret;
};

function component_viewer_res_displayRES(page) {
	if (page=="Unestimated") {
		$("#MAIN").html(component_viewer_res_getRESHtml(page));
		$("#MAIN").css("display","inline");
	} else {
		alert("Error - unknown page " + page);
	}
};
