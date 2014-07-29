
define(["d3", "topojson", "worldmap"], function(d3, topojson, mapdata) {
	"use strict";
	var mapsvg, config,
		countries, borders,
		projection, pathmaker,

	/*
	 * caches svg reference
	 * decodes countries and borders and draws them
	 */
	init = function(svgElement, mapConfig) {
		mapsvg = svgElement;

		projection = d3.geo.mercator();
			//.scale(mapWidth/1.25)
			//.translate([mapWidth/4, mapHeight/2+10]);
		pathmaker = d3.geo.path().projection(projection);

		countries = topojson.feature(mapdata, mapdata.objects.subunits).features;
		borders = topojson.mesh(mapdata, mapdata.objects.subunits,
			function(a, b) { return true; });

		mapsvg.selectAll(".subunit")
			.data(countries)
			.enter()
				.append("path")
				.attr("d", pathmaker)
				.attr("class", function(d) { return "country " + d.id; });
				//.on("click", countryClicked)
				//.on("mouseover", hoverCountry)
				//.on("mouseout", unhoverCountry);

		mapsvg.append("path")
			.datum(borders)
			.attr("d", pathmaker)
			.attr("class", "country-border");
	},

	countryCentrePoint = function(countryCode) {
		for (var i = 0; i < countries.length; i++) {
			if (countries[i].id === countryCode) {
				// TODO: special case for the US - Alaska means the centre is over Canada ...
				// Could find largest polygon and use centre of that
				// Could have hard wired alternative coordinate for a few countries
				return pathmaker.centroid(countries[i]);
			}
		}
	},

	/*
	 * Projects forward from spherical coordinates (in degrees) to Cartesian
	 * coordinates (in pixels)
	 *
	 * Returns an array [x, y] given the input array [longitude, latitude].
	 *
	 * May return null if the specified location has no defined projected
	 * position, such as when the location is outside the clipping bounds of
	 * the projection.
	 */
	latLongToPoint = function(latLong) {
		// TODO: test this actually does what I expect ...
		return projection(latLong);
	};

	// TODO:
	// * highlight country
	// * clear country highlights
	// * chloropeth/ colour countries

	return {
		init: init,
		countryCentrePoint: countryCentrePoint,
		latLongToPoint: latLongToPoint
	};
});