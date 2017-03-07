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
	y_title_height: 25,
	day_width: 50,
	lane_height_scale_factor: 1,
	lane_day_number_y_offset: 3,
	
	
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

function component_viewer_res_schedule_board_INIT() {
	$(document).on('click.component_viewer_res_unestimated', "a[href$='#component_viewer_res_schedule_board_recalc']", function (event) {
		component_viewer_res_process_ScheduleResourses();
		component_viewer_res_displayRES("ScheduleBoard");
		event.preventDefault();
	});
};

function component_viewer_res_schedule_board_getSVG(days) {
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
		
		//Day number at top
		ret += "<g>";
		ret += "<text text-anchor=\"middle\" alignment-baseline=\"middle\" x=\"" + (x1 + (component_viewer_res_schedule_board_globs.day_width/2)) + "\" y=\"" + ((component_viewer_res_schedule_board_globs.y_title_height * 0.5) + component_viewer_res_schedule_board_globs.lane_day_number_y_offset) + "\">" + (d+1) + "</text>"
		ret += "</g>";

		//Day number at bottom
		ret += "<g>";
		ret += "<text text-anchor=\"middle\" alignment-baseline=\"middle\" x=\"" + (x1 + (component_viewer_res_schedule_board_globs.day_width/2)) + "\" y=\"" + (component_viewer_res_schedule_board_globs.height - (component_viewer_res_schedule_board_globs.y_title_height * 0.5)) + "\">" + (d+1) + "</text>"
		ret += "</g>";
		
		//Right hand side line
		ret += "<line class=\"grid\" x1=" + x2 + " y1=0 x2=" + x2 + " y2=" + component_viewer_res_schedule_board_globs.height + " />";
		
		/*
		c = x1;
		if (d % 10 == 0) y += 10;
		ret +="   <polygon fill=red stroke-width=0 points=\"" + c + "," + (y+10) + " " + (c + 20) + "," + (y+10) + " " + (c+10) + "," + y + "\" />";
		*/
	};
	
	var top = component_viewer_res_schedule_board_globs.y_title_height;
	var bottom = -1;
	for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
		var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
		bottom = top + (component_viewer_res_schedule_board_globs.lane_height_scale_factor * res_lane_obj.rate);
		
		//Lane title at left
		ret += "<g>";
		ret += "<text text-anchor=\"end\" alignment-baseline=\"middle\" x=\"" + (component_viewer_res_schedule_board_globs.x_title_width - 5) + "\" y=\"" + (top + ((bottom - top)/2)) + "\">" + res_lane_obj.uid + ":" + "</text>"
		ret += "</g>";		
		
		ret += "<line class=\"grid\" x1=0 y1=" + bottom + " x2=" + component_viewer_res_schedule_board_globs.width + " y2=" + bottom + " />";
		
		ret += component_viewer_res_schedule_board_getSVG_for_laneItems(
			{x:component_viewer_res_schedule_board_globs.x_title_width,y:top},
			component_viewer_res_schedule_board_globs.lane_height_scale_factor,
			component_viewer_res_schedule_board_globs.day_width,
			component_viewer_res_process_get_scheduled_lane(res_lane_obj.uid)
		);
		
		top = bottom;
	}
	


	return ret;
};

function component_viewer_res_schedule_board_getSVG_for_laneItems(origin, y_scale, day_width, lane_obj) {
	var ret = "";
	
	console.log("TODO");
	console.log(origin);
	console.log(y_scale);
	console.log(lane_obj);
	
	//SORT all allocated resourses by duration descending
	
	//Draw and place each allocated resourse in durations logging it as drawn and splitting boxes if required
	
	return ret;
}

function component_viewer_res_schedule_board_getSVG_for_laneItems(
	lane_origin,
	y_scale, 
	day_width,
	start_day,
	end_day,
	start_percent,
	end_percent,
	lane_obj
) {
	console.log("TODO");
}
	
	
	
	