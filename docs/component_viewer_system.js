"use strict";
	
function getSYSTEMHtml(uid) {
	var ret = "";

	ret += '<table>';
	ret += '<tr>';
	ret += '<td>';

	var system_object = dataObjects.SYSTEMs[uid];
	ret += GetMenu();

	ret += '</td>';
	ret += '</tr>';
	ret += '<tr class="main">';
	ret += '<td valign="top">';

	var ints_to_draw = [];
	for (var cur_do = 0; cur_do < dataObjects.INTkeys.length; cur_do++) {
		var cur_int = dataObjects.INTs[dataObjects.INTkeys[cur_do]];
		if (cur_int.target_system==system_object.name) ints_to_draw.push(cur_int);
	};
	var edfs_to_draw = [];
	for (var cur_do = 0; cur_do < dataObjects.EDFkeys.length; cur_do++) {
		var cur_edf = dataObjects.EDFs[dataObjects.EDFkeys[cur_do]];
		if (cur_edf.source_system==system_object.name) edfs_to_draw.push(cur_edf);
	};
	var target_pres_to_draw = [];
	for (var cur_do = 0; cur_do < dataObjects.PRESkeys.length; cur_do++) {
		var cur_pres = dataObjects.PRESs[dataObjects.PRESkeys[cur_do]];
		if (cur_pres.provider_system==system_object.name) target_pres_to_draw.push(cur_pres);
	};
	var source_pres_to_draw = [];
	for (var cur_do = 0; cur_do < dataObjects.PRESkeys.length; cur_do++) {
		var cur_pres = dataObjects.PRESs[dataObjects.PRESkeys[cur_do]];
		for(var i = 0; i < cur_pres.known_clients.length; i++) {
			//console.log(cur_pres.known_clients[i]);
			if (cur_pres.known_clients[i]==system_object.name) source_pres_to_draw.push(cur_pres);
		}
	};
	var source_point_to_draw = [];
	for (var cur_do = 0; cur_do < dataObjects.POINTkeys.length; cur_do++) {
		var cur_p2p = dataObjects.POINTs[dataObjects.POINTkeys[cur_do]];
		for(var i = 0; i < cur_p2p.client_systems.length; i++) {
			//console.log(cur_pres.client_systems[i]);
			if (cur_p2p.client_systems[i]==system_object.name) source_point_to_draw.push(cur_p2p);
		}
	};
	var target_point_to_draw = [];
	for (var cur_do = 0; cur_do < dataObjects.POINTkeys.length; cur_do++) {
		var cur_p2p = dataObjects.POINTs[dataObjects.POINTkeys[cur_do]];
		for(var i = 0; i < cur_p2p.provider_systems.length; i++) {
			//console.log(cur_pres.provider_systems[i]);
			if (cur_p2p.provider_systems[i]==system_object.name) target_point_to_draw.push(cur_p2p);
		}
	};
	
	//console.log("Ints:" + ints_to_draw.length);
	//console.log("EDFs:" + edfs_to_draw.length);
	//console.log("target_pres:" + target_pres_to_draw.length);
	//console.log("source_pres:" + source_pres_to_draw.length);
	//console.log("source point2point:" + source_point_to_draw.length);
	//console.log("target point2point:" + target_point_to_draw.length);

	ret += "<h1>System: " + system_object.name + "</h1>";
	var vert_pitch = 80; //Vertical distance between rows
	
	var src_side_to_draw = (edfs_to_draw.length + target_pres_to_draw.length + target_point_to_draw.length);
	var targ_side_to_draw = (ints_to_draw.length + source_pres_to_draw.length + source_point_to_draw.length);

	var max_eles = src_side_to_draw;
	if (max_eles < targ_side_to_draw) max_eles = targ_side_to_draw;
	var svg_height = max_eles * vert_pitch;
	if (svg_height<vert_pitch) svg_height = vert_pitch;
	
	var system_pos = {x:600, y:(svg_height/2)}

	ret += "<svg class=\"ic_soa_svg\" style=\"width: 1300px; height: " + svg_height + "px;\">";
	ret += ic_soa_svg_getMarkers();
	ret += ic_soa_svg_drawSystem(system_object.name,system_pos);


	//Draw LEFT (source side)
	var pos = {x:250, y:(vert_pitch/2)};
	if (src_side_to_draw > targ_side_to_draw) {
		pos.y += ((src_side_to_draw - targ_side_to_draw)/2)*vert_pitch;
	};
	//Draw INTS (on left)
	for (var cur_do = 0; cur_do < ints_to_draw.length; cur_do++) {
		ret += ic_soa_svg_drawIntegration(
					ints_to_draw[cur_do].name,
					pos,
					"javascript:displayINT('" + ints_to_draw[cur_do].uid + "')",
					ints_to_draw[cur_do].inbound_operation_text,
					ints_to_draw[cur_do].outbound_operation_text
		);
		ret += ic_soa_svg_drawArrow(
			ic_soa_svg_Integration_conectorPointLocation(pos,"right"),
			ic_soa_svg_System_conectorPointLocation(system_pos,"left")
		);
		if (typeof(ints_to_draw[cur_do].outbound_operation_text)!="undefined") {
		ret += ic_soa_svg_drawArrow(
			ic_soa_svg_System_conectorPointLocation(system_pos,"left"),
			ic_soa_svg_Integration_conectorPointLocation(pos,"right_inbound")
		);
		}
		
		pos.y = pos.y + vert_pitch;
	}
	//Draw SOURCE Presentation Services below the INTS (on left)
	for (var cur_do = 0; cur_do < source_pres_to_draw.length; cur_do++) {
		ret += ic_soa_svg_drawPresentationService(
					source_pres_to_draw[cur_do].name,
					pos,
					"javascript:displayPRES('" + source_pres_to_draw[cur_do].uid + "')"
		);
		ret += ic_soa_svg_drawSyncServiceCall(ic_soa_svg_PresentationService_conectorPointLocation(pos,"right"),ic_soa_svg_System_conectorPointLocation(system_pos,"left"));
		pos.y = pos.y + vert_pitch;
	}
	//Draw SOURCE Point to Point Integrations (on left)
	for (var cur_do = 0; cur_do < source_point_to_draw.length; cur_do++) {
		ret += ic_soa_svg_drawPoint(
					source_point_to_draw[cur_do].name,
					pos,
					"javascript:displayPOINT('" + source_point_to_draw[cur_do].uid + "')"
		);
		ret += ic_soa_svg_drawArrow(ic_soa_svg_Point_conectorPointLocation(pos,"right"),ic_soa_svg_System_conectorPointLocation(system_pos,"left"),true);
		pos.y = pos.y + vert_pitch;
	}

	
	//Draw RIGHT (target side)
	var pos = {x:1000, y:(vert_pitch/2)};
	if (targ_side_to_draw > src_side_to_draw) {
		pos.y += ((targ_side_to_draw - src_side_to_draw)/2)*vert_pitch;
	};
	//Draw EDFS (on right)
	for (var cur_do = 0; cur_do < edfs_to_draw.length; cur_do++) {
		ret += ic_soa_svg_drawEDF(
					edfs_to_draw[cur_do].name,
					pos,
					"javascript:displayEDF('" + edfs_to_draw[cur_do].uid + "')",
					edfs_to_draw[cur_do].inbound_operation_text,
					edfs_to_draw[cur_do].outbound_operation_text
		);
		ret += ic_soa_svg_drawArrow(
			ic_soa_svg_System_conectorPointLocation(system_pos,"right"),
			ic_soa_svg_EDF_conectorPointLocation(pos,"left")
		);
		if (typeof(edfs_to_draw[cur_do].outbound_operation_text)!="undefined") {
			ret += ic_soa_svg_drawArrow(
				ic_soa_svg_EDF_conectorPointLocation(pos,"left_inbound"),
				ic_soa_svg_System_conectorPointLocation(system_pos,"right")
			);
		}
		
		pos.y = pos.y + vert_pitch;
	}
	//Draw TARGET Presentation Services below the EDFS (on right)
	for (var cur_do = 0; cur_do < target_pres_to_draw.length; cur_do++) {
		ret += ic_soa_svg_drawPresentationService(
					target_pres_to_draw[cur_do].name,
					pos,
					"javascript:displayPRES('" + target_pres_to_draw[cur_do].uid + "')"
		);
		ret += ic_soa_svg_drawSyncServiceCall(ic_soa_svg_System_conectorPointLocation(system_pos,"right"),ic_soa_svg_PresentationService_conectorPointLocation(pos,"left"));
		pos.y = pos.y + vert_pitch;
	}
	//Draw TARGET Porint to Point Integrations (on right)
	for (var cur_do = 0; cur_do < target_point_to_draw.length; cur_do++) {
		ret += ic_soa_svg_drawPoint(
					target_point_to_draw[cur_do].name,
					pos,
					"javascript:displayPOINT('" + target_point_to_draw[cur_do].uid + "')"
		);
		ret += ic_soa_svg_drawArrow(ic_soa_svg_System_conectorPointLocation(system_pos,"right"),ic_soa_svg_Point_conectorPointLocation(pos,"left"),true);
		pos.y = pos.y + vert_pitch;
	}

	
	ret += "</svg>";

	ret += '</td>';
	ret += '</tr>';
	ret += '</table>';
		
	return ret;
};
function displaySYSTEM(uid) {
	$("#MAIN").html(getSYSTEMHtml(uid));
	$("#MAIN").css("display","inline");
};
