"use strict";

//Taken from second answer to https://stackoverflow.com/questions/3160277/jquery-table-sort
// https://jsfiddle.net/Zhd2X/20/

var rjmlib_ui_table_data = {
	unique_class_num: 0,
	table_data: [],
};


function rjmlib_ui_table_init() {
	$(document).off('click.rjmlib_ui_table_init').on('click.rjmlib_ui_table_init', "table.rjmlib_ui_table_init_setup > tbody > tr > th", function (event) {
		
		var table = $(this).parents('table').eq(0)
		var rows = table.find('tr:gt(0)').toArray().sort(rjmlib_ui_table_comparer($(this).index()))
		this.asc = !this.asc
		if (!this.asc){rows = rows.reverse()}
		for (var i = 0; i < rows.length; i++){table.append(rows[i])}		
		
		event.preventDefault();
	});

};

//When passed a JQuery search for table tags adds javascript texts to make the table sortable by
//clicking on the headings.
//Table must be of the format 
// Top row = headings (<th>)
// All other rows = Data (<td>)
function rjmlib_ui_table_make_tables_sortable(jquery_search_for_table_element) {
	
	var tables_to_make_sortable = $(jquery_search_for_table_element);
	for (var cur=0; cur<tables_to_make_sortable.length; cur++) {
		rjmlib_ui_table_make_table_sortable($(tables_to_make_sortable[cur]));
	};
}

function rjmlib_ui_table_make_table_sortable(jquery_table_obj) {
	//console.log(jquery_table_obj);
	
	if (!jquery_table_obj.hasClass("rjmlib_ui_table_init_setup")) {
		jquery_table_obj.addClass("rjmlib_ui_table_init_setup");
	};
};

function rjmlib_ui_table_comparer(index) {
    return function(a, b) {
        var valA = rjmlib_ui_table_getCellValue(a, index), valB = rjmlib_ui_table_getCellValue(b, index)
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
    }
}
function rjmlib_ui_table_getCellValue(row, index){ return $(row).children('td').eq(index).html() }

function rjmlib_ui_table_selectTableForCopy(tbl_obj) {
	var el = tbl_obj[0];
	var body = document.body, range, sel;
	if (document.createRange && window.getSelection) {
		range = document.createRange();
		sel = window.getSelection();
		sel.removeAllRanges();
		try {
			range.selectNodeContents(el);
			sel.addRange(range);
		} catch (e) {
			range.selectNode(el);
			sel.addRange(range);
		}
	} else if (body.createTextRange) {
		range = body.createTextRange();
		range.moveToElementText(el);
		range.select();
	}	
};
