"use strict";	

//UI Components for resourse scheduler pages

var component_viewer_res_schedule_ui_globs = {
	select_any_lane_value: "Select Any Lane",
};

function component_viewer_res_schedule_ui_INIT() {
	var formHTML = "";
	formHTML = "<div id=\"component_viewer_res_schedule_ui_add_edit_work\" title=\"Dialog Title\">"
	formHTML += "<table>";
	formHTML += "<tr><th>Text:</th><td colspan=\"2\">";
	formHTML += "<input class=\"text\" type=\"text\"/ size=\"50\">";
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
	
function component_viewer_res_schedule_ui_addedit(
	edit_mode, //true for edit, false for add new workitem
	default_value_obj, //Object of default values:
						// text, lane, rate, remain, binpack
	passback,
	ok_fn_callback,
	complete_fn_callback
) {
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
	$("#component_viewer_res_schedule_ui_add_edit_work select.lane").val(default_value_obj.lane);
	$("#component_viewer_res_schedule_ui_add_edit_work input.rate").val(default_value_obj.rate);
	$("#component_viewer_res_schedule_ui_add_edit_work input.remain").val(default_value_obj.remain);
	$("#component_viewer_res_schedule_ui_add_edit_work input.binpack").val(default_value_obj.binpack);
	
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
	return {
		text: $("#component_viewer_res_schedule_ui_add_edit_work input.text").val(),
		lane: lane,
		rate: $("#component_viewer_res_schedule_ui_add_edit_work input.rate").val(),
		remain: $("#component_viewer_res_schedule_ui_add_edit_work input.remain").val(),
		binpack: $("#component_viewer_res_schedule_ui_add_edit_work input.binpack").val(),
	};
};

	
