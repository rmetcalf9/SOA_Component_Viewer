"use strict";	

//UI Components for resourse scheduler pages

var component_viewer_res_schedule_ui_globs = {
};

function component_viewer_res_schedule_ui_INIT() {
	var formHTML = "";
	formHTML = "<div id=\"component_viewer_res_schedule_ui_add_edit_work\" title=\"Dialog Title\">"
	formHTML += "<p>Prompt...</p><br><textarea cols=80 rows=15></textarea>";
	formHTML += "</div>"
	
	
	$("body").append(formHTML);		
	$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog({
		autoOpen: false,
		width: 800
	});
	
};

function component_viewer_res_schedule_ui_addedit_isopen() {
	if ($("#component_viewer_res_schedule_ui_add_edit_work").dialog( "isOpen" )==true) return true;
	return false;
}
	
function component_viewer_res_schedule_ui_addedit(
	edit_mode //true for edit, false for add new workitem
) {
	if (component_viewer_res_schedule_ui_addedit_isopen()==true) {
		alert("ERROR in component_viewer_res_schedule_ui_addedit SECOND DIALOG LAUNCHED - " + str);
		return;
	};
	
	if (edit_mode) {
		$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog('option', 'title', "Edit ResourceAllocation");
	} else {
		$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog('option', 'title', "Create ResourceAllocation");
	};
	
	$( "#component_viewer_res_schedule_ui_add_edit_work" ).dialog( "open" );
	
}
	
