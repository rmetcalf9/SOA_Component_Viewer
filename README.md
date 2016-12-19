# SOA_Component_Viewer
Website to view SOA Components and their relationships

[Live github pages](http://rmetcalf9.github.io/SOA_Component_Viewer)

## Summary of Operation
SOA Component Viewer is a JavaScript based web-application that uses the google API to generate webpages to view details of SOA Components.
SOA Component data is stored in a google sheets document. The ID for the exact document is uses is hard coded in docs/ic_soa_data.js (function ic_soa_data_getSheetID()). This document also describes the data ranges used for each type of component.
SOA Component Viewer users should have access to this google sheet document. If they have read-only access they will be able to view the SOA components. If they are granted read/write access they will also be able to use the Kanban chart to change Component status’ and tags.

##Component Types

|Short Name|Full Name|
|-------|-------|
|EDF|Enteprise Data Flow|
|Integration|Integration|
|Presentation|Presentation Service|
|Point2Point|Point to Point Integration|


## Confluence Link

Individual component pages link to confluence pages for convenience. This is based on the standard page structure used in the confluence site. The URL for the confluence page is determined by function getConfluenceURL(obj) in docs/component_viewer.html.

## EBO Documentation Link

Individual EDF’s may link to their EBO location if it is specified in the EDF data. The URL is determined by the variable ebo_url_prefix (declared in docs/component_viewer_edf.js). This is concatenated with the EBO location data.
