"use strict";	

//Code and dataobjects for the resourse allocation process

var component_viewer_res_process_resourse_schedules = {};

function component_viewer_res_process_ScheduleResourses() {

	//console.log("TODO Sort resourse allocaitons by priority asc");
	dataObjects.RESOURCEALLOCATIONkeys = dataObjects.RESOURCEALLOCATIONkeys.sort(function (ak,bk) {
		if (dataObjects.RESOURCEALLOCATIONs[ak].binpackpriority==dataObjects.RESOURCEALLOCATIONs[bk].binpackpriority) return 0;
		if (dataObjects.RESOURCEALLOCATIONs[ak].binpackpriority<dataObjects.RESOURCEALLOCATIONs[bk].binpackpriority) return -1;
		return 1;
	});
	/*
	for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
		var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
		console.log(res_alloc_obj.text + " " + res_alloc_obj.binpackpriority);
	};*/
	
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

	//console.log("TODO Clear all current scheduled allocations");
	component_viewer_res_process_resourse_schedules = {
		Lanes: [],
	};
	
	//Init the Lanes
	for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
		var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
		component_viewer_res_process_init_lane(res_lane_obj);
	}
	

	//console.log("TODO Go through ResoueseAllocaitons in order and schedule each one");
	for (var cur_do = 0; cur_do < dataObjects.RESOURCEALLOCATIONkeys.length; cur_do++) {
		var res_alloc_obj = dataObjects.RESOURCEALLOCATIONs[dataObjects.RESOURCEALLOCATIONkeys[cur_do]];
		
		//Step 1 decide which lane to allocate this resourse to
		var schedule_proposal_obj = undefined;
		//TODO Code for pre-allocated resourses
		schedule_proposal_obj = component_viewer_res_process_find_best_lane_for_object(res_alloc_obj);
		
		
		//Step 2 allocate resourse to this lane
		if (typeof(schedule_proposal_obj)=="undefined") {
			console.log("WARNING - Failed to schedule " + res_alloc_obj.text + " (Try lowering it's rate)");
		} else {
			component_viewer_res_process_lane_allocate_proposal(schedule_proposal_obj);
		};
		
	};
	
	
	//DEBUG output the results so I can inspect
	console.log(component_viewer_res_process_resourse_schedules);
};

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
	for (var lane_schedule in component_viewer_res_process_resourse_schedules.Lanes) {
		proposals.push(
			component_viewer_res_process_lane_make_proposal(component_viewer_res_process_resourse_schedules.Lanes[lane_schedule], res_alloc_obj)
		);
	};
	
	//Find proposal with lowest end day
	var lowest_end_day = 9999999;
	for (var proposal in proposals) {
		var proposal_obj = proposals[proposal];
		if (proposal_obj.end_day < lowest_end_day) {
			ret = proposal_obj;
			lowest_end_day = proposal_obj.end_day;
		};
	};
	
	return ret;
};

function component_viewer_res_process_lane_make_proposal(lane_schedule_obj, res_alloc_obj) {
	//We will use the rule that we will start this task as soon as possible and use the maximum
	// rate availiable at the time it is started
	
	//Freeslots are indexed by day
	var c = 0;
	var first_nonzero_free_slot = lane_schedule_obj.free_slots[lane_schedule_obj.free_slots_idx[c]];
	while (first_nonzero_free_slot.amount_free==0) {
		c = c + 1;
		first_nonzero_free_slot = lane_schedule_obj.free_slots[lane_schedule_obj.free_slots_idx[c]];
	};
	
	var rate = first_nonzero_free_slot.amount_free;
	var start_day = first_nonzero_free_slot.day;
	var duration = Math.ceil(res_alloc_obj.remainingdays * (100 / rate));
	var end_day = (start_day + duration) - 1;

	//console.log("r/s/d/e=" + rate + "/" + start_day + "/" + duration + "/" + end_day);
	
	return {
		start_day: start_day,
		rate: rate, //allocate full resuorse
		end_day: end_day,
		lane: lane_schedule_obj,
		res_alloc_obj: res_alloc_obj,
	};
};

function component_viewer_res_process_lane_allocate_proposal(proposal_obj) {
	console.log("Allocate resourse (" + proposal_obj.res_alloc_obj.text + ") to lane " + proposal_obj.lane.obj.uid);
	
	//Assumption - there is always a free slot starting on the start day
	
	//Add object to lanes allocated resourses list
	proposal_obj.lane.allocated_resourses.push({
		start_day: proposal_obj.start_day,
		rate: proposal_obj.rate, //allocate full resuorse
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
	component_viewer_res_process_init_lane_upsert_free_slot(proposal_obj.lane,proposal_obj.end_day + 1,prev_day_amount_free);
	
	//Sort free slots in order of day
	console.log("TODO Sort Free Slots");
	
};
