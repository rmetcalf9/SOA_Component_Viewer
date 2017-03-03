"use strict";	

function component_viewer_res_schedule_detail_getHtml() {
	var ret = "";
	ret += "<h1>Resourse Schedule - Detail View</h1>";

	if (!component_viewer_res_process_ScheduleProcessDone()) component_viewer_res_process_ScheduleResourses();
	
	ret += "<a href=\"#component_viewer_res_schedule_detail_recalc\">Re-Run schedule process</a>";
	
	if (component_viewer_res_process_resourse_schedules.Failed_To_Schedule.length>0) {
		ret += "<h2>Warning - failed to schedule the following</h2>";
		ret += "<ul>";
		for (var cur in component_viewer_res_process_resourse_schedules.Failed_To_Schedule) {
			var obj = component_viewer_res_process_resourse_schedules.Failed_To_Schedule[cur];
			ret += "<li>" + obj.text + "</li>";
		};
		ret += "</ul>";
	};
	
	ret += "<table id=\"component_viewer_res_schedule_main\">";
	
	ret += "<tr>";
	for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
		var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
		ret += "<th>" + res_lane_obj.uid + "<br> - " + res_lane_obj.rate + "</th>";
	}
	ret += "</tr>";
	
	ret += "<tr>";
	for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
		var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
		ret += "<td valign=\"top\">";
		ret += component_viewer_res_schedule_detail_getLaneHtml(res_lane_obj.uid);
		ret += "</td>";
	};
	ret += "</tr>";
	
	ret += "</table>";
	
	return ret;
};

function component_viewer_res_schedule_detail_getLaneHtml(lane_uid) {
	var ret = "";
	
	var lane_obj = component_viewer_res_process_get_scheduled_lane(lane_uid);
	
	ret += "<table>";
	ret += "<tr><th>Tasks:</th><td>" + lane_obj.allocated_resourses.length + "</td>";
	
	for (var cur_task in lane_obj.allocated_resourses) {
		ret += "<tr><td colspan=\"2\">";
		ret += component_viewer_res_schedule_detail_getTaskHtml(lane_obj.allocated_resourses[cur_task]);
		ret += "</td></tr>";
	};
	
	ret += "</table>";
	
	return ret;
};

function component_viewer_res_schedule_detail_getTaskHtml(task_obj) {
	var ret = "";
	
	var component_obj = ic_soa_data_getComponentFromUID(task_obj.res_alloc_obj.itemuid);
	
	var tbl_class = "";
	if (typeof(component_obj)!="undefined") {
		tbl_class = ic_soa_data_getSheetMetrics()[component_obj.source_sheet].css_tag;
	};
	
	ret += "<table class=\"task_table " + tbl_class + "\">";
	
	ret += "<tr>";
	ret += "<th colspan=\"2\">" + task_obj.res_alloc_obj.text + "</th>";
	ret += "</tr>";
	ret += "<tr>";
	ret += "<th>Start:</th>";
	ret += "<td>" + task_obj.start_day + "</td>";
	ret += "</tr>";
	ret += "<tr>";
	ret += "<th>Rate:</th>";
	ret += "<td>" + task_obj.rate + "</td>";
	ret += "</tr>";
	ret += "<tr>";
	ret += "<th>Remaining Days:</th>";
	ret += "<td>" + task_obj.res_alloc_obj.remainingdays + "</td>";
	ret += "</tr>";
	ret += "<tr>";
	ret += "<th>Duration:</th>";
	ret += "<td>" + task_obj.duration + "</td>";
	ret += "</tr>";
	
	ret += "</table>";

	return ret;
}

function component_viewer_res_schedule_detail_INIT() {
	$(document).on('click.component_viewer_res_unestimated', "a[href$='#component_viewer_res_schedule_detail_recalc']", function (event) {
		component_viewer_res_process_ScheduleResourses();
		component_viewer_res_displayRES("ScheduleDetail");
		event.preventDefault();
	});
};
