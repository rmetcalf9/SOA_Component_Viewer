"use strict";	

//Code and dataobjects for the resourse allocation process

var component_viewer_res_process_resourse_schedules = {};

function component_viewer_res_process_ScheduleProcessDone() {
	return (typeof(component_viewer_res_process_resourse_schedules.Lanes)!="undefined")
};

function component_viewer_res_process_ScheduleResourses() {

	//console.log("Sort resourse allocaitons by priority asc");
	dataObjects.RESOURCEALLOCATIONkeys = dataObjects.RESOURCEALLOCATIONkeys.sort(function (ak,bk) {
		if (dataObjects.RESOURCEALLOCATIONs[ak].binpackpriority==dataObjects.RESOURCEALLOCATIONs[bk].binpackpriority) return 0;
		if (dataObjects.RESOURCEALLOCATIONs[ak].binpackpriority<dataObjects.RESOURCEALLOCATIONs[bk].binpackpriority) return -1;
		return 1;
	});
	/*
	for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
		var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
		console.log(res_alloc_obj.text + " " + res_alloc_obj.binpackpriority);
	};
	*/
	
	if (accessLevel=="READWRITE") {
		//console.log("If sort order results in changes write new order to googlesheet");
		//This step will fill any any items with missing orders and spread out where mutiple items have same order
		board_prepare_saveBatch();
		var cur_rec = 0;
		var num_changed = 0;
		for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
			cur_rec += 10;
			var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
			if (res_alloc_obj.binpackpriority != cur_rec) {
				res_alloc_obj.binpackpriority = cur_rec;
				component_viewer_res_data_save_resourse_allocation_into_batch(res_alloc_obj.uid)
				num_changed ++;
			};
		}
		if (num_changed>0) {
			board_execute_saveBatch(spreadsheetId);
		};
	};

	//console.log("Clear all current scheduled allocations");
	component_viewer_res_process_resourse_schedules = {
		Lanes: [],
		Failed_To_Schedule: []
	};
	
	//Init the Lanes
	for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
		var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
		component_viewer_res_process_init_lane(res_lane_obj);
	}
	

	//console.log("Go through ResoueseAllocaitons in order and schedule each one");
	for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
		var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
		if (res_alloc_obj.status != "Completed") {
			if (res_alloc_obj.remainingdays > 0) {
		
				//Step 1 decide which lane to allocate this resourse to
				var schedule_proposal_obj = undefined;
				//Code for pre-allocated resourses
				schedule_proposal_obj = component_viewer_res_process_find_best_lane_for_object(res_alloc_obj);
				
				
				//Step 2 allocate resourse to this lane
				if (typeof(schedule_proposal_obj)=="undefined") {
					console.log("WARNING - Failed to schedule " + res_alloc_obj.text + " (Try lowering it's rate)");
					console.log(res_alloc_obj);
					component_viewer_res_process_resourse_schedules.Failed_To_Schedule.push(res_alloc_obj);
				} else {
					component_viewer_res_process_lane_allocate_proposal(schedule_proposal_obj);
				};
			};
		};
	};
	
	//Sort allocated resourses in each lane
	for (var lane_schedule in component_viewer_res_process_resourse_schedules.Lanes) {
		var obj = component_viewer_res_process_resourse_schedules.Lanes[lane_schedule];
		
		//TODO Extend so that they are also sorted by end day asc
		obj.allocated_resourses.sort(function (ak,bk) {
			if (ak.start_day==bk.start_day) return 0;
			if (ak.start_day<bk.start_day) return -1;
			return 1;
		});
	};
	
	
	//DEBUG output the results so I can inspect
	//console.log(component_viewer_res_process_resourse_schedules);
};

//Returns the scheduled lane object for a given lane
function component_viewer_res_process_get_scheduled_lane(lane_uid) {
	for (var lane_schedule in component_viewer_res_process_resourse_schedules.Lanes) {
		var obj = component_viewer_res_process_resourse_schedules.Lanes[lane_schedule];
		if (obj.obj.uid==lane_uid) return obj;
	}
	
	return undefined;
}

//inatalise an empty lane data structure ready for allocation of tasks
function component_viewer_res_process_init_lane(res_lane_obj) {
	var max_rate = parseInt(res_lane_obj.rate);
	component_viewer_res_process_resourse_schedules.Lanes[res_lane_obj.uid] = {
		obj: res_lane_obj,
		max_rate: max_rate,
		free_slots: [],
		free_slots_idx: [],
		allocated_resourses: []
	}
	component_viewer_res_process_init_lane_upsert_free_slot(component_viewer_res_process_resourse_schedules.Lanes[res_lane_obj.uid],1,max_rate);
};
function component_viewer_res_process_init_lane_upsert_free_slot(res_lane_obj,day,rate) {
	var already_there = true;
	if (typeof(res_lane_obj.free_slots[day])=="undefined") already_there = false;
	res_lane_obj.free_slots[day] = {
		day: day,
		amount_free: rate
	};
	if (already_there) return;
	res_lane_obj.free_slots_idx = [];
	for (var cur in res_lane_obj.free_slots) {
		res_lane_obj.free_slots_idx.push(res_lane_obj.free_slots[cur].day);
	};
	
	res_lane_obj.free_slots_idx = res_lane_obj.free_slots_idx.sort(function (ak,bk) {
		if (ak==bk) return 0;
		if (ak<bk) return -1;
		return 1;
	});	
}

//Given a resouese allocaiton return the lane schedule object that best fits for allocation
// Note - this version has NO rate set and will adjust the rate for the max it can find
function component_viewer_res_process_find_best_lane_for_object(res_alloc_obj) {
	var ret = undefined;
	
	//Each lane makes a proposal. Each proposal will have an End day (caculated based on the rate)
	// the code will order choose the proposal with the lowest End day and this is where the resourse will be allocated
	
	var proposals = [];

	//Get proposals from all lanes
	// Lanes may return mutiple proposals including undefined proposals - filtered out later
	for (var lane_schedule in component_viewer_res_process_resourse_schedules.Lanes) {
		component_viewer_res_process_lane_make_proposal(proposals,component_viewer_res_process_resourse_schedules.Lanes[lane_schedule], res_alloc_obj);
	};
	
	//Find proposal with lowest end day
	var lowest_end_day = 9999999;
	for (var proposal in proposals) {
		var proposal_obj = proposals[proposal];
		if (typeof(proposal_obj)!="undefined") {
			if (proposal_obj.end_day < lowest_end_day) {
				ret = proposal_obj;
				lowest_end_day = proposal_obj.end_day;
			};
		};
	};
	
	return ret;
};

function component_viewer_res_process_lane_valueset(val) {
	if (typeof(val)!="undefined") {
		if (val != "") {
			if (val != null) {
				return true;
			}
		}
	}
	return false;
};

//Push proposals for particular resourse lane
function component_viewer_res_process_lane_make_proposal(proposals, lane_schedule_obj, res_alloc_obj) {
	if (component_viewer_res_process_lane_valueset(res_alloc_obj.resourcelaneassignment)) {
		//There is a resourse lane set in the spreadsheet. Only return a proposal if it is this lane
		if (res_alloc_obj.resourcelaneassignment!=lane_schedule_obj.obj.uid) return;
	} else {
		//There is no resourse lane set. Only return a proposal if autoassign is true
		if (!lane_schedule_obj.obj.autoassign) return;
	};
	
	for (var cur in lane_schedule_obj.free_slots_idx) {
		component_viewer_res_process_lane_make_proposal_slot(proposals, lane_schedule_obj, res_alloc_obj, lane_schedule_obj.free_slots[lane_schedule_obj.free_slots_idx[cur]]);
	};
	return;
}

//Make proposal for particular lane and particular slot
function component_viewer_res_process_lane_make_proposal_slot(proposals, lane_schedule_obj, res_alloc_obj, slot) {
	if (slot.amount_free==0) return 0;
	var rate = slot.amount_free;

	var isRateAdjustable = true;
	if (res_alloc_obj.assignmentrate != 0) {
		if (res_alloc_obj.assignmentrate > lane_schedule_obj.max_rate) return undefined;
		isRateAdjustable = false;
		rate = res_alloc_obj.assignmentrate;
	};
	
	var start_day = slot.day;
	var duration = Math.ceil(res_alloc_obj.remainingdays * (100 / rate));
	var end_day = (start_day + duration) - 1;

	//Go through every day in the duration and make sure any new slots encountered have more amount_free values
	// if the amount_free value is less check for 0 and return or reduce the rate and extend the end date
	for (var cur_day = start_day; cur_day <= end_day; cur_day++) {
		//console.log("Checking day " + cur_day);
		if (typeof(lane_schedule_obj.free_slots[cur_day])!="undefined") {
			if (lane_schedule_obj.free_slots[cur_day].amount_free==0) return;
			if (lane_schedule_obj.free_slots[cur_day].amount_free<rate) {
				if (!isRateAdjustable) return;
				rate = lane_schedule_obj.free_slots[cur_day].amount_free;
				duration = Math.ceil(res_alloc_obj.remainingdays * (100 / rate));
				end_day = (start_day + duration) - 1;
			};
		}
	}
	//console.log("Returning rate of " + rate);
	proposals.push({
		start_day: start_day,
		rate: rate, //allocate full resuorse
		duration: duration,
		end_day: end_day,
		lane: lane_schedule_obj,
		res_alloc_obj: res_alloc_obj,
	});
	return;
}

function component_viewer_res_process_lane_allocate_proposal(proposal_obj) {
	//console.log("Allocate resourse (" + proposal_obj.res_alloc_obj.text + ") to lane " + proposal_obj.lane.obj.uid);
	
	//Assumption - there is always a free slot starting on the start day
	
	//Add object to lanes allocated resourses list
	proposal_obj.lane.allocated_resourses.push({
		start_day: proposal_obj.start_day,
		rate: proposal_obj.rate, //allocate full resuorse
		duration: proposal_obj.duration,
		end_day: proposal_obj.end_day,
		res_alloc_obj: proposal_obj.res_alloc_obj,
	});
	
	//Adjust lanes free_slots array to reflect newly allocated resourse
	//Loop through days affected
	var prev_day_amount_free = 0;
	for (var cur_day = proposal_obj.start_day; cur_day <= proposal_obj.end_day; cur_day++) {
		//console.log(cur_day);
		
		//If we have a freeslot on this day then it needs to be reduced by the value of this duration
		if (typeof(proposal_obj.lane.free_slots[cur_day])!="undefined") {
			//console.log("Reducing for " + cur_day);
			//console.log("Current amount free:" + proposal_obj.lane.free_slots[cur_day].amount_free);
			//console.log("Prop Rate:" + proposal_obj.rate);
			prev_day_amount_free = proposal_obj.lane.free_slots[cur_day].amount_free;
			proposal_obj.lane.free_slots[cur_day].amount_free -= proposal_obj.rate;
			//console.log("Final amount free:" + proposal_obj.lane.free_slots[cur_day].amount_free);
		};
	};
	//Add new freeslot after end day if there was none there (must be value of previously free)
	if (typeof(proposal_obj.lane.free_slots[proposal_obj.end_day + 1])!="undefined") {
		//There is already a record - There was no change to this day so no new record is needed
	} else {
		//There is no record for the end date so we can just set the amount free to the value of the previous day free.
		component_viewer_res_process_init_lane_upsert_free_slot(proposal_obj.lane,proposal_obj.end_day + 1,prev_day_amount_free);
	}
	
	//Sort free slots in order of day not needed as we have used only upsert operation to insert
};
