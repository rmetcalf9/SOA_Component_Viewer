"use strict";

// This file is for the code data object

// Create the object
function ic_soa_data_tags_getObject(name, dataObjects) {
	for (var property in dataObjects.TAGs) {
		if (dataObjects.TAGs.hasOwnProperty(property)) {
			if (name == property) {
				var ret = {
					name: property
				};
				return ret;
			}
		}
	}
	return undefined;
}

