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
		var height = component_viewer_res_schedule_board_globs.lane_height_scale_factor * res_lane_obj.rate;
		bottom = top + height;
		
		//Lane title at left
		ret += "<g>";
		ret += "<text text-anchor=\"end\" alignment-baseline=\"middle\" x=\"" + (component_viewer_res_schedule_board_globs.x_title_width - 5) + "\" y=\"" + (top + ((bottom - top)/2)) + "\">" + res_lane_obj.uid + ":" + "</text>"
		ret += "</g>";		
		
		ret += "<line class=\"grid\" x1=0 y1=" + bottom + " x2=" + component_viewer_res_schedule_board_globs.width + " y2=" + bottom + " />";
		
		var clip_path_str = "component_viewer_res_schedule_board_cp" + res_lane_obj.uid;
//if ((res_lane_obj.uid=="OA_100")) { //Useful for testing a single lane to reduce debug messages
		ret += "<g class=\"lane\" clip-path=\"url(#" + clip_path_str + ")\">";
		ret += component_viewer_res_schedule_board_getSVG_for_laneItems(
			{x:component_viewer_res_schedule_board_globs.x_title_width,y:top},
			component_viewer_res_schedule_board_globs.lane_height_scale_factor,
			component_viewer_res_schedule_board_globs.day_width,
			component_viewer_res_process_get_scheduled_lane(res_lane_obj.uid)
		);
		ret += "</g>";
//};
		ret += "<clipPath id=\"" + clip_path_str + "\">";
		ret += "<rect x=\"" + component_viewer_res_schedule_board_globs.x_title_width + "\" y=\"" + top + "\" width=\"" + (days * component_viewer_res_schedule_board_globs.day_width) + "\" height=\"" + height + "\"/>";
		ret += "</clipPath>";

		top = bottom;
	}
	


	return ret;
};

function component_viewer_res_schedule_board_getSVG_for_laneItems(origin, y_scale, day_width, lane_obj) {
	var ret = "";
	var days_with_rendering_errors = [];
	//Some test data to see how rendering days with errors works
	/*
	days_with_rendering_errors.push(16);
	days_with_rendering_errors.push(15);
	days_with_rendering_errors.push(14);
	days_with_rendering_errors.push(4);
	days_with_rendering_errors.push(5);
	days_with_rendering_errors.push(6);
	days_with_rendering_errors.push(23);
	days_with_rendering_errors.push(21);
	days_with_rendering_errors.push(20);
	days_with_rendering_errors.push(21);
	days_with_rendering_errors.push(1);
	days_with_rendering_errors.push(22);
	days_with_rendering_errors.push(24);
	days_with_rendering_errors.push(23);
	*/	
	
	//Group resAlocs into chains
	var chains = component_viewer_res_schedule_board_group_into_chains(lane_obj);
	
	var chains_to_draw = []; //Stores indexes of chains
	for (var cur in chains) {
		chains_to_draw.push(cur);
	};
	
	while (chains_to_draw.length>0) {
		//TODO Create list of chains that all start on the LOWEST day
		
		//TODO Sort list form highest duration to lowest duration
		
		//TODO Inistalise "TOP" height for the day all these chains start on
		
		//TODO Draw chains in sorted order incrementing our TOP height
			//TODO If we run out of height then add days to error day list (Keep drawing - it will be cropped anyway)
		
		ret += component_viewer_res_schedule_board_drawchain(chains_to_draw, chains, chains_to_draw[0],origin, y_scale, day_width, lane_obj);
	};
	
	
	//Sort days_with_rendering_errors into assecending order
	days_with_rendering_errors = days_with_rendering_errors.sort(function (ak,bk) {
		if (ak==bk) return 0;
		if (ak<bk) return -1;
		return 1;
	});	
	
	//Put X's on days_with_rendering_errors (Deduplicating as we go)
	var last_day_rendered = -1;
	for (var cur in days_with_rendering_errors) {
		var cur_day = days_with_rendering_errors[cur];
		if (last_day_rendered != cur_day) {
			last_day_rendered = cur_day;
			ret += component_viewer_res_schedule_board_drawRenderError(origin, y_scale, day_width, lane_obj.max_rate, cur_day);
		};
	};

	return ret;
}

function component_viewer_res_schedule_board_drawRenderError(origin, y_scale, day_width, max_rate, day) {
	var ret = "";
	
	//co-ords make rect
	var x1 = origin.x + ((day-1)*day_width);
	var x2 = x1 + day_width;
	var y1 = origin.y;
	var y2 = y1 + (max_rate * y_scale); //lane_height;
	ret += "<line class=\"rendererror\" x1=\"" + x1 + "\" y1=\"" + y1 + "\" x2=" + x2 + " y2=" + y2 + " />";
	ret += "<line class=\"rendererror\" x1=\"" + x1 + "\" y1=\"" + y2 + "\" x2=" + x2 + " y2=" + y1 + " />";

	
	return ret;
};

//Draws a chain and removes it from chains_to_draw list
function component_viewer_res_schedule_board_drawchain(chains_to_draw,chains,chain_idx,origin, y_scale, day_width, lane_obj) {
	var ret = "";

	if (rjmllib_ArrayRemove(chains_to_draw,chain_idx)==false) {
		console.log("ERROR FAILED TO REMOVE Chains to draw");
		return "";
	};		
	
	
	for (var cur in chains[chain_idx].res_alocs) {
		//console.log(chain.res_alocs[cur]);
		var allocation = chains[chain_idx].res_alocs[cur];
		ret += component_viewer_res_schedule_board_getSVG_for_laneItem(
			origin,
			y_scale, 
			day_width,
			allocation.start_day, //start_day
			allocation.end_day, //dne_day
			0, //start_per
			allocation.rate, //end_per
			allocation //alloc_res
		);
	};


	return ret;
}


function component_viewer_res_schedule_board_group_into_chains(lane_obj) {
	var ret_chains = [];
	
	//Go through all allocated resourses that have not been assigned and see if we can group any 
	// together. Resulting in one chain of resourse which can be drawn in sequence (because they fit in a rectangle)
	
	var unassigned_objects = [];
	for (var cur in lane_obj.allocated_resourses) {
		unassigned_objects.push(cur);
	};
	
	console.log("Building chains for " + lane_obj.obj.uid);
	console.log(lane_obj);
	
	//While objects remain on the list
	while (unassigned_objects.length>0) {
		//console.log("STARTING NEW CHAIN CREATION with unassigned objects:");
		//console.log(unassigned_objects);

		//Pick the longest obj in the lowest day from the list - make this a chain and remove it from unassigned_objects list
		var cur_obj_idx = component_viewer_res_schedule_board_getLongestObjWithLowestDay(lane_obj, unassigned_objects);
		var chain = component_viewer_res_schedule_board_create_chain(lane_obj.allocated_resourses[cur_obj_idx]);
		if (rjmllib_ArrayRemove(unassigned_objects,cur_obj_idx)==false) {
			console.log("ERROR FAILED TO REMOVE - GIVING UP MAKING CHAIN");
			break;
		};
			//console.log(unassigned_objects);
		
		//While objects of same size exist at the day after the chain ends
			//console.log("Started the following chain CHAIN:");
			//console.log(chain);
			//console.log("Searching for possible next items");
		var next_possible_resourse_idx = component_viewer_res_schedule_board_getUnassignedResourseAllocationsStartingOnDayWithParticularRateAndLongestDuration(lane_obj, unassigned_objects,chain.end_day + 1,chain.rate);
		while (typeof(next_possible_resourse_idx)!="undefined") {
			//add object to chain and remove it from unassigned_objects. This updates chain with ned end_Day
			component_viewer_res_schedule_board_append_to_end_of_chain(chain,lane_obj.allocated_resourses[next_possible_resourse_idx]);
				//console.log(lane_obj.allocated_resourses[next_possible_resourse_idx]);
			if (rjmllib_ArrayRemove(unassigned_objects,next_possible_resourse_idx)==false) {
				console.log("ERROR FAILED TO REMOVE - GIVING UP MAKING CHAIN 2222");
				break;
			};
			next_possible_resourse_idx = component_viewer_res_schedule_board_getUnassignedResourseAllocationsStartingOnDayWithParticularRateAndLongestDuration(lane_obj, unassigned_objects,chain.end_day + 1,chain.rate);
		};

		ret_chains.push(chain);
	}; //wend
	
	console.log("Chains returned:");
	console.log(ret_chains);
	
	return ret_chains;
}

//Creates a brand new chain based on an allocated resourse
function component_viewer_res_schedule_board_create_chain(res_obj) {
	var res_allocs_arr = [];
	res_allocs_arr.push(res_obj);
		//console.log("Starting new chain with:");
		//console.log(res_obj);
	return {
		start_day: res_obj.start_day,
		end_day: res_obj.end_day,
		duration: res_obj.duration,
		rate: res_obj.rate,
		res_alocs: res_allocs_arr,
	}
};
function component_viewer_res_schedule_board_append_to_end_of_chain(chain, res_obj) {
	//Caller responsible for checking correct day and match
	chain.res_alocs.push(res_obj);
	chain.end_day = res_obj.end_day;
	chain.duration += res_obj.duration;
}


//Only return single rerousse. If more than one match get the first
function component_viewer_res_schedule_board_getUnassignedResourseAllocationsStartingOnDayWithParticularRateAndLongestDuration(lane_obj, unassigned_objects,day,rate) {
	var ret_arr = [];
	for (var cur_idx in unassigned_objects) {
		var res_obj = lane_obj.allocated_resourses[unassigned_objects[cur_idx]];
		if (res_obj.start_day == day) {
			if (res_obj.rate == rate) {
					//console.log("Possible match with " + cur_idx);
				ret_arr.push(unassigned_objects[cur_idx]);
			}
		};
	};
	if (ret_arr.length==0) return undefined;

	var longest_duration = -1;
	var ret_idx = -1;
	for (var cur_idx2 in ret_arr) {
		var res_obj = lane_obj.allocated_resourses[ret_arr[cur_idx2]];
		if (res_obj.duration > longest_duration) {
			ret_idx = ret_arr[cur_idx2];
			longest_duration = res_obj.duration;
		};
	};

	return ret_idx;
};

//unassigned_objects is array of ID's for the lane_obj.allocated_resourses 
function component_viewer_res_schedule_board_getLongestObjWithLowestDay(lane_obj, unassigned_objects) {
	//Check lowest day first
	var objs_with_lowest_day = [];
	var day = 9999999;
	for (var cur_idx in unassigned_objects) {
		var obj = lane_obj.allocated_resourses[unassigned_objects[cur_idx]];
		if (obj.start_day<day) {
			day = obj.start_day;
			objs_with_lowest_day = [];
		};
		if (obj.start_day==day) {
			objs_with_lowest_day.push(unassigned_objects[cur_idx]);
		};
	};

	//console.log("Objects starting on lowest day:" + day);
	//console.log(objs_with_lowest_day);

	var max_duration = -1;
	var obj_idx_ret = undefined;
	for (var cur_idx2 in objs_with_lowest_day) {
		var obj = lane_obj.allocated_resourses[objs_with_lowest_day[cur_idx2]];
		if (obj.duration > max_duration) {
			max_duration = obj.duration;
			obj_idx_ret = objs_with_lowest_day[cur_idx2];
		};
	};
	return obj_idx_ret;
};

function component_viewer_res_schedule_board_getSVG_for_laneItem(
	lane_origin,
	y_scale, 
	day_width,
	start_day,
	end_day,
	start_percent,
	end_percent,
	alloc_res
) {
	var ret = "";
	
	//console.log(alloc_res);
	
	var rect_x_pos = (lane_origin.x + ((start_day-1)*day_width));
	var rect_y_pos = lane_origin.y + (start_percent-1);
	var width = (end_day - start_day + 1) * day_width;
	var height = end_percent - start_percent;
	var text = alloc_res.res_alloc_obj.text + " (" + alloc_res.res_alloc_obj.remainingdays + " Remaing - " + alloc_res.rate + "% effort)";
	var component_status = undefined;
	var component_tags = undefined;
	
	var rect_class = "outer default";
	if (typeof(alloc_res.res_alloc_obj.itemuid)!="undefined") {
		var component = ic_soa_data_getComponentFromUID(alloc_res.res_alloc_obj.itemuid);
		if (typeof(component)!="undefined") {
			rect_class = "outer " + ic_soa_data_getSheetMetrics()[component.source_sheet].css_tag;
			component_status = "(" + component.status + ")"
			component_tags = component.tags;
		};
	};
	
	ret += rjmlib_svg_cropped_text_in_rect(
		alloc_res.res_alloc_obj.text, //tl
		undefined,
		"(" + alloc_res.res_alloc_obj.remainingdays + "/" + alloc_res.duration + " days effort/duration) - " + alloc_res.rate + "%", //top right
		undefined, //cl
		undefined,
		undefined,
		component_status, //bottom left
		undefined,
		component_tags, //bottom right
		rect_x_pos,
		rect_y_pos,
		width,
		height,
		rect_class
	)
	
	return ret;	
}
	
	
	
	
