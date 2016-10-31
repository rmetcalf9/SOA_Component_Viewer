"use strict";	
function getEDFHtml(uid) {

	var ret = "";
	var curEDF = dataObjects.EDFs[uid];
	if (typeof(curEDF)=="undefined") {
		console.log("ERROR no EDF with uid " + uid);
		return;
	}

	var confluence_doc_url = "https://wiki.imperial.ac.uk/display/TIR/" + curEDF.name;
	
	var ints_to_draw = [];
	for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
		var cur_int = dataObjects.INTs[dataObjects.INTkeys[cur_do]];
		if (cur_int.source_edf==curEDF.name) ints_to_draw.push(cur_int);
	};
	//console.log(ints_to_draw);

	var svg_height = ints_to_draw.length * 100;
	if (svg_height<100) svg_height = 100;
	var source_sys_pos = {x:80, y:(svg_height/2)};
	var edf_pos = {x:350, y:(svg_height/2)};

	var source_system_object = ic_soa_data_getSystemFromName(curEDF.source_system,dataObjects);
	
	ret += '<table>';
	ret += '<tr><td colspan=2>'
	ret += GetMenu();
	ret += "<h1>EDF: " + curEDF.name + " (" + curEDF.status + ")</h1>";
	ret += "<svg class=\"ic_soa_svg\" style=\"width: 1300px; height: " + svg_height + "px;\">";
	ret += ic_soa_svg_getMarkers();
	ret += ic_soa_svg_drawSystem(curEDF.source_system,source_sys_pos,"javascript:displaySYSTEM('" + source_system_object.uid + "')");
	ret += ic_soa_svg_drawEDF(curEDF.name,edf_pos);
	ret += ic_soa_svg_drawArrow(ic_soa_svg_System_conectorPointLocation(source_sys_pos,"right"), ic_soa_svg_EDF_conectorPointLocation(edf_pos,"left"));

	var int_pos = {x:800, y:50};
	for (cur_do = 0; cur_do < ints_to_draw.length; cur_do++) {
		var target_system_object = ic_soa_data_getSystemFromName(ints_to_draw[cur_do].target_system,dataObjects);
		ret += ic_soa_svg_drawIntegrationWithTarget(
					ints_to_draw[cur_do].name,
					ints_to_draw[cur_do].target_system,
					int_pos,
					"javascript:displayINT('" + ints_to_draw[cur_do].uid + "')",
					"javascript:displaySYSTEM('" + target_system_object.uid + "')"
		);
		ret += ic_soa_svg_drawArrow( ic_soa_svg_EDF_conectorPointLocation(edf_pos,"right"),ic_soa_svg_Integration_conectorPointLocation(int_pos,"left"));
		int_pos.y = int_pos.y + 100;
	}
	
	ret += '</svg>';
	ret += '</td></tr>';
	
	var w = $( document ).width() - 400;
	
	ret += '<tr class="main">';
	ret += '<td width="' + w + 'px">';
	ret += '<iframe src="' + confluence_doc_url + '" scrolling="yes" height="100%" width="' + w + 'px" >';
	ret += '</iframe>';
	ret += '</td>';
	ret += '<td valign="top" align="left">';
	
	ret += '<table border=1>';
	ret += '<tr><th>EDF Name:</th><td>' + curEDF.name + '</td></tr>';
	ret += '<tr><th>Development Status:</th><td>' + curEDF.status + '</td></tr>';
	ret += '<tr><th>Source System:</th><td>' + curEDF.source_system + '</td></tr>';
	ret += '<tr><th>Confluence Documentation:</th><td><a href="' + confluence_doc_url + '">Confluence</a></td></tr>';
	ret += '<tr><th>Tags:</th><td>' + curEDF.tags + '</td></tr>';
	ret += '</table>';
	

	ret += "</td>";

	ret += "</tr></table>";

	return ret;
};
function displayEDF(uid) {
	$("#MAIN").html(getEDFHtml(uid));
	$("#MAIN").css("display","inline");
};
