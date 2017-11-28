"use strict";	

var ebo_url_prefix = "https://svn.cc.ic.ac.uk/svn/projects/AIAMetaData/trunk/EBO_HTML_GEN/html/output/";

function getEDFHtml(uid) {

	var ret = "";
	var curEDF = dataObjects.EDFs[uid];
	if (typeof(curEDF)=="undefined") {
		console.log("ERROR no EDF with uid " + uid);
		return;
	}

	var ints_to_draw = [];
	for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
		var cur_int = dataObjects.INTs[dataObjects.INTkeys[cur_do]];
		if (cur_int.source_edf==curEDF.name) ints_to_draw.push(cur_int);
	};
	//console.log(ints_to_draw);

	var vert_pitch = ic_soa_svg_componentHeight; //Vertical distance between rows
	var svg_height = ints_to_draw.length * vert_pitch;
	if (svg_height<vert_pitch) svg_height = vert_pitch;
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
	ret += ic_soa_svg_drawEDF(curEDF.name,edf_pos,undefined,curEDF.inbound_operation_text,curEDF.outbound_operation_text);
	ret += ic_soa_svg_drawArrow(
		ic_soa_svg_System_conectorPointLocation(source_sys_pos,"right"), 
		ic_soa_svg_EDF_conectorPointLocation(edf_pos,"left")
	);
	if (typeof(curEDF.outbound_operation_text)!="undefined") {
		ret += ic_soa_svg_drawArrow(
			ic_soa_svg_EDF_conectorPointLocation(edf_pos,"left_inbound"),
			ic_soa_svg_System_conectorPointLocation(source_sys_pos,"right")
		);
	};

	var int_pos = {x:800, y:50};
	for (cur_do = 0; cur_do < ints_to_draw.length; cur_do++) {
		var target_system_object = ic_soa_data_getSystemFromName(ints_to_draw[cur_do].target_system,dataObjects);
		ret += ic_soa_svg_drawIntegrationWithTarget(
					ints_to_draw[cur_do].name,
					ints_to_draw[cur_do].target_system,
					int_pos,
					"javascript:displayINT('" + ints_to_draw[cur_do].uid + "')",
					"javascript:displaySYSTEM('" + target_system_object.uid + "')",
					ints_to_draw[cur_do].inbound_operation_text,
					ints_to_draw[cur_do].outbound_operation_text
		);
		ret += ic_soa_svg_drawArrow( 
			ic_soa_svg_EDF_conectorPointLocation(edf_pos,"right"),
			ic_soa_svg_Integration_conectorPointLocation(int_pos,"left")
		);
		//SECOND ARROW
		if (typeof(ints_to_draw[cur_do].outbound_operation_text)!="undefined") {
			ret += ic_soa_svg_drawArrow( 
				ic_soa_svg_Integration_conectorPointLocation(int_pos,"left_inbound"),
				ic_soa_svg_EDF_conectorPointLocation(edf_pos,"right_inbound")
			);
		}
		int_pos.y = int_pos.y + vert_pitch;
	}
	
	ret += '</svg>';
	ret += '</td></tr>';
	
	ret += '<tr class="main">';
	ret += '<td valign="top" align="left">';
	
	ret += '<table border=1>';
	ret += '<tr><th>EDF Name:</th><td>' + curEDF.name + '</td></tr>';
	ret += '<tr><th>Development Status:</th><td>' + curEDF.status + '</td></tr>';
	ret += '<tr><th>Source System:</th><td>' + curEDF.source_system + '</td></tr>';
	ret += '<tr><th>Confluence Documentation:</th><td><a href="' + getConfluenceURL(curEDF) + '">Confluence</a></td></tr>';
	ret += '<tr><th>Tags:</th><td>';
	if (typeof(curEDF.tags)!="undefined") ret += curEDF.tags;
	ret += '</td></tr>';
	ret += '<tr><th>EBO:</th><td>';
	if (typeof(curEDF.ebo)!="undefined")ret += '<a href="' + ebo_url_prefix + curEDF.ebo + '">' + curEDF.ebo.replace(new RegExp('/','g'),'<br>') + '</a>';
	ret += '</td></tr>';
	ret += '</table>';
	

	ret += "</td>";

	ret += "</tr></table>";

	return ret;
};
function displayEDF(uid) {
	$("#MAIN").html(getEDFHtml(uid));
	$("#MAIN").css("display","inline");
};
