"use strict";	

function getNOPARAMHtml() {
	var ret = "";
	ret += GetMenu();
	
	ret += "<h1>Component Viewer</h1>";
	ret += "<table><tr>";

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

	ret += "</tr></table>";
	return ret;
};
function displayNOPARAM() {
	document.getElementById('MAIN').innerHTML = getNOPARAMHtml();
	document.getElementById('MAIN').style.display = 'inline';
};