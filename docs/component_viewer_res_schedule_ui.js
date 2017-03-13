"use strict";	

//UI Components for resourse scheduler pages

var component_viewer_res_schedule_ui_globs = {
};

function component_viewer_res_schedule_board_getHtml() {
	var ret = "";
	ret += "<h1>Resourse Schedule - Board</h1>";

	if (!component_viewer_res_process_ScheduleProcessDone()) component_viewer_res_process_ScheduleResourses();
	
	ret += "<a href=\"#component_viewer_res_schedule_board_recalc\">Re-Run schedule process</a>";
	ret += component_viewer_res_getFailedToScheduleHTML();
	
	component_viewer_res_schedule_board_globs.lane_height = 100 * component_viewer_res_schedule_board_globs.lane_height_scale_factor;
	
	var days = 10;
	
	component_viewer_res_schedule_board_globs.height = (component_viewer_res_schedule_board_globs.y_title_height * 2);
	for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
		var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
		component_viewer_res_schedule_board_globs.height += (res_lane_obj.rate * component_viewer_res_schedule_board_globs.lane_height_scale_factor);
		
		var lane_obj = component_viewer_res_process_get_scheduled_lane(res_lane_obj.uid);
		var highest_end_day_for_lane = component_viewer_res_data_sch_getHighestLaneEndDay(lane_obj);
		if (days < highest_end_day_for_lane) days = highest_end_day_for_lane;
	};
	component_viewer_res_schedule_board_globs.width = component_viewer_res_schedule_board_globs.x_title_width + (days * component_viewer_res_schedule_board_globs.day_width);

	
	ret += "<br>";
	ret += "<svg class=\"component_viewer_res_schedule_board\" style=\"width: " + (component_viewer_res_schedule_board_globs.width + 10) + "px; height: " + (component_viewer_res_schedule_board_globs.height + 10) + "px;\">";
	
	ret += component_viewer_res_schedule_board_getSVG(days);
	
	ret += "</svg>";
	

	
	return ret;
};

function component_viewer_res_schedule_ui_INIT() {
	//TODO
};

	
	
