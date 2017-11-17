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
	x_title_width: 100,
	y_title_height: 25,
	day_width: 50,
	lane_height_scale_factor: 1,
	lane_day_number_y_offset: 3,
	
	
	//Caculated values
	height: -1,
	width: -1,

	//Debug Values
	//debug_chain_uid: "Elijah",
};

function component_viewer_res_schedule_board_getHtml() {
	var ret = "";
	ret += "<h1>Resourse Schedule - Board</h1>";

	if (!component_viewer_res_process_ScheduleProcessDone()) component_viewer_res_process_ScheduleResourses();
	
	//Should not be automatic - not putting it here anymore
	//ret += "<a href=\"#component_viewer_res_schedule_board_recalc\">Re-Run schedule process</a>";
	
	if (accessLevel=="READWRITE") {
		ret += " <a href=\"#component_viewer_res_schedule_board_new_resourse_allocation\">Create new Resourse Allocation</a>";
	};
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
	$(document).off('click.component_viewer_res_schedule_board');
	$(document).on('click.component_viewer_res_schedule_board', "a[href$='#component_viewer_res_schedule_board_recalc']", function (event) {
		component_viewer_res_process_ScheduleResourses();
		component_viewer_res_displayRES("ScheduleBoard");
		event.preventDefault();
	});
	$(document).on('click.component_viewer_res_schedule_board', "svg.component_viewer_res_schedule_board > g.lane > g.resAlloc", function (event)
	{
		if (accessLevel=="READWRITE") {
			var resAlloc_obj = dataObjects.RESOURCEALLOCATIONs[$(this).data("uid")];
			var comp_status = undefined;
			var comp_tag_array = [];
			if (typeof(resAlloc_obj.itemuid)!="undefined") {
				var component = ic_soa_data_getComponentFromUID(resAlloc_obj.itemuid);
				comp_status = component.status;
				comp_tag_array = component.tags.split(",").map(function (v) {return v.trim(" ","")})
			}
			component_viewer_res_schedule_ui_addedit(
				true, //Edit Mode
				{
					text: resAlloc_obj.text, 
					description: resAlloc_obj.description,
					lane: resAlloc_obj.resourcelaneassignment,
					rate: resAlloc_obj.assignmentrate,
					remain: resAlloc_obj.remainingdays,
					binpack: resAlloc_obj.binpackpriority,
				}, //Default Ok
				{uid:$(this).data("uid"),orig_comp_status:comp_status}, //passback
				function (result_obj, pb) { //Ok Callback
				component_viewer_res_schedule_ui_addedit_commonpost(false, result_obj, pb, postEditPressedScheduleNotifyFN)
				},
				function (result_obj, pb) { //Complete Callback
				component_viewer_res_schedule_ui_addedit_commonpost(true, result_obj, pb, postEditPressedScheduleNotifyFN)
				},
				comp_status,
				comp_tag_array, //comp_tag_array,
				resAlloc_obj.tags.split(",").map(function (v) {return v.trim(" ","")}) //def_tag_array
			);
			event.preventDefault();
		};
	});
	$(document).on('click.component_viewer_res_schedule_board', "a[href$='#component_viewer_res_schedule_board_new_resourse_allocation']", function (event)
	{
		if (accessLevel=="READWRITE") {
			component_viewer_res_schedule_ui_addedit(
				false, //Edit Mode
				{
					text: "", 
					description: "",
					lane: "",
					rate: "",
					remain: "",
					binpack: "99999",
				}, //Default Ok
				undefined, //passback
				function (result_obj, passback) { //Ok Callback
					component_viewer_res_schedule_board_create_return(result_obj);
				},
				function (result_obj, passback) { //Complete Callback
					console.log("ERROR - supposadaly unreachable code");
				},
				undefined, //comp_status
				[], //comp_tag_array, - creating a RA without component so no array here
				[] //newly created item so no array here
			);		
		};
		event.preventDefault();
	});
	
	
};

//Function will return a cleaned up object
function component_viewer_res_schedule_board_common_validation(result_obj) {
	//Check inputs are valid
	//Text length > 2
	if (result_obj.text.length < 3) {rjmlib_ui_questionbox("You must enter more than 2 chars for text");return undefined;}
	
	//if it is set then rate is number
	if (typeof(result_obj.rate)!="undefined") {
		if (result_obj.rate != "") {
			if (isNaN(parseInt(result_obj.rate))) {rjmlib_ui_questionbox("You must enter a number for rate");return undefined;}
			if (result_obj.rate=="") result_obj.rate=0;
			result_obj.rate = parseInt(result_obj.rate);
		};
	};
	
	//remain is always number
	if (isNaN(parseFloat(result_obj.remain))) {
		rjmlib_ui_questionbox("You must enter a number for remaining days");
		return undefined;
	}
	result_obj.remain = parseFloat(result_obj.remain);

	//if it is set then binpack is number
	if (typeof(result_obj.binpack)!="undefined") {
		if (result_obj.binpack != "") {
			if (isNaN(parseInt(result_obj.binpack))) {rjmlib_ui_questionbox("You must enter a number for Bin Pack");return undefined;}
			result_obj.binpack = parseInt(result_obj.binpack);
		};
	};
	
	return result_obj;
};

//used in create new resourse allocaiton link
function component_viewer_res_schedule_board_create_return(result_obj) {
	result_obj = component_viewer_res_schedule_board_common_validation(result_obj);
	if (typeof(result_obj)=="undefined") return;

	//remain must be gt 0
	if (result_obj.remain<1) {
		rjmlib_ui_questionbox("You must enter a number of days for this new item");
		return undefined;
	}
	
	component_viewer_res_data_create_unlinked_estimate(result_obj);
	
	component_viewer_res_process_ScheduleResourses();
	component_viewer_res_displayRES("ScheduleBoard");

}

function postEditPressedScheduleNotifyFN() {
	component_viewer_res_displayRES("ScheduleBoard");
}

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

		if ((typeof(component_viewer_res_schedule_board_globs.debug_chain_uid)=="undefined") | (res_lane_obj.uid==component_viewer_res_schedule_board_globs.debug_chain_uid)) {
			ret += "<g class=\"lane\" clip-path=\"url(#" + clip_path_str + ")\">";
			ret += component_viewer_res_schedule_board_getSVG_for_laneItems(
				{x:component_viewer_res_schedule_board_globs.x_title_width,y:top},
				component_viewer_res_schedule_board_globs.lane_height_scale_factor,
				component_viewer_res_schedule_board_globs.day_width,
				component_viewer_res_process_get_scheduled_lane(res_lane_obj.uid)
			);
			ret += "</g>";
		};
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
	
	//Init day next start information
	var next_start_info = {
		next_start: [], 		//Indexd by day
		next_start_idx: [],		//indexed by number 0, 1, 2, etc
		drawn_chains: [],		//Information about already drawn chains
	};
	component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, 1, 0);
	/*
	Sample test to ensure upsert free slot and get start pos work
	console.log("Next Start Info=");
	console.log(next_start_info);
	component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, 5, 10);
	component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, 6, 50);
	component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, 15, 10);
	component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, 25, 0);
	component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, 30, 60);
	console.log("Next Start Info=");
	console.log(next_start_info);
	for (var c=0;c<31;c++) {
		console.log(component_viewer_res_schedule_board_get_start_pos_for_day(next_start_info, c));
	};
	*/
	
	while (chains_to_draw.length>0) {
		//Create list of chains that all start on the same LOWEST day (Sorted from higest duration to Lowest Duration)
		var chains_in_day = component_viewer_res_schedule_board_get_ordered_list_of_next_chains(chains, chains_to_draw);
		var lowest_day = chains[chains_in_day[0]].start_day; //Replace this with real code
		
		//Inistalise "start_percentage" height for the day all these chains start on
		//  Isn't always 0 as day might have blocks already. Create code to check this (using drawn chains)
		var start_per = component_viewer_res_schedule_board_get_start_pos_for_day(next_start_info, lowest_day); 
		
		
		
		//Draw chains in sorted order incrementing our TOP height
		for (var cur in chains_in_day) {
			var chain_idx_to_draw = chains_in_day[cur];

			
			//If we run out of height then add days to error day list (Keep drawing - it will be cropped anyway)
			if ((start_per+chains[chain_idx_to_draw].rate)>lane_obj.max_rate) {
				//The next position is not availiable for this chain and if we drew it it would be off the bottom.
				// There may still be a hole higher up where this chain can fit
				// As chains are drawn from lowest start day to highest and chains are always square if there is a hole in the start day
				//  it is graunteed that there is a hole in all following days
				//console.log("HOLE SEARCH!");
				var hole = component_viewer_res_schedule_board_get_any_hole_for_chain(chains[chain_idx_to_draw].start_day, chains[chain_idx_to_draw].rate, next_start_info);

				if (typeof(hole)=="undefined") {
					//could not find any hole
					// TODO Consider split representation of chains by drawing the same chain split in mutiple holes
					console.log("Rendering Errors in " + lane_obj.uid + " - max_rate=" + lane_obj.max_rate + " need " + (start_per+chains[chain_idx_to_draw].rate));
					console.log("Trying to draw:");
					console.log(chains[chain_idx_to_draw]);
					for (var c=chains[chain_idx_to_draw].start_day;c<=chains[chain_idx_to_draw].end_day;c++) {
						days_with_rendering_errors.push(c);
					};
				} else {
					//console.log("Hole found draw chain in hole");
					//console.log(hole);
					ret += component_viewer_res_schedule_board_drawchain(
						chains_to_draw, 
						chains, 
						chain_idx_to_draw,
						origin, 
						y_scale, 
						hole.start, 
						day_width, 
						lane_obj, 
						next_start_info
					);

					//We do noe need to adjust max rates since hole is not at the bottom (or else we would have drawn it without getting here)
				};

				//Remove this chain from to draw list
				if (rjmllib_ArrayRemove(chains_to_draw,chain_idx_to_draw)==false) {
					console.log("ERROR FAILED TO REMOVE Chains to draw222");
					break;
				};		
			} else {
				//As well as drawing this will maintain the next_start_info structure
				ret += component_viewer_res_schedule_board_drawchain(chains_to_draw, chains, chain_idx_to_draw,origin, y_scale, start_per, day_width, lane_obj, next_start_info);

				if (rjmllib_ArrayRemove(chains_to_draw,chain_idx_to_draw)==false) {
					console.log("ERROR FAILED TO REMOVE Chains to draw222");
					break;
				};		
			};
			start_per += chains[chain_idx_to_draw].rate;
		};
	};
	
	ret += component_viewer_res_schedule_board_drawRenderErrors(origin, y_scale, day_width, lane_obj.max_rate, days_with_rendering_errors);
	return ret;
}

function component_viewer_res_schedule_board_get_any_hole_for_chain(day, rate, next_start_info) {
	//Holes searched for by day and rate. Duration dosen't matter any hole today is valid forever
	//console.log("Find hole - searching for hole in day " + day + " of size + " + rate);
	//console.log(next_start_info);

	//instalise a completly open hole list
	var hole_list = [{start:0, end:100}];

	//console.log("Going through active chains on this day and remove items from hole list");
	for (var cur in next_start_info.drawn_chains) {
		var cur_chain = next_start_info.drawn_chains[cur];
		if (day >= cur_chain.start_day) {
			if (day <= cur_chain.end_day) {
				//Current chain is active on day in consideration
				hole_list = component_viewer_res_schedule_board_punch_new_hole_in_hole_list(hole_list,cur_chain.start_per,cur_chain.end_per);
			};
		};
	};

	//console.log("Resultant Hole list:");
	//console.log(hole_list);

	//Go through hole list and add all holes that are at least the required size
	var acceptable_hole_list = [];
	for (var cur in hole_list) {
		var cur_hole = hole_list[cur];
		if ((cur_hole.end - cur_hole.start)>=rate) acceptable_hole_list.push(cur_hole);
	};

	//console.log(acceptable_hole_list);

	//Return the first acceptable hole list (underfined if there are none acceptable)
	return acceptable_hole_list[0];
};

//Given a list of FREE slots in a hole remove the area passed by start and end inclusive
// This will return a new hole l ist object
function component_viewer_res_schedule_board_punch_new_hole_in_hole_list(hole_list,start,end) {
	var ret_list = [];
	//console.log("Remove area from " + start + " to " + end);

	for (var cur in hole_list) {
		var cur_hole = hole_list[cur];
		if (cur_hole.start > end) {
			//CASE 1
			//This hole is OK because the gap we want to punch starts after it finishes
			ret_list.push(cur_hole);
		} else if (cur_hole.end < start) {
			//CASE 2
			//This hole is OK because the gap we want to punch ends before it starts
			ret_list.push(cur_hole);
		} else if ((cur_hole.start >= start) & (cur_hole.end <= end)) {
			//CASE 3
			//Hole is completly inside the area we need to punch out - So don't add it to the return list
		} else if (cur_hole.start < start) {
			//CASE 4
			//Hole starts before the bit we need to punch out. (It either ends inside the gap or after)
			// in either case we need to create a new smaller hole for the free bit at the begenning
			ret_list.push({start:cur_hole.start,end:(start-1)});
		} else if (cur_hole.end > end) {
			//CASE 5
			//Hole ends after the bit we need to punch out. (It either starts before or during)
			// in either case we need to create a new smaller hole for the free bit at the end
			ret_list.push({start:(end+1),end:cur_hole.start});
		} else {
			console.log("ERROR - I thought I have covered all the cases - clearly not :(");
		};
	};

	return ret_list;
};

//Taking into account ONLY chains in chains_to_draw; Return an ordered list of "indexes of chains" that
// 1. All have the same LOWEST day
// 2. In descending order of duration (longest first)
function component_viewer_res_schedule_board_get_ordered_list_of_next_chains(chains, chains_to_draw) {
	var ret = []; //Stores indexes of chains
	
	var day = 9999999;
	for (var cur in chains_to_draw) {
		if (chains[chains_to_draw[cur]].start_day<day) {
			ret = [];
			day = chains[chains_to_draw[cur]].start_day; 
		};
		if (chains[chains_to_draw[cur]].start_day==day) {
			ret.push(chains_to_draw[cur]); //make sure we push an index of chains
		}
	};
	//console.log("list_of_next_chains");
	//console.log(chains);
	//console.log(ret);
	
	ret = ret.sort(function (ak,bk) {
		if (chains[ak].duration==chains[bk].duration) return 0;
		if (chains[ak].duration>chains[bk].duration) return -1;
		return 1;
	});	
	return ret;
};

function component_viewer_res_schedule_board_get_start_pos_for_day(next_start_info, day) {
	//Given a day and the next start info work out it's next free slot
	var next_start_percent = next_start_info.next_start[1].next_start_pos; //init to day 1 next start pos
	for (var cur in next_start_info.next_start_idx) {
		var cur_day = next_start_info.next_start_idx[cur];
		if (cur_day > day) return next_start_percent;
		next_start_percent = next_start_info.next_start[cur_day].next_start_pos;
	};
	return next_start_percent;
};

function component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, day, next_start_pos) {
	var already_there = true;
	if (typeof(next_start_info.next_start[day])=="undefined") already_there = false;
	next_start_info.next_start[day] = {
		day: day,
		next_start_pos: next_start_pos
	};
	if (already_there) return;
	next_start_info.next_start_idx = [];
	for (var cur in next_start_info.next_start) {
		next_start_info.next_start_idx.push(next_start_info.next_start[cur].day);
	};
	
	next_start_info.next_start_idx = next_start_info.next_start_idx.sort(function (ak,bk) {
		if (ak==bk) return 0;
		if (ak<bk) return -1;
		return 1;
	});	
}

function component_viewer_res_schedule_board_drawRenderErrors(origin, y_scale, day_width, max_rate, days_with_rendering_errors) {
	var ret = "";
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
			ret += component_viewer_res_schedule_board_drawRenderError(origin, y_scale, day_width, max_rate, cur_day);
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
function component_viewer_res_schedule_board_drawchain(
	chains_to_draw,
	chains,
	chain_idx,
	origin, 
	y_scale, 
	start_per, 
	day_width, 
	lane_obj,
	next_start_info
) {
	var ret = "";


	for (var cur in chains[chain_idx].res_alocs) {
		//console.log(chain.res_alocs[cur]);
		var allocation = chains[chain_idx].res_alocs[cur];
		ret += component_viewer_res_schedule_board_getSVG_for_laneItem(
			origin,
			y_scale, 
			day_width,
			allocation.start_day, //start_day
			allocation.end_day, //dne_day
			start_per, //start_per
			(start_per+allocation.rate)-1, //end_per
			allocation //alloc_res
		);
	};

	//Maintain next_start_info structure

	//Read current bar value (may not be already set value may need to read back)
	var curent_bar_value = component_viewer_res_schedule_board_get_start_pos_for_day(next_start_info, chains[chain_idx].start_day);
	//Upsert current bar value so an entry exists in start day	
	component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, chains[chain_idx].start_day, curent_bar_value);

	if (typeof(chains[chain_idx].end_day+1)!="undefined") {
		//There is no marker the day after this chain
		//We need to upsert one to it's current value
		var day_after_end_bar_value = component_viewer_res_schedule_board_get_start_pos_for_day(next_start_info, chains[chain_idx].end_day+1);
		component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info, chains[chain_idx].end_day+1, day_after_end_bar_value);
	};

	for (var cur_day=chains[chain_idx].start_day;cur_day<=chains[chain_idx].end_day;cur_day++) {
		//For all the days in the duration lower the bar to the bottom of this chain
		if (typeof(next_start_info.next_start[cur_day])!="undefined") {
			//console.log("Reducing bar value for day " + cur_day);
			curent_bar_value = next_start_info.next_start[cur_day].next_start_pos;
			
			//console.log("Setting day :" + cur_day + ": next start to " + (start_per+allocation.rate));
			
			//Set bar value to start_per+allocation.rate
			component_viewer_res_schedule_board_init_upsert_free_slot(next_start_info,cur_day,(start_per+allocation.rate));
		};
	};	

	//Add info to drawn_chains (this allows us to do the hole search later)
	next_start_info.drawn_chains.push({
		chain_idx: chain_idx,
		start_day: chains[chain_idx].start_day,
		end_day: chains[chain_idx].end_day,
		start_per: start_per,
		end_per: (start_per+chains[chain_idx].rate)-1,
	});

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
	
	//console.log("Building chains for " + lane_obj.obj.uid);
	//console.log(lane_obj);
	
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
	
	//console.log("Chains returned:");
	//console.log(ret_chains);
	
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
	if (end_percent<start_percent) console.log("ERROR negative height");
	if (end_day<start_day) console.log("ERROR negative width");
	
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
//		"(" + alloc_res.res_alloc_obj.remainingdays + "/" + alloc_res.duration + " days effort/duration) - " + alloc_res.rate + "%", //top right
		undefined, //top right
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
		rect_class,
		"class=\"resAlloc\" data-uid=\"" + alloc_res.res_alloc_obj.uid + "\""
	)
	
	return ret;	
}
	
	
	
	
