"use strict";	

function getNOPARAMHtml() {
	var ret = "";
	
	ret += "<table><tr>";
	ret += "<td colspan=\"5\">";
	ret += GetMenu();
	ret += "<h1>Component Viewer</h1>";
	ret += "</td></tr><tr class=\"main\">";

	ret += "<td valign=\"top\"><h2>Systems</h1>";
	ret += "<ul>";
	for (var cur_do = 0; cur_do < dataObjects.SYSTEMkeys.length; cur_do++) {
		var cur_sys = dataObjects.SYSTEMs[dataObjects.SYSTEMkeys[cur_do]];
		ret += "<li><a href=\"javascript:displaySYSTEM('" + cur_sys.name + "');\">" + cur_sys.name + "</a></li>";
	}
	ret += "</ul></td>";

	ret += "<td valign=\"top\"><h2>EDFs</h1>";
	ret += "<ul>";
	for (var cur_do = 0; cur_do < dataObjects.EDFkeys.length; cur_do++) {
		var cur_edf = dataObjects.EDFs[dataObjects.EDFkeys[cur_do]];
		ret += "<li><a href=\"javascript:displayEDF('" + cur_edf.uid + "')\">" + cur_edf.name + "</a></li>";
	}
	ret += "</ul></td>";

	ret += "<td valign=\"top\"><h2>Integrations</h1>";
	ret += "<ul>";
	for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
		var cur_int = dataObjects.INTs[dataObjects.INTkeys[cur_do]];
		ret += "<li><a href=\"javascript:displayINT('" + cur_int.uid + "')\">" + cur_int.name + "</a></li>";
	}
	ret += "</ul></td>";

	ret += "<td valign=\"top\"><h2>Presentation Services</h1>";
	ret += "<ul>";
	for (var cur_do = 0; cur_do < dataObjects.PRESkeys.length; cur_do++) {
		var cur_int = dataObjects.PRESs[dataObjects.PRESkeys[cur_do]];
		ret += "<li><a href=\"javascript:displayPRES('" + cur_int.uid + "')\">" + cur_int.name + "</a></li>";
	}
	ret += "</ul></td>";

	ret += "<td valign=\"top\"><h2>Point 2 Point Integrations</h1>";
	ret += "<ul>";
	for (var cur_do = 0; cur_do < dataObjects.POINTkeys.length; cur_do++) {
		var cur_p2p = dataObjects.POINTs[dataObjects.POINTkeys[cur_do]];
		ret += "<li><a href=\"javascript:displayPOINT('" + cur_p2p.uid + "')\">" + cur_p2p.name + "</a></li>";
	}
	ret += "</ul></td>";

	ret += "<tr>";
	ret += "<td colspan=5>";

	ret += "<br>"
	ret += "<br><b>Tags:</b>"
	for (var key in dataObjects.TAGs) {
		ret += " <a href=\"javascript:component_viewer_tags_display('" + key + "')\">" + key + "</a>";
		ret += ", ";
	}
	ret += "<br>"
	
	ret += "</td></tr>";

	ret += "<tr>";
	ret += "<td colspan=5>";

	ret += "<br><h1>Components in development (or planned) grouped by TAG</h1>"
	ret += componentsGroupedByTagTable(displayItemDevelopmentState);

	ret += "</td></tr>";
	ret += "<tr>";
	ret += "<td colspan=5>";


	ret += "<br><h1>Components grouped by TAG</h1>";
	ret += "<p>NEW Excluded, status' excluded='In UAT', 'In Support', 'Abandoned'</p>"
	ret += componentsGroupedByTagTable(displayItemAnyState);

	ret += "</td>";
	ret += "</tr>";

	
	ret += "</tr>";
	ret += "</table>";
	return ret;
};

function componentsGroupedByTagTable(filterFN) {
	var ret = "";
	
	var colHTML = [];
	var sm = ic_soa_data_getSheetMetrics();
	
	ret += "<table class=\"kanbancomponent\"><tr>";
	for (var key in dataObjects.TAGs) {
		colHTML[key] = displayItemsWithTag(key,sm, filterFN);
		if (colHTML[key] != "") ret += "<th>" + key + "</th>"; 
	};
	ret += "</tr><tr>";

	for (var key in dataObjects.TAGs) {
		if (colHTML[key] != "") {
			ret += "<td valign=\"top\">";
			ret += colHTML[key];
			ret += "</td>";
		}
	};
	ret += "</tr></table>";

	return ret;
}

function displayItemAnyState(tag, item) {
	if (ic_soa_data_istaginlist(tag, item.tags)) return true;
	return false;
}
function displayItemDevelopmentState(tag, item) {
	if (item.status=="In UAT") return false;
	if (item.status=="In Support") return false;
	if (item.status=="In Abandoned") return false;
	
	if (tag==="NEW") return false;
	return displayItemAnyState(tag,item);
}

function displayItemsWithTag(tag,sm, filterFN) {
	var ret = "";
	//Complete misuse of this funciton
	for (cur_do = 0; cur_do < dataObjects.EDFkeys.length; cur_do++) {
		var cur = dataObjects.EDFs[dataObjects.EDFkeys[cur_do]];
		if (filterFN(tag, cur)) {
			ret += knabancomponent_getcardHTML({
				data_obj: {
					$css: sm["EDF"].css_tag,
					text: "<a href=\"javascript:displayEDF('" + cur.uid + "')\">" + cur.name + "</a>",
					tags: cur.tags,
					statusX: cur.status,
				},
				data_pos: -1,
			},false);
		};
	}
	for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
		var cur = dataObjects.INTs[dataObjects.INTkeys[cur_do]];
		if (filterFN(tag, cur)) {
			ret += knabancomponent_getcardHTML({
				data_obj: {
					$css: sm["INT"].css_tag,
					text: "<a href=\"javascript:displayINT('" + cur.uid + "')\">" + cur.name + "</a>",
					tags: cur.tags,
					statusX: cur.status,
				},
				data_pos: -1,
			},false);
		};
	}
	for (var cur_do = 0; cur_do < dataObjects.PRESkeys.length; cur_do++) {
		var cur = dataObjects.PRESs[dataObjects.PRESkeys[cur_do]];
		if (filterFN(tag, cur)) {
			ret += knabancomponent_getcardHTML({
				data_obj: {
					$css: sm["PRES"].css_tag,
					text: "<a href=\"javascript:displayPRES('" + cur.uid + "')\">" + cur.name + "</a>",
					tags: cur.tags,
					statusX: cur.status,
				},
				data_pos: -1,
			},false);
		};
	}
	for (var cur_do = 0; cur_do < dataObjects.POINTkeys.length; cur_do++) {
		var cur = dataObjects.POINTs[dataObjects.POINTkeys[cur_do]];
		if (filterFN(tag, cur)) {
			ret += knabancomponent_getcardHTML({
				data_obj: {
					$css: sm["POINT"].css_tag,
					text: "<a href=\"javascript:displayPOINT('" + cur.uid + "')\">" + cur.name + "</a>",
					tags: cur.tags,
					statusX: cur.status,
				},
				data_pos: -1,
			},false);
		};
	}


	return ret;
};
function displayNOPARAM() {
	$("#MAIN").html(getNOPARAMHtml());
	$("#MAIN").css("display","inline");
};
