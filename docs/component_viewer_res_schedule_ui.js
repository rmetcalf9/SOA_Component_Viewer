"use strict";	

//UI Components for resourse scheduler pages

var component_viewer_res_schedule_ui_globs = {
	select_any_lane_value: "Select Any Lane",
	comp_status_shown: false,
};

function component_viewer_res_schedule_ui_INIT() {
	var formHTML = "";
	formHTML = "<div id=\"component_viewer_res_schedule_ui_add_edit_work\" title=\"Dialog Title\">"
	formHTML += "<table>";
	formHTML += "<tr><th>Text:</th><td colspan=\"2\">";
	formHTML += "<input class=\"text\" type=\"text\"/ size=\"50\">";
	formHTML += "</td></tr>";
	formHTML += "<tr><th>Work description:</th><td colspan=\"2\">";
	formHTML += "<input class=\"description\" type=\"text\"/ size=\"50\">";
	formHTML += "</td></tr>";
	formHTML += "<tr><th>Lane:</th><td>";
	formHTML += "<select class=\"lane\" >";
	formHTML += "<option value=\"" + component_viewer_res_schedule_ui_globs.select_any_lane_value + "\">Select Any Lany</option>";
	for (var cur_do = 0; cur_do < dataObjects.RESOURCELANESkeys.length; cur_do++) {
		var res_lane_obj = dataObjects.RESOURCELANESs[dataObjects.RESOURCELANESkeys[cur_do]];
		formHTML += "<option value=\"" + res_lane_obj.uid + "\">" + res_lane_obj.uid + "</option>";
	};
	formHTML += "</select></td><td>Assign to a particular lane unless \"Select Any Lane\" is used";
	formHTML += "</td></tr>";
	formHTML += "<tr><th>Rate:</th><td>";
	formHTML += "<input class=\"rate\" type=\"text\" size=\"10\"/><td>(Precentage - If blank rate will expand to fill lane)</td>";
	formHTML += "</td></tr>";
	formHTML += "<tr><th>Remaining Days:</th><td>";
	formHTML += "<input class=\"remain\" type=\"text\" size=\"10\"/><td>(How many days development remaining assuming 1 person assigned 100% of time)</td>";
	formHTML += "</td></tr>";
	formHTML += "<tr><th>Bin Pack Priority:</th><td>";
	formHTML += "<input class=\"binpack\" type=\"text\" size=\"10\"/><td>Low numbers are allocated before high numbers.</td>";
	formHTML += "</td></tr>";
	formHTML += "<tr><th>Component Status:</th><td>";
	formHTML += "<select class=\"comp_status\" >";
	for (i = 0; i < statusList.length; i++) {
		formHTML += "<option value=\"" + statusList[i] + "\">" + statusList[i] + "</option>";
	};
	formHTML += "</select>";
	formHTML += "</td></tr>";
	formHTML += "<tr><th>Effective Tags:</th><td>";
	formHTML += "<div class=\"efftags\"></div><td>Tags assigned to the component, or the task associated with that component.</td>";
	formHTML += "</td></tr>";
	formHTML += "</table>";
	formHTML += "</div>"
	
	
	$("body").append(formHTML);		
	$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog({
		autoOpen: false,
		width: 800,
		modal: true,
	});
	
};

function component_viewer_res_schedule_ui_addedit_isopen() {
	if ($("#component_viewer_res_schedule_ui_add_edit_work").dialog( "isOpen" )==true) return true;
	return false;
}

var component_viewer_res_schedule_ui_component_tagarray = []; //Will never change
var component_viewer_res_schedule_ui_resource_tagarray = [];

function component_viewer_res_schedule_ui_geteffectivetagarray() {
	var ret = component_viewer_res_schedule_ui_component_tagarray.concat(component_viewer_res_schedule_ui_resource_tagarray);
	ret = ret.filter(function (item, pos) {
		if (item.length == 0) return false;
		return ret.indexOf(item) == pos;
	});
	return ret;
}

function component_viewer_res_schedule_ui_addedit(
	edit_mode, //true for edit, false for add new workitem
	default_value_obj, //Object of default values:
						// text, lane, rate, remain, binpack
	passback,
	ok_fn_callback,
	complete_fn_callback,
	comp_status_val, //Pass undefined if this item dosen't have a component
	component_tag_array, //Array of components parent tags
	default_tag_array //Array of default tags for this resourse object
) {
	if (typeof(component_tag_array) == "undefined") console.log('CODE ERROR component_viewer_res_schedule_ui_addedit needs component array param');
	if (typeof(default_tag_array) == "undefined") console.log('CODE ERROR component_viewer_res_schedule_ui_addedit needs resource array param');
	component_viewer_res_schedule_ui_component_tagarray = component_tag_array;
	component_viewer_res_schedule_ui_resource_tagarray = default_tag_array;
	
	if (component_viewer_res_schedule_ui_addedit_isopen()==true) {
		alert("ERROR in component_viewer_res_schedule_ui_addedit SECOND DIALOG LAUNCHED - " + str);
		return;
	};
	
	//Populate dialog objects with values
	if (typeof(default_value_obj.lane)=="undefined") default_value_obj.lane=null;
	if (default_value_obj.lane == "") default_value_obj.lane=null;
	if (default_value_obj.lane == null) default_value_obj.lane=component_viewer_res_schedule_ui_globs.select_any_lane_value;

	if (default_value_obj.rate==0) default_value_obj.rate="";
	$("#component_viewer_res_schedule_ui_add_edit_work input.text").val(default_value_obj.text);
	$("#component_viewer_res_schedule_ui_add_edit_work input.description").val(default_value_obj.description);
	$("#component_viewer_res_schedule_ui_add_edit_work select.lane").val(default_value_obj.lane);
	$("#component_viewer_res_schedule_ui_add_edit_work input.rate").val(default_value_obj.rate);
	$("#component_viewer_res_schedule_ui_add_edit_work input.remain").val(default_value_obj.remain);
	$("#component_viewer_res_schedule_ui_add_edit_work input.binpack").val(default_value_obj.binpack);
	$("#component_viewer_res_schedule_ui_add_edit_work div.efftags").text(
		component_viewer_res_schedule_ui_geteffectivetagarray().reduce(function (sofar,val) {
			if (sofar.length == 0) return val; 
			return sofar + ", " +  val
		}, "")
	);
	
	if (typeof(comp_status_val)=="undefined") {
		component_viewer_res_schedule_ui_globs.comp_status_shown = false;
		$("#component_viewer_res_schedule_ui_add_edit_work select.comp_status").closest("tr").hide();
	} else {
		if (statusList.indexOf(comp_status_val)==-1) {
			console.log("ERROR Invalid component status value " + comp_status_val);
		};
		component_viewer_res_schedule_ui_globs.comp_status_shown = true;
		$("#component_viewer_res_schedule_ui_add_edit_work select.comp_status").closest("tr").show();
		$("#component_viewer_res_schedule_ui_add_edit_work select.comp_status").val(comp_status_val);
	};
	
	var buts = [];
	
	
	buts.push({
		text: "Ok",
		click: function() {$( this ).dialog( "close" );ok_fn_callback(component_viewer_res_schedule_ui_addedit_readresult(),passback);}
	});
	if (edit_mode) {
		$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog('option', 'title', "Edit ResourceAllocation");
		buts.push({
			text: "Mark Complete",
			click: function() {$( this ).dialog( "close" );complete_fn_callback(component_viewer_res_schedule_ui_addedit_readresult(),passback);}
		});
	} else {
		$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog('option', 'title', "Create ResourceAllocation");
	};
	buts.push({
		text: "Cancel",
		click: function() {$( this ).dialog( "close" );}
	});
	
	$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog('option', 'buttons', buts);
	$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog( "open" );
	
}
function component_viewer_res_schedule_ui_addedit_readresult() {
	var lane = $("#component_viewer_res_schedule_ui_add_edit_work select.lane").val();
	if (lane==component_viewer_res_schedule_ui_globs.select_any_lane_value) lane=null;	
	
	var ret_obj = {
		text: $("#component_viewer_res_schedule_ui_add_edit_work input.text").val(),
		description: $("#component_viewer_res_schedule_ui_add_edit_work input.description").val(),
		lane: lane,
		rate: $("#component_viewer_res_schedule_ui_add_edit_work input.rate").val(),
		remain: $("#component_viewer_res_schedule_ui_add_edit_work input.remain").val(),
		binpack: $("#component_viewer_res_schedule_ui_add_edit_work input.binpack").val(),
		restagarray: component_viewer_res_schedule_ui_resource_tagarray, //component tag array can't be changed so no point in including it
	};
	
	if (component_viewer_res_schedule_ui_globs.comp_status_shown) {
		ret_obj.comp_status = $("#component_viewer_res_schedule_ui_add_edit_work select.comp_status").val();
	};
	
	return ret_obj;
};

// Helper function for code that is called after edit complets
function component_viewer_res_schedule_ui_addedit_commonpost(complete_pressed, result_obj, pb, postScheduleNotifyFN) {
	if (complete_pressed) result_obj.remain = 0;
	
	//Lane will be returned as null for ANY lane
	
	result_obj = component_viewer_res_schedule_board_common_validation(result_obj);
	if (typeof(result_obj)=="undefined") return;

	var change_comp_status = undefined;
	if (typeof(pb.orig_comp_status)!="undefined") {
		if (typeof(result_obj.comp_status)!="undefined") {
			if (pb.orig_comp_status!=result_obj.comp_status) {
				change_comp_status = {
					new_status: result_obj.comp_status,
				};
			};
		};
	};

	component_viewer_res_data_edit_estimate(pb.uid, result_obj, change_comp_status);
	
	component_viewer_res_process_ScheduleResourses(postScheduleNotifyFN);
}

function component_viewer_res_schedule_ui_new_commonpost(result_obj, postScheduleNotifyFN) {
	result_obj = component_viewer_res_schedule_board_common_validation(result_obj);
	if (typeof(result_obj)=="undefined") return;

	//remain must be gt 0
	if (result_obj.remain<1) {
		rjmlib_ui_questionbox("You must enter a number of days for this new item");
		return undefined;
	}
	
	component_viewer_res_data_create_unlinked_estimate(result_obj);
	
	component_viewer_res_process_ScheduleResourses(postScheduleNotifyFN);
}

