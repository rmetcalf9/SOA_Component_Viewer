"use strict";

/* This file is for the drawing functions for soa flows */
/*Cords in form
var cord{x:100,y:100};
*/
var conectorPointSpacing = 4;

//Called once and put into each SVG 
function ic_soa_svg_getMarkers() {
	var ret = "";
	ret += '<marker id="triangle" ';
	ret += 'viewBox="0 0 10 10" refX="8" refY="5"  ';
	ret += 'markerUnits="strokeWidth" ';
	ret += 'markerWidth="4" markerHeight="4" ';
	ret += 'orient="auto"> ';
	ret += '<path d="M 0 0 L 10 5 L 0 10 z" /> ';
	ret += '</marker> ';
	ret += '<marker id="triangleR" ';
	ret += 'viewBox="0 0 10 10" refX="8" refY="5"  ';
	ret += 'markerUnits="strokeWidth" ';
	ret += 'markerWidth="4" markerHeight="4" ';
	ret += 'orient="auto-start-reverse"> ';
	ret += '<path d="M 0 0 L 10 5 L 0 10 z" /> ';
	ret += '</marker> ';
	return ret;
};

function ic_soa_svg_drawPoint(cord) {
	return '<circle cx="' + cord.x + '" cy="' + cord.y + '" r="1" stroke="black" fill="black" stroke-width="1" />';
};

//Return the HTML for a system
function ic_soa_svg_drawSystem(name, cord, link) {
	var system_width=100;
	
	var ay = 10;
	var ty = 20;
	
	var ret = "";
	//ret += ic_soa_svg_drawPoint(cord);
	
	ret += '<ellipse class="system" cx="' + (cord.x) + '" cy="' + (cord.y + (ty+ay)) + '" rx="' + (system_width/2) + '" ry="' + (ay) + '" />';
	ret += '<rect class="system" x="' + (cord.x - (system_width/2)) + '" y="' + (cord.y - (ty+ay)) + '" width="' + system_width + '" height="' + (2*(ay+ty)) + '" />';
	
	//Text looks better if it isn't exactly in the middle of the object - this brings it down a touch
	if (typeof(link)=="undefined") {	
		ret += '<text class="system" x="' + cord.x + '" y="' + (cord.y - ty + ((ty + ty + ay + ay)/2)) + '" >' + name + '</text>';
	} else {
		ret += '<text class="system link" x="' + cord.x + '" y="' + (cord.y - ty + ((ty + ty + ay + ay)/2)) + '" onclick="' + link + '">' + name + '</text>';
	};
	
	ret += '<ellipse class="system" cx="' + (cord.x) + '" cy="' + (cord.y - (ty+ay)) + '" rx="' + (system_width/2) + '" ry="' + (ay) + '" />';
	ret += '<line class="system" x1="' + (cord.x - (system_width/2)) + '" y1="' + (cord.y - (ty+ay)) + '" x2="' + (cord.x - (system_width/2)) + '" y2="' + (cord.y + (ty + ay)) + '"/>';
	ret += '<line class="system" x1="' + (cord.x + (system_width/2)) + '" y1="' + (cord.y - (ty+ay)) + '" x2="' + (cord.x + (system_width/2)) + '" y2="' + (cord.y + (ty + ay)) + '"/>';
	return ret;
};
//Return the connectorPointLocation of System
function ic_soa_svg_System_conectorPointLocation(cord, typ) {
	if (typ=="left") {
		return {x:(cord.x-(50 + conectorPointSpacing)), y:cord.y }
	};
	if (typ=="right") {
		return {x:(cord.x+(50 + conectorPointSpacing)), y:cord.y }
	};
	return cord; //default to center
};

//Following function used for both ints and EDFs
function ic_soa_svg_drawOPERATION(obj_class, cord, operation_text, parent_width, parent_inner_margin, op_height) {
	var ret = "";
	
	ret += '<rect class="' + obj_class + '" x="' + (cord.x - (parent_width/2) + parent_inner_margin) + '" y="' + (cord.y - (op_height/2)) + '" width="' + (parent_width - (parent_inner_margin * 2)) + '" height="' + op_height + '" />';
	ret += '<text class="' + obj_class + '" x="' + cord.x + '" y="' + cord.y + '" >';
	ret += operation_text;
	ret += "</text>";
	
	return ret;
};

 
var edf_width=300;
var edf_square_part_offset_x = 30;
var edf_inner_width = edf_width - edf_square_part_offset_x;
var edf_operation_inner_margin = 30;
var edf_text_vert_offset = 20;
//Return the HTML for an EDF
function ic_soa_svg_drawEDF(name, cord, link, inbound_operation_text, outbound_operation_text) {
	var ret = "";
	var ay = 40;
	
	ret += '<ellipse class="edf" cx="' + (cord.x - (edf_inner_width/2)) + '" cy="' + cord.y + '" rx="' + (edf_square_part_offset_x/2) + '" ry="' + (ay) + '" />';
	ret += '<ellipse class="edf" cx="' + (cord.x + (edf_inner_width/2)) + '" cy="' + cord.y + '" rx="' + (edf_square_part_offset_x/2) + '" ry="' + (ay) + '" />';
	ret += '<rect class="edf" x="' + (cord.x - (edf_inner_width/2)) + '" y="' + (cord.y - (ay)) + '" width="' + edf_inner_width + '" height="' + (ay*2) + '" />';
	ret += '<line class="edf" x1="' + (cord.x - (edf_inner_width/2)) + '" y1="' + (cord.y - (ay)) + '" x2="' + (cord.x + (edf_inner_width/2)) + '" y2="' + (cord.y - (ay)) + '"/>';
	ret += '<line class="edf" x1="' + (cord.x - (edf_inner_width/2)) + '" y1="' + (cord.y + (ay)) + '" x2="' + (cord.x + (edf_inner_width/2)) + '" y2="' + (cord.y + (ay)) + '"/>';
	
	var text_top_pos_y = cord.y - ((edf_text_vert_offset*2) / 2);
	
	//Title Text Box
	if (typeof(link)=="undefined") {
		ret += '<text class="edf" x="' + cord.x + '" y="' + text_top_pos_y + '" >';
		ret += name;
		ret += "</text>";
	} else {
		ret += '<text class="edf link" x="' + cord.x + '" y="' + text_top_pos_y + '" onclick="' + link + '">';
		ret += name;
		ret += "</text>";
	};
	
	//Inbound Operation Text Box
	if (typeof(inbound_operation_text)=="undefined") inbound_operation_text="Sync";
	ret += ic_soa_svg_drawOPERATION("edf_operation",{x:cord.x,y:cord.y},inbound_operation_text,edf_width,edf_operation_inner_margin,edf_text_vert_offset);
	
	//Outbound Operation Text Box
	var op_center_y = (text_top_pos_y + (edf_text_vert_offset * 2));
	if (typeof(outbound_operation_text)!="undefined") {
		ret += ic_soa_svg_drawOPERATION("edf_operation",{x:cord.x,y:cord.y + edf_text_vert_offset},outbound_operation_text,edf_width,edf_operation_inner_margin,edf_text_vert_offset);
	}
	
	return ret;
}
//Types for outbound (sync) are left and right. Types for inbound are left_inbound and right_inbound
function ic_soa_svg_EDF_conectorPointLocation(cord, typ) {
	if (typ=="left") {
		return {x:(cord.x-(((edf_inner_width - edf_operation_inner_margin)/2) + conectorPointSpacing)), y:cord.y }
	};
	if (typ=="right") {
		return {x:(cord.x+(((edf_inner_width - edf_operation_inner_margin)/2) + conectorPointSpacing)), y:cord.y }
	};
	if (typ=="left_inbound") {
		return {x:(cord.x-(((edf_inner_width - edf_operation_inner_margin)/2) + conectorPointSpacing)), y:cord.y + edf_text_vert_offset }
	};
	if (typ=="right_inbound") {
		return {x:(cord.x+(((edf_inner_width - edf_operation_inner_margin)/2) + conectorPointSpacing)), y:cord.y + edf_text_vert_offset }
	};
	return cord; //default to center
};

function ic_soa_svg_getpointsstring(points) {
	var ret = "";
	for (var key in points) {
		ret += points[key].x + "," + points[key].y + " ";
	};
	return ret;
};

//Return the HTML for an Integration
var int_width=400;
var int_text_vert_offset = 20;
var int_operation_inner_margin = 40;
var int_square_part_offset_x = 40;
var int_inner_width = int_width - int_operation_inner_margin;
function ic_soa_svg_drawIntegration(name, cord, link, inbound_operation_text, outbound_operation_text) {
	var ret = "";
	var ay = 40;
	
	
	var left_x = (cord.x - (int_width/2));
	var right_x = (cord.x + (int_width/2));
	
	var points = [];
	points.push({x:left_x, y:cord.y});
	points.push({x:left_x+int_square_part_offset_x, y:(cord.y-ay)});
	points.push({x:right_x-int_square_part_offset_x, y:(cord.y-ay)});
	points.push({x:right_x, y:(cord.y)});
	points.push({x:right_x-int_square_part_offset_x, y:(cord.y+ay)});
	points.push({x:left_x+int_square_part_offset_x, y:(cord.y+ay)});
	//points.push({x:left_x, y:cord.y}); //Don't need to connect back to start
	
	ret += '<polygon class="int" points="' + ic_soa_svg_getpointsstring(points) + '" />';
	
	var text_top_pos_y = cord.y - ((int_text_vert_offset*2) / 2);
	
	//Title Text Box
	if (typeof(link)=="undefined") {	
		ret += '<text class="int" x="' + cord.x + '" y="' + text_top_pos_y + '" >' + name + '</text>';
	} else {
		ret += '<text class="int link" x="' + cord.x + '" y="' + text_top_pos_y + '" onclick="' + link + '">' + name + '</text>';
	}
	
	
	//Inbound Operation Text Box
	if (typeof(inbound_operation_text)=="undefined") inbound_operation_text="Sync";
	ret += ic_soa_svg_drawOPERATION("int_operation",{x:cord.x,y:cord.y},inbound_operation_text,int_width,int_operation_inner_margin,int_text_vert_offset);
	
	//Outbound Operation Text Box
	var op_center_y = (text_top_pos_y + (edf_text_vert_offset * 2));
	if (typeof(outbound_operation_text)!="undefined") {
		ret += ic_soa_svg_drawOPERATION("int_operation",{x:cord.x,y:cord.y + int_text_vert_offset},outbound_operation_text,int_width,int_operation_inner_margin,int_text_vert_offset);
	}
	
	return ret;
};
function ic_soa_svg_Integration_conectorPointLocation(cord, typ) {
	if (typ=="left") {
		return {x:(cord.x-(((int_inner_width - int_operation_inner_margin)/2) + conectorPointSpacing)), y:cord.y }
	};
	if (typ=="right") {
		return {x:(cord.x+(((int_inner_width - int_operation_inner_margin)/2) + conectorPointSpacing)), y:cord.y }
	};
	if (typ=="left_inbound") {
		return {x:(cord.x-(((int_inner_width - int_operation_inner_margin)/2) + conectorPointSpacing)), y:cord.y + int_text_vert_offset }
	};
	if (typ=="right_inbound") {
		return {x:(cord.x+(((int_inner_width - int_operation_inner_margin)/2) + conectorPointSpacing)), y:cord.y + int_text_vert_offset }
	};
	return cord; //default to center
};


function ic_soa_svg_drawIntegrationWithTarget(name, targ_sys_name, cord, int_link, sys_link, inbound_operation_text, outbound_operation_text) {
	var ret = "";
	var int_pos = {x:(cord.x),y:(cord.y)};
	var sys_pos = {x:(cord.x+350),y:(cord.y)};
	ret += ic_soa_svg_drawIntegration(name,int_pos, int_link, inbound_operation_text, outbound_operation_text);
	ret += ic_soa_svg_drawSystem(targ_sys_name,sys_pos,sys_link);
	ret += ic_soa_svg_drawArrow(
		ic_soa_svg_Integration_conectorPointLocation(int_pos,"right"), 
		ic_soa_svg_System_conectorPointLocation(sys_pos,"left")
	);
	//SECOND ARROW
	if (typeof(outbound_operation_text)!="undefined") {
		ret += ic_soa_svg_drawArrow(
			ic_soa_svg_System_conectorPointLocation(sys_pos,"left"),
			ic_soa_svg_Integration_conectorPointLocation(int_pos,"right_inbound")
		);
	}
	return ret;
}

//Point to point integration
// Yellow rhombus with wider base than top
function ic_soa_svg_drawPoint(name, cord, link) {
	var ret = "";
	
	var width = 400;
	var height = 30;
	var x_indent_size = 20; 

	var points = [];
	points.push({x:((cord.x)-(width/2))+x_indent_size, y:((cord.y)-(height/2))});
	points.push({x:((cord.x)-(width/2)), y:((cord.y)+(height/2))});
	points.push({x:((cord.x)+(width/2)), y:((cord.y)+(height/2))});
	points.push({x:((cord.x)+(width/2))-x_indent_size, y:((cord.y)-(height/2))});


	ret += '<polygon class="point" points="' + ic_soa_svg_getpointsstring(points) + '" />';
	if (typeof(link)=="undefined") {
		ret += '<text class="edf" x="' + cord.x + '" y="' + cord.y + '" >';
		ret += name;
		ret += "</text>";
	} else {
		ret += '<text class="edf link" x="' + cord.x + '" y="' + cord.y + '" onclick="' + link + '">';
		ret += name;
		ret += "</text>";
	};

	return ret;
}
function ic_soa_svg_Point_conectorPointLocation(cord, typ) {
	if (typ=="left") {
		return {x:(cord.x-((400/2) + conectorPointSpacing)), y:cord.y }
	};
	if (typ=="right") {
		return {x:(cord.x+((400/2) + conectorPointSpacing)), y:cord.y }
	};
	return cord; //default to center
};

//Presentation Service
//Blue rectangle
//Also use service provider caller style arror
function ic_soa_svg_drawPresentationService(name, cord, link) {
	var ret = "";
	
	var rect_width = 350;
	var rect_height = 30;

	ret += '<rect class="presentation" x="' + (cord.x - (rect_width/2)) + '" y="' + (cord.y - (rect_height/2)) + '" width="' + rect_width + '" height="' + rect_height + '" />';
	if (typeof(link)=="undefined") {
		ret += '<text class="edf" x="' + cord.x + '" y="' + cord.y + '" >';
		ret += name;
		ret += "</text>";
	} else {
		ret += '<text class="edf link" x="' + cord.x + '" y="' + cord.y + '" onclick="' + link + '">';
		ret += name;
		ret += "</text>";
	};

	return ret;
}
function ic_soa_svg_PresentationService_conectorPointLocation(cord, typ) {
	if (typ=="left") {
		return {x:(cord.x-((350/2) + conectorPointSpacing)), y:cord.y }
	};
	if (typ=="right") {
		return {x:(cord.x+((350/2) + conectorPointSpacing)), y:cord.y }
	};
	return cord; //default to center
};

//****CONNECTORS BELOW***

//Connector - Simple Arrow
function ic_soa_svg_drawArrow(start,end, double_head) {
	var ret = "";

	var arrow_class = "singlearrow";
	if (typeof(double_head)!="undefined") arrow_class = "doublearrow";

	ret += '<line class="' + arrow_class + '" x1="' + start.x + '" y1="' + start.y + '" x2="' + end.x + '" y2="' + end.y + '"/>';
	return ret;
};

function ic_soa_svg_drawSyncServiceCall(start,end) {
	var ret = "";

	var outer_center_circle_radius = 10;
	var outer_center_circle_stroke = 3;

	ret += ic_soa_svg_drawArrow(start,end,true);

	var mid_pos = {x:((start.x+end.x)/2), y:((start.y+end.y)/2)};

	ret += '<circle cx="' + mid_pos.x + '" cy="' + mid_pos.y + '" r="' + outer_center_circle_radius + '" stroke="black" fill="white" stroke-width="' + outer_center_circle_stroke + '" />';


	//Blanking rect
	var blanking_rect_height = (outer_center_circle_radius + outer_center_circle_stroke) * 2;
	var blanking_rect_width = blanking_rect_height / 2;
	ret += '<rect x="' + (mid_pos.x) + '" y="' + (mid_pos.y - (blanking_rect_height)/2) + '" width="' + (blanking_rect_width) + '" height="' + (blanking_rect_height) + '" stroke-width="0" fill="white" />';
	ret += '<circle cx="' + mid_pos.x + '" cy="' + mid_pos.y + '" r="5" stroke="black" fill="black" stroke-width="0" />';

	//Repair line (Line to redraw the piece of line that was removed
	ret += '<line class="headless" x1="' + mid_pos.x + '" y1="' + mid_pos.y + '" x2="' + end.x + '" y2="' + end.y + '"/>';


	return ret;
};


