"use strict";	



function component_viewer_tags_getHtml(tagobj) {
	
	var ret = ""
	
	ret += "<h1>Information for " + tagobj.name + "</h1>";
	ret += "TODO";

	console.log(tagobj);

	return globalFunctions.GetPageContentWithMenu(ret);
};


function component_viewer_tags_INIT() {
	//TODO
};

function component_viewer_tags_display(tagname) {
	var tagobj = ic_soa_data_tags_getObject(tagname, dataObjects);
	$("#MAIN").html(component_viewer_tags_getHtml(tagobj));
	$("#MAIN").css("display","inline");
};

