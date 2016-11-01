"use strict";

function report_error(err) {
	console.log(err);
	alert(err);
	return;
};

function loadDataIntoKanbanComponent() {
	//statusList
	
	var listToLoad = [];
	for (i = 0; i < statusList.length; i++) {
		listToLoad.push({ header:statusList[i], body:{ view:"kanbanlist", status:statusList[i], multiselect: true }});
	}
	kanbancomponent_setList(listToLoad);

	kanbancomponent_resetdata();	
	var sm = ic_soa_data_getSheetList();
	
	for (var cur_sheet = 0; cur_sheet < sm.length; cur_sheet++) {
		var cur_sheet_data = sheet_data[sm[cur_sheet]];
		var data = [];
		if ("EDF"==sm[cur_sheet]) {
			for (cur_do = 0; cur_do < dataObjects.EDFkeys.length; cur_do++) {
				var cur_edf = dataObjects.EDFs[dataObjects.EDFkeys[cur_do]];
				data.push(
					{ 
						id: (1000 * cur_sheet) + cur_edf.uid, 
						text:cur_edf.name, 
						status: cur_edf.status, 
						$css: cur_sheet_data.css_tag, 
						tags: cur_edf.tags, 
						sheet_row: cur_edf.sheet_row,
						sheet_data_item: cur_sheet,
						$order: cur_edf.order,
						view_fn: displayEDF,
						obj: cur_edf,
					}
				);
			};
		} else if ("INT"==sm[cur_sheet]) {
			for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
				var cur_int = dataObjects.INTs[dataObjects.INTkeys[cur_do]];
				data.push(
					{ 
						id: (1000 * cur_sheet) + cur_int.uid, 
						text:cur_int.name, 
						status: cur_int.status, 
						$css: cur_sheet_data.css_tag, 
						tags: cur_int.tags, 
						sheet_row: cur_int.sheet_row,
						sheet_data_item: cur_sheet,
						$order: cur_int.order,
						view_fn: displayINT,
						obj: cur_int,
					}
				);
			};
		} else if ("PRES"==sm[cur_sheet]) {
			for (var cur_do = 0; cur_do < dataObjects.PRESkeys.length; cur_do++) {
				var cur_pres = dataObjects.PRESs[dataObjects.PRESkeys[cur_do]];
				data.push(
					{ 
						id: (1000 * cur_sheet) + cur_pres.uid, 
						text:cur_pres.name, 
						status: cur_pres.status, 
						$css: cur_sheet_data.css_tag, 
						tags: cur_pres.tags, 
						sheet_row: cur_pres.sheet_row,
						sheet_data_item: cur_sheet,
						$order: cur_pres.order,
						view_fn: displayPRES,
						obj: cur_pres,
					}
				);
			};			
		} else if ("POINT"==sm[cur_sheet]) {
			for (var cur_do = 0; cur_do < dataObjects.POINTkeys.length; cur_do++) {
				var cur_point = dataObjects.POINTs[dataObjects.POINTkeys[cur_do]];
				data.push(
					{ 
						id: (1000 * cur_sheet) + cur_point.uid, 
						text:cur_point.name, 
						status: cur_point.status, 
						$css: cur_sheet_data.css_tag, 
						tags: cur_point.tags, 
						sheet_row: cur_point.sheet_row,
						sheet_data_item: cur_sheet,
						$order: cur_point.order,
						view_fn: displayPOINT,
						obj: cur_point,
					}
				);
			};			
		} else {
			console.log("Unknown sheet - " + sm[cur_sheet] + " kanban cards not loaded for this sheet");
		};
		kanbancomponent_appenddata(data);
	} //for cur_sheet	
	
};

function getKANBANHtml() {
	loadDataIntoKanbanComponent();

	var ret = "";
	ret += '<table><tr><td>';
	ret += GetMenu();
	ret += '</td></tr><tr class="main"><td>';
	
	ret += kanbancomponent_create(CB_onAfterDrop,CB_item_dbl_click);
	
	ret += '</td></tr></table>';
	
	return ret;
};

function displayKANBAN() {
	$("#MAIN").html(getKANBANHtml());
	$("#MAIN").css("display","inline");
	//console.log((accessLevel!="READWRITE"));
	kanbancomponent_init((accessLevel!="READWRITE"));
	
};

//Callback from kanban
function CB_item_dbl_click(item_array_pos, data) {
	data[item_array_pos].view_fn(data[item_array_pos].uid)
};

function CB_onAfterDrop(new_status,item_dropped_array_pos,data) {
	//Save the entire list - required as orders will be changed
	board_prepare_saveBatch();
	for (var c=0;c<data.length;c++) {
		var row = data[c];
		if (row.status==new_status) {
			var sheet_data_item = sheet_data[ic_soa_data_getSheetList()[row.sheet_data_item]];
			board_append_saveBatch({
				"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.listcol) + row.sheet_row,
				"majorDimension": "ROWS",
				"values": [
					[row.status]
				],
			});
			board_append_saveBatch({
				"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.indexcol) + row.sheet_row,
				"majorDimension": "ROWS",
				"values": [
					[row.$order]
				],
			});
			/*Tags are not editable
			var tt = row.tags;
			if (typeof(tt)=="undefined") tt = "";
			board_append_saveBatch({
				"range": sheet_data_item.sheet_name + "!" + board_columnToLetter(sheet_data_item.tagscol) + row.sheet_row,
				"majorDimension": "ROWS",
				"values": [
					[row.tt]
				],
			});*/

			//Copy changed data into local object
			row.status=row.status;
			row.$order=row.$order;
		};
		
	};
	
	board_execute_saveBatch(spreadsheetId);
	
};
