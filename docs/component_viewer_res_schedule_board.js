"use strict";	

//$("svg.component_viewer_res_schedule_board").animate({svgTransform: 'translate(50 50) rotate(60)'});

/*
var  svg = $("#mysvg").get(0);

var w = svg.width.baseVal.value;
var h = svg.height.baseVal.value;
svg.setAttribute('viewBox', '0 0 '+w+' '+h);
svg.setAttribute('width', '100%');
svg.setAttribute('height', '100%');


$("svg.component_viewer_res_schedule_board").setAttribute('height', '10%')

transform: rotate(30deg);
transform: scale(1.9);
*/

var component_viewer_res_schedule_board_globs = {
	x_title_width: 200,
	y_title_height: 50,
	day_width: 50,
	lane_height: 1000,
	
	
	//Caculated values
	height: -1,
	width: -1,
};

function component_viewer_res_schedule_board_getHtml() {
	var ret = "";
	ret += "<h1>Resourse Schedule - Board</h1>";

	if (!component_viewer_res_process_ScheduleProcessDone()) component_viewer_res_process_ScheduleResourses();
	
	ret += "<a href=\"#component_viewer_res_schedule_board_recalc\">Re-Run schedule process</a>";
	ret += component_viewer_res_getFailedToScheduleHTML();
	
	var days = 50;
	var lanes = 3;
	
	component_viewer_res_schedule_board_globs.width = component_viewer_res_schedule_board_globs.x_title_width + (days * component_viewer_res_schedule_board_globs.day_width);
	component_viewer_res_schedule_board_globs.height = component_viewer_res_schedule_board_globs.y_title_height + (lanes * component_viewer_res_schedule_board_globs.lane_height);
	
	
	ret += "<br>";
	ret += "<svg class=\"component_viewer_res_schedule_board\" style=\"width: " + (component_viewer_res_schedule_board_globs.width + 10) + "px; height: " + (component_viewer_res_schedule_board_globs.height + 10) + "px;\">";
	
	ret += component_viewer_res_schedule_board_getSVG(days, lanes);
	
	ret += "</svg>";
	

	
	return ret;
};

function component_viewer_res_schedule_board_INIT() {
	$(document).on('click.component_viewer_res_unestimated', "a[href$='#component_viewer_res_schedule_board_recalc']", function (event) {
		component_viewer_res_process_ScheduleResourses();
		component_viewer_res_displayRES("ScheduleBoard");
		event.preventDefault();
	});
};

function component_viewer_res_schedule_board_getSVG(days, lanes) {
	var ret = "";
	var c = 0;
	var y = 0;
	
	
	//Each day draws it's final line. This draws the first one
	ret += "<line class=\"grid\" x1=0 y1=" + component_viewer_res_schedule_board_globs.y_title_height + " x2=" + component_viewer_res_schedule_board_globs.width + " y2=" + component_viewer_res_schedule_board_globs.y_title_height + " />";
	
	//Draw the horizontal line under the titles (each lane draws it's own line at the bottom
	ret += "<line class=\"grid\" x1=" + component_viewer_res_schedule_board_globs.x_title_width + " y1=0 x2=" + component_viewer_res_schedule_board_globs.x_title_width + " y2=" + component_viewer_res_schedule_board_globs.height + " />";
	
	for (var d=0;d<days;d++) {
		var x1 = component_viewer_res_schedule_board_globs.x_title_width + (d * component_viewer_res_schedule_board_globs.day_width);
		var x2 = component_viewer_res_schedule_board_globs.x_title_width + ((d+1) * component_viewer_res_schedule_board_globs.day_width);
		
		ret += "<line class=\"grid\" x1=" + x2 + " y1=0 x2=" + x2 + " y2=" + component_viewer_res_schedule_board_globs.height + " />";
		
		c = x1;
		if (d % 10 == 0) y += 10;
		ret +="   <polygon fill=red stroke-width=0 points=\"" + c + "," + (y+10) + " " + (c + 20) + "," + (y+10) + " " + (c+10) + "," + y + "\" />";
	};
	
	for (var cur_lane=0;cur_lane<lanes;cur_lane++) {
		var y1 = component_viewer_res_schedule_board_globs.y_title_height + ((cur_lane) * component_viewer_res_schedule_board_globs.lane_height);
		var y2 = component_viewer_res_schedule_board_globs.y_title_height + ((cur_lane+1) * component_viewer_res_schedule_board_globs.lane_height);
		
		//Draw line at bottom of lane
		ret += "<line class=\"grid\" x1=0 y1=" + y2 + " x2=" + component_viewer_res_schedule_board_globs.width + " y2=" + y2 + " />";
	};
	return ret;
};
