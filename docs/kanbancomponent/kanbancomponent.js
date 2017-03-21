"use strict";

/*
Kan Ban Component created by Robert Metcalf

- requires JQuery
*/

var kanbancomponent_chart_obj = {
	list: [],
	data: [],
	tag_list: [],
	readonly: false
};

/*
Setup the list to use
*/
function kanbancomponent_setList(list) {
	kanbancomponent_chart_obj.list = list;	
};

/*
Setup the data
*/
function kanbancomponent_resetdata() {
	kanbancomponent_chart_obj.data = [];
};
function kanbancomponent_appenddata(data_to_append) {
	Array.prototype.push.apply(kanbancomponent_chart_obj.data,data_to_append);
};

function knabancomponent_getcardHTML_tagdivcontents(data_row_and_pos, inc_edit_icon) {
	if (kanbancomponent_chart_obj.readonly) {
		if (typeof(data_row_and_pos.data_obj.tags)=="undefined") {
			return "";
		};
		return data_row_and_pos.data_obj.tags;
	};
	var html = "";

	if (typeof(data_row_and_pos.data_obj.tags)!="undefined") {
		html += data_row_and_pos.data_obj.tags;
	};

	if (inc_edit_icon) {
		html += '<span class="ui-icon ui-icon-pencil" id="kanbancomponent_edittag"></span>';
	};
	return html;
};

function knabancomponent_getcardHTML(data_row_and_pos,inc_edit_icon) {
	if (typeof(inc_edit_icon)=="undefined") inc_edit_icon = true;

	var html = "";
	html += '<div class="card ' + data_row_and_pos.data_obj.$css + '" data-data_pos="' + data_row_and_pos.data_pos + '">';
	html += data_row_and_pos.data_obj.text;

	if ((!kanbancomponent_chart_obj.readonly) || (typeof(data_row_and_pos.data_obj.tags)!="undefined")) {
		html += '<hr>';
	}

	html += '<div class="tag">';
	html += knabancomponent_getcardHTML_tagdivcontents(data_row_and_pos, inc_edit_icon);
	html += '</div>';
	
	
	//html += ' (ORDER=' + data_row_and_pos.$order + ')'; //DEBUG LINE TO DISPLAY ORDER
	html += '</div>';
	return html;
};

function kanbancomponent_getCardsForList(listName) {
	var res = [];
	
	for (var i=0; i<kanbancomponent_chart_obj.data.length; i++) {
		if (kanbancomponent_chart_obj.data[i].status==listName) {
			res.push({data_pos:i, data_obj: kanbancomponent_chart_obj.data[i]});
		};
	};
	
	res.sort(function(a,b){
		if (a.data_obj.$order<b.data_obj.$order) return -1;
		if (a.data_obj.$order>b.data_obj.$order) return 1;
		return 0;
	});
	
	return res;
};

//Called in create function to populate undefined orders and change their types to int
function kanbancomponent_cleanOrders() {
	var default_order = 9999;
	for (var c=0;c<kanbancomponent_chart_obj.data.length;c++) {
		if (typeof(kanbancomponent_chart_obj.data[c].$order)=="undefined") {
			kanbancomponent_chart_obj.data[c].$order = default_order;
		} else {
			kanbancomponent_chart_obj.data[c].$order = parseInt(kanbancomponent_chart_obj.data[c].$order);
			if(isNaN(kanbancomponent_chart_obj.data[c].$order)) {
				kanbancomponent_chart_obj.data[c].$order = default_order;
			} else {
				if (typeof(kanbancomponent_chart_obj.data[c].$order)=="undefined") {
					kanbancomponent_chart_obj.data[c].$order = default_order;
				};
			};
		};
	};
}

//Main function called to create kanban component. output is HTML
// limited to one component per page
function kanbancomponent_create(onAfterDrop, onListItemDblClick, onChangedTags) {
	var html = "";
	kanbancomponent_chart_obj.onAfterDrop = onAfterDrop;
	kanbancomponent_chart_obj.onListItemDblClick = onListItemDblClick;
	kanbancomponent_chart_obj.onChangedTags = onChangedTags;
	
	kanbancomponent_cleanOrders();
	
	html += '<table class="kanbancomponent">';
	html += '<tr class="headrow">';
	for (var i = 0; i < kanbancomponent_chart_obj.list.length; i++) {
		html += '<th>' + kanbancomponent_chart_obj.list[i].header + '</th>';
	};
	html += '</tr><tr class="mainrow">';
	//ROWS
	for (var i = 0; i < kanbancomponent_chart_obj.list.length; i++) {
		html += '<td data-status="' + kanbancomponent_chart_obj.list[i].header + '">';
		var cl = kanbancomponent_getCardsForList(kanbancomponent_chart_obj.list[i].header);
		for (var j = 0; j < cl.length; j++) {
			html += knabancomponent_getcardHTML(cl[j]);
		};
		html += '</td>';
	};
	html += '</tr>';
	html += '</table>';
	
	return html;
}

//Given a comma seperated list of tags add items to the tag list
//if they are not already there
function kanbancomponent_buildtaglist_tag(comma_seperated_tag_list, outputTagList) {
	if (typeof(comma_seperated_tag_list)!="undefined") {
		comma_seperated_tag_list=comma_seperated_tag_list.trim();
		if (comma_seperated_tag_list.length>0) {
			var tags = comma_seperated_tag_list.split(",");
			for (var i=0;i<tags.length;i++) {
				if (typeof(tags[i])!="undefined") {
					var tag = tags[i].trim();
					if (tag!="") {
						if (typeof(outputTagList[tag])=="undefined") {
							outputTagList[tag] = tag;
						};
					};
				};
			};
		};
	};
};

//Called when we want more tags in option buttons than are in our component
function kanbancomponent_buildtaglist_append(comma_seperated_tag_list) {
	kanbancomponent_buildtaglist_tag(comma_seperated_tag_list,kanbancomponent_chart_obj.tag_list)
};

//Called as part of init to build the internal tag list
//kanbancomponent_chart_obj.tag_list
function kanbancomponent_buildtaglist() {
	for (var i=0; i<kanbancomponent_chart_obj.data.length; i++) {
		if (typeof(kanbancomponent_chart_obj.data[i].tags)!="undefined") {
			if (kanbancomponent_chart_obj.data[i].tags.trim()!="") {
				kanbancomponent_buildtaglist_tag(kanbancomponent_chart_obj.data[i].tags, kanbancomponent_chart_obj.tag_list);
			};
		};
	};
};

//called after html is in document
function kanbancomponent_init(readonly) {
	if (typeof(readonly)=="undefined") readonly=false;
	kanbancomponent_chart_obj.readonly = readonly;

	kanbancomponent_buildtaglist();
	
	//Example of iterating through tag list
	//for (var j in kanbancomponent_chart_obj.tag_list) {
	//	console.log(j);
	//};
	
	//Set all table widths high so they all end up with the same width
	$("table.kanbancomponent tr.headrow th").width(10000);
	
	if (!kanbancomponent_chart_obj.readonly) {
		$("table.kanbancomponent tr.mainrow td ").sortable({
			start: function() {
				$("table.kanbancomponent tr.mainrow td ").removeClass('ui-state-active');
				$(this).addClass('ui-state-active');
			},
			over: function() {
				$("table.kanbancomponent tr.mainrow td ").removeClass('ui-state-active');
				$(this).addClass('ui-state-active');
			},
			stop: function(event, ui) {
				$("table.kanbancomponent tr.mainrow td ").removeClass('ui-state-active');

				var data_item_being_dropped_pos = $(ui.item[0]).data("data_pos");
				var data_item_being_dropped = kanbancomponent_chart_obj.data[data_item_being_dropped_pos];

				var column_being_droped_into = $(ui.item[0].closest("td"));

				var orig_status = $($(this)[0]).data("status");
				var new_Status = column_being_droped_into.data("status");

				var changed = false;
				if (orig_status!=new_Status) {
					changed = true;
					//Change data item status
					data_item_being_dropped.status = new_Status;
				};
			
				//Go through new status column and set the order property of each item
				var cards_in_new_list = column_being_droped_into.find("div.card");
				for (var i=0;i<cards_in_new_list.length;i++) {
					var data_item = kanbancomponent_chart_obj.data[$(cards_in_new_list[i]).data("data_pos")];
					if (data_item.$order!=i) {
						changed = true;
						data_item.$order=i;
						//console.log(data_item.text + " " + data_item.$order);
					};
				};

				if (changed) {
					if (typeof(kanbancomponent_chart_obj.onAfterDrop)!="undefined") {
						kanbancomponent_chart_obj.onAfterDrop(new_Status,data_item_being_dropped_pos,kanbancomponent_chart_obj.data);
					}
				};
			
			},
			connectWith: "table.kanbancomponent tr.mainrow td"
		});
		
		$(document).on('click.kanbancomponent', "#kanbancomponent_edittag", function (event) {
			var data_item_pos = $(this).closest("div.card").data("data_pos");
			var data_item = kanbancomponent_chart_obj.data[data_item_pos];
			
			var this_items_taglist_arr = [];
			kanbancomponent_buildtaglist_tag(data_item.tags, this_items_taglist_arr);

			var listOfCheckboxes = [];
			for (var j in kanbancomponent_chart_obj.tag_list) {
				var selectedd = true;
				if (typeof(this_items_taglist_arr[j])=="undefined") selectedd = false;
				listOfCheckboxes.push({
					text: j,
					selected: selectedd
				});
			};

			
			rjmlib_ui_multicheckboxinputbox(
				listOfCheckboxes, //List of check boxes
				"Select tags to use", //prompt, 
				"Edit Tags for " + data_item.text, //title, 
				[
					{
						id: "ok",
						text: "OK",
						fn: function (butID,new_list_of_checks,data_item_pos) {
							var data_item = kanbancomponent_chart_obj.data[data_item_pos];
							//rjmlib_ui_questionbox("Tags for " + data_item.text + " updated to " + new_value + ".");
							
							var orig_tag_value = data_item.tags;
							var new_value = "";
							var number_added = 0;
							for (var curCheckIdx in new_list_of_checks) {
								if (new_list_of_checks[curCheckIdx].selected) {
									if (number_added>0) new_value += ","; //No spaces between items
									new_value += new_list_of_checks[curCheckIdx].text;
									number_added++;
								};
							};
							
							//Output strings should always be in same order
							new_value = new_value.split(",").sort().join(",")
							
							if (orig_tag_value==new_value) return;
							
							data_item.tags = new_value;
							
							//ensure internal list of tags is up to date
							kanbancomponent_buildtaglist_tag(new_value, kanbancomponent_chart_obj.tag_list);
							
							//update the displayed card html
							var card_html = knabancomponent_getcardHTML_tagdivcontents({data_pos:data_item_pos, data_obj:data_item});
							$("div.card[data-data_pos=" + data_item_pos + "] div.tag").html(card_html);
							
							if (typeof(kanbancomponent_chart_obj.onChangedTags)!="undefined") {
								kanbancomponent_chart_obj.onChangedTags(data_item_pos,kanbancomponent_chart_obj.data);
							};
							
						}
					},
					{
						id: "cancel",
						text: "Cancel",
						fn: function (butID,new_list_of_checks,data_item_pos) {
							//Cancel - do nothing
						}
					}
				], //buts, 
				data_item_pos, //passback
				"New Tag"
			);			
			//console.log(data_item);
			event.preventDefault();
		});		
		
	}; //if !readonly

	$(document).on('dblclick.kanbancomponent', "table.kanbancomponent tr.mainrow td div.card", function (event) {
		if (typeof(kanbancomponent_chart_obj.onListItemDblClick)!="undefined") {
			kanbancomponent_chart_obj.onListItemDblClick($($(this)[0]).data("data_pos"),kanbancomponent_chart_obj.data);
		};
		event.preventDefault();
	});
	
};


function kanbancomponent_getcolumn_html() {
	var html = "";
	return html;
};
