"use strict";	

function getPOINTHtml(uid) {
	var ret = "";

	ret += '<table>';
	ret += '<tr>';
	ret += '<td>';

	var curPOINT = dataObjects.POINTs[uid];
	if (typeof(curPOINT)=="undefined") {
		console.log("ERROR no Point 2 Point Integration with uid " + uid);
		return;
	}

	ret += '</td>';
	ret += '</tr>';
	ret += '<tr class="main">';
	ret += '<td valign="top">';

	var vert_pitch = ic_soa_svg_componentHeight; //Vertical distance between rows

	var provider_systems_to_draw = curPOINT.provider_systems;
	var client_systems_to_draw = curPOINT.client_systems;

	var src_side_to_draw = (provider_systems_to_draw.length);
	var targ_side_to_draw = (client_systems_to_draw.length);

	var max_eles = src_side_to_draw;
	if (max_eles < targ_side_to_draw) max_eles = targ_side_to_draw;
	var svg_height = max_eles * vert_pitch;
	if (svg_height<vert_pitch) svg_height = vert_pitch;

	ret += GetMenu();
	
	ret += "<h1>Point 2 Point Integration: " + curPOINT.name + " (" + curPOINT.status + ")</h1>";

	var point_pos = {x:500, y:(svg_height/2)};

	ret += "<svg class=\"ic_soa_svg\" style=\"width: 1300px; height: " + svg_height + "px;\">";
	ret += ic_soa_svg_getMarkers();

	ret += ic_soa_svg_drawPoint(curPOINT.name,point_pos);

	//Draw left side (source/provider side)
	var provider_system_pos = {x:200, y:50};
	if (targ_side_to_draw > src_side_to_draw) {
		provider_system_pos.y += ((targ_side_to_draw - src_side_to_draw)/2)*vert_pitch;
	};
	for (var cur_do = 0; cur_do < provider_systems_to_draw.length; cur_do++) {
		var provider_system_object = ic_soa_data_getSystemFromName(provider_systems_to_draw[cur_do],dataObjects);
		ret += ic_soa_svg_drawSystem(
			provider_system_object.name,
			provider_system_pos,
			"javascript:displaySYSTEM('" + provider_system_object.uid + "')"
		);
		ret += ic_soa_svg_drawArrow( ic_soa_svg_System_conectorPointLocation(provider_system_pos,"right"),ic_soa_svg_Point_conectorPointLocation(point_pos,"left"),true);
		provider_system_pos.y = provider_system_pos.y + vert_pitch;
	}

	//Draw right side (target/client side)
	var client_system_pos = {x:900, y:50};
	if (src_side_to_draw > targ_side_to_draw) {
		client_system_pos.y += ((src_side_to_draw - targ_side_to_draw)/2)*vert_pitch;
	};
	for (var cur_do = 0; cur_do < client_systems_to_draw.length; cur_do++) {
		var client_system_object = ic_soa_data_getSystemFromName(client_systems_to_draw[cur_do],dataObjects);
		ret += ic_soa_svg_drawSystem(
			client_system_object.name,
			client_system_pos,
			"javascript:displaySYSTEM('" + client_system_object.uid + "')"
		);
		ret += ic_soa_svg_drawArrow( ic_soa_svg_Point_conectorPointLocation(point_pos,"right"),ic_soa_svg_System_conectorPointLocation(client_system_pos,"left"),true);
		client_system_pos.y = client_system_pos.y + vert_pitch;
	}

	ret += "</svg>";

	ret += '</td>';
	ret += '</tr>';
	ret += '</table>';

	return ret;
};
function displayPOINT(uid) {
	$("#MAIN").html(getPOINTHtml(uid));
	$("#MAIN").css("display","inline");
};
