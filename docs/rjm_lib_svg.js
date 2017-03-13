"use strict";

//Library for my generic svg libraries
var rjmlib_svg = {
	cropped_text_in_rect_next_clippath: 0,
};

function rjmlib_svg_init() {

	
};

//text_position: top_left|top_middle|top_right|center_left|center_middle|center_right|bottom_left|bottom_middle|bottom_right
function rjmlib_svg_cropped_text_in_rect(
	text_top_left,
	text_top_middle,
	text_top_right,
	text_center_left,
	text_center_middle,
	text_center_right,
	text_bottom_left,
	text_bottom_middle,
	text_bottom_right,
	x1,
	y1,
	width,
	height,
	visible_rect_class,
	parent_group_extra_tags
) {
	var ret = "";
	rjmlib_svg.cropped_text_in_rect_next_clippath += 1;
	var clip_path_str = "rjmlib_svg_cropped_text_cp" + rjmlib_svg.cropped_text_in_rect_next_clippath;
	
	/*
	var align_baseline = "hanging";
	var text_y = y1 + 5;
	if (text_position.includes("center_")) {
		align_baseline = "middle";
		text_y = (y1+(height/2));
	};
	if (text_position.includes("bottom_")) {
		align_baseline = "baseline";
		text_y = (y1+height) - 5;
	};

	var text_x = x1 + 5;
	var text_anchor="start";
	if (text_position.includes("_middle")) {
		text_anchor = "middle";
		text_x = (x1+(width/2));
	};
	if (text_position.includes("_right")) {
		text_anchor = "end";
		text_x = (x1+(width)-5);
	};
*/
	if (typeof(parent_group_extra_tags) != "undefined") {
		ret += "<g " + parent_group_extra_tags + ">";
	} else {
		ret += "<g>";
	};
	
	if (typeof(visible_rect_class) != "undefined") {
		ret += " <rect class=\"" + visible_rect_class + "\" x=\"" + x1 + "\" y=\"" + y1 + "\" width=\"" + width + "\" height=\"" + height + "\"/>";
	};

	var text_x = -1;
	var text_y = y1 + 5;
	
	if (typeof(text_top_left)!="undefined") {
		text_x = x1 + 5;
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"start\" alignment-baseline=\"hanging\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_top_left + "</text>";		
	};
	if (typeof(text_top_middle)!="undefined") {
		text_x = (x1+(width/2));
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"middle\" alignment-baseline=\"hanging\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_top_middle + "</text>";		
	};
	if (typeof(text_top_right)!="undefined") {
		text_x = (x1+(width)-5);
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"end\" alignment-baseline=\"hanging\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_top_right + "</text>";		
	};
	text_y = (y1+(height/2));
	if (typeof(text_center_left)!="undefined") {
		text_x = x1 + 5;
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"start\" alignment-baseline=\"middle\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_center_left + "</text>";		
	};
	if (typeof(text_center_middle)!="undefined") {
		text_x = (x1+(width/2));
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"middle\" alignment-baseline=\"middle\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_center_middle + "</text>";		
	};
	if (typeof(text_center_right)!="undefined") {
		text_x = (x1+(width)-5);
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"end\" alignment-baseline=\"middle\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_center_right + "</text>";		
	};
	text_y = (y1+height) - 5;
	if (typeof(text_bottom_left)!="undefined") {
		text_x = x1 + 5;
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"start\" alignment-baseline=\"baseline\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_bottom_left + "</text>";		
	};
	if (typeof(text_bottom_middle)!="undefined") {
		text_x = (x1+(width/2));
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"middle\" alignment-baseline=\"baseline\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_bottom_middle + "</text>";		
	};
	if (typeof(text_bottom_right)!="undefined") {
		text_x = (x1+(width)-5);
		ret += "<text clip-path=\"url(#" + clip_path_str + ")\" text-anchor=\"end\" alignment-baseline=\"baseline\" x=\"" + text_x + "\" y=\"" + text_y + "\"\">" + text_bottom_right + "</text>";		
	};
	
	
    ret += "<clipPath id=\"" + clip_path_str + "\">";
	ret += "<rect x=\"" + x1 + "\" y=\"" + y1 + "\" width=\"" + width + "\" height=\"" + height + "\"/>";
    ret += "</clipPath>";
	ret += "</g>";
	
	return ret;
};



//***********TEST CODE


/* rjmlib_svg_cropped_text_in_rect
	var pp = []
	pp.push("top_left");
	pp.push("top_middle");
	pp.push("top_right");
	pp.push("center_left");
	pp.push("center_middle");
	pp.push("center_right");
	pp.push("bottom_left");
	pp.push("bottom_middle");
	pp.push("bottom_right");
	
	var xxx = 50;
	for (var cur in pp) {
		ret += rjmlib_svg_cropped_text_in_rect(
			"TEST_TEXT_TO_BE_CROPPED", //Text
			pp[cur], //Alignment top_left|top_middle|etc
			xxx, //x1
			100, //y1
			100, //width
			100, //height
			"test" //rectangle class
		);
		xxx += 320;
	};
	*/
