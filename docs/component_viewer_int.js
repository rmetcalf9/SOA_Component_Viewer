"use strict";	

function getINTHtml(uid) {
	var ret = "";

	ret += '<table>';

	var curINT = dataObjects.INTs[uid];
	if (typeof(curINT)=="undefined") {
		console.log("ERROR no Integration with uid " + uid);
		return;
	}

	ret += '<tr>';
	ret += '<td valign="top" colspan=2>';

	var edf_pos = {x:180, y:50};
	var int_pos = {x:700, y:50};
	
	ret += GetMenu();
	
	ret += "<h1>Integration: " + curINT.name + " (" + curINT.status + ")</h1>";
	ret += "<svg class=\"ic_soa_svg\" style=\"width: 1300px; height: 100px;\">";
	ret += ic_soa_svg_getMarkers();
	
	var src_edf_obj = ic_soa_data_getEDFFromName(curINT.source_edf, dataObjects);
	//console.log(src_edf_obj);
	
	ret += ic_soa_svg_drawEDF(curINT.source_edf,edf_pos,"javascript:displayEDF('" + src_edf_obj.uid + "')",src_edf_obj.inbound_operation_text,src_edf_obj.outbound_operation_text);

	var target_system_object = ic_soa_data_getSystemFromName(curINT.target_system,dataObjects);
	
	var inbound_operation_text = curINT.inbound_operation_text;
	if (!curINT.has_inbound_operation_text()) inbound_operation_text = undefined;
	ret += ic_soa_svg_drawIntegrationWithTarget(
		curINT.name,
		curINT.target_system,
		int_pos,
		undefined,
		"javascript:displaySYSTEM('" + target_system_object.uid + "')",
		inbound_operation_text,
		curINT.outbound_operation_text
	);
	if ((src_edf_obj.has_inbound_operation_text()) && (curINT.has_inbound_operation_text())) {
		ret += ic_soa_svg_drawArrow( 
			ic_soa_svg_EDF_conectorPointLocation(edf_pos,"right"),
			ic_soa_svg_Integration_conectorPointLocation(int_pos,"left")
		);
	}
	if (typeof(curINT.outbound_operation_text)!="undefined") {
		ret += ic_soa_svg_drawArrow( 
			ic_soa_svg_Integration_conectorPointLocation(int_pos,"left_inbound"),
			ic_soa_svg_EDF_conectorPointLocation(edf_pos,"right_inbound")
		);
	}
	
	
	ret += "</svg>";

	ret += '</td>';
	ret += '</tr>';
	
	ret += '<tr class="main">';
	ret += '<td valign="top" align="left">';


	ret += '<table border=1>';
	ret += '<tr><th>Integration Name:</th><td>' + curINT.name + '</td></tr>';
	ret += '<tr><th>Development Status:</th><td>' + curINT.status + '</td></tr>';
	ret += '<tr><th>Source EDF:</th><td>' + curINT.source_edf + '</td></tr>';
	ret += '<tr><th>Target System:</th><td>' + curINT.target_system + '</td></tr>';
	ret += '<tr><th>Confluence Documentation:</th><td><a href="' + getConfluenceURL(curINT) + '">Confluence</a></td></tr>';
	ret += '<tr><th>Tags:</th><td>' + curINT.tags + '</td></tr>';
	ret += '</table>';
	
	
	ret += '</td>';
	ret += '</tr>';
	ret += '</table>';

	return ret;
};
function displayINT(uid) {
	$("#MAIN").html(getINTHtml(uid));
	$("#MAIN").css("display","inline");
};
