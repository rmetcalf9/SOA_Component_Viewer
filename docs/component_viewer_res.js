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
	ret += "<td>";
	ret += "<a href=\"javascript:component_viewer_res_displayRES(\'ScheduleDetail\')\">Schedule Detail</a>";
	ret += "</td>";
	ret += "<td>";
	ret += "<a href=\"javascript:component_viewer_res_displayRES(\'ScheduleBoard\')\">Schedule Board</a>";
	ret += "</td>";
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

	if (page=="Unestimated") {
		ret += component_viewer_res_unestimated_getHtml();
	} else if (page=="ScheduleDetail") {
		ret += component_viewer_res_schedule_detail_getHtml();
	} else if (page=="ScheduleBoard") {
		ret += component_viewer_res_schedule_board_getHtml();
	} else {
		ret += "<h1>ERROR - Unknown Page</H1>";
		//alert("Error - unknown page " + page);
	}
	ret += '</td>';
	ret += '</tr>';
	ret += '</table>';	
	return ret;
};

function component_viewer_res_displayRES(page) {
	$("#MAIN").html(component_viewer_res_getRESHtml(page));
	$("#MAIN").css("display","inline");
	rjmlib_svg_postdisplayfixes();
};

function component_viewer_res_getFailedToScheduleHTML() {
	var ret = "";
	if (component_viewer_res_process_resourse_schedules.Failed_To_Schedule.length>0) {
		ret += "<h2>Warning - failed to schedule the following</h2>";
		ret += "<ul>";
		for (var cur in component_viewer_res_process_resourse_schedules.Failed_To_Schedule) {
			var obj = component_viewer_res_process_resourse_schedules.Failed_To_Schedule[cur];
			ret += "<li>" + obj.text + "</li>";
		};
		ret += "</ul>";
	};
	return ret;
};