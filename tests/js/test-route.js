define(
	['QUnit', 'trademapper.route', 'd3'],
	function(q, route, d3) {
		"use strict";
		var pointL1, pointL2, pointL3, pointL4, pointC1, pointC2, pointC3, pointC4,
			pointC1o, pointC1e, pointC2i, pointC2e, pointC2t;

		var run = function() {
			q.module("RolesCollection module", {
			});

			q.test('check RolesCollection rolesArray and rolesString with one role', function() {
				var roles = new route.RolesCollection("exporter");
				q.deepEqual(roles.toArray(), ["exporter"]);
				q.equal(roles.toString(), "exporter");
			});

			q.test('check RolesCollection rolesArray and rolesString with two roles', function() {
				var roles = new route.RolesCollection("exporter");
				roles.addRole("importer");
				roles.addRole("exporter");
				q.deepEqual(roles.toArray(), ["exporter", "importer"]);
				q.equal(roles.toString(), "exporter,importer");
			});

			q.module("PointLatLong module", {
				setup: function() {
					// set a default function - required before we can create points
					route.setLatLongToPointFunc(function() { return [3, 4]; });
				}
			});

			q.test('check PointLatLong sets point using latLongToPointFunc', function() {
				route.setLatLongToPointFunc(function() { return [3, 4]; });
				var point = new route.PointLatLong("exporter", 5, 6);
				q.equal(point.latlong[0], 6, 'The x of latlong should be 6');
				q.equal(point.latlong[1], 5, 'The y of latlong should be 5');
				q.equal(point.point[0], 3, 'The x of point should be 3');
				q.equal(point.point[1], 4, 'The y of point should be 4');
			});

			q.test('check PointLatLong toString() includes lat and long', function() {
				var point = new route.PointLatLong("exporter", 5.34, 6.12);
				var pointString = point.toString();
				q.ok(pointString.indexOf("5.34") > -1);
				q.ok(pointString.indexOf("6.12") > -1);
			});

			q.test('check PointLatLong toString() is same for two points with same lat/long', function() {
				var point1 = new route.PointLatLong("exporter", 5.34, 6.12);
				var point2 = new route.PointLatLong("exporter", 5.34, 6.12);
				q.equal(point1.toString(), point2.toString());
			});

			q.module("PointCountry module", {
				setup: function() {
					// set a default function - required before we can create points
					route.setCountryGetPointFunc(function() { return [8, 9]; });
				}
			});

			q.test('check PointCountry sets point using countryGetPointFunc', function() {
				var point = new route.PointCountry("GB", "importer");
				q.equal("GB", point.countryCode, 'The countryCode should be "GB"');
				q.equal(8, point.point[0], 'The x of point should be 8');
				q.equal(9, point.point[1], 'The y of point should be 9');
			});

			q.test('check PointCountry toString() includes country code', function() {
				var point = new route.PointCountry("KE", "importer");
				var pointString = point.toString();
				q.ok(pointString.indexOf("KE") > -1);
			});

			q.test('check PointCountry toString() is same for two points with same country code', function() {
				var point1 = new route.PointCountry("ZA", "importer");
				var point2 = new route.PointCountry("ZA", "importer");
				q.equal(point1.toString(), point2.toString());
			});

			q.module("BothPoint module", {
				setup: function() {
					// set a default function - required before we can create points
					route.setLatLongToPointFunc(function() { return [3, 4]; });
					route.setCountryGetPointFunc(function() { return [8, 9]; });
					pointL1 = new route.PointLatLong("exporter", 5.34, 6.12);
					pointC1 = new route.PointCountry("ZA", "importer");
					pointC2 = new route.PointCountry("GB", "importer");
				}
			});

			q.test('check Route toString() contains strings for all points', function() {
				var route1 = new route.Route([pointL1, pointC1, pointC2], 20);

				var routeString = route1.toString();
				q.ok(routeString.indexOf(pointL1.toString()) > -1);
				q.ok(routeString.indexOf(pointC1.toString()) > -1);
				q.ok(routeString.indexOf(pointC2.toString()) > -1);
			});

			q.test('check Route toString() is same for two routes with same points in same order', function() {
				var route1 = new route.Route([pointL1, pointC1, pointC2], 20);
				var route2 = new route.Route([pointL1, pointC1, pointC2], 20);

				q.equal(route1.toString(), route2.toString());
			});

			q.test('check Route toString() is different for two routes with same points in different order', function() {
				var route1 = new route.Route([pointL1, pointC1, pointC2], 20);
				var route2 = new route.Route([pointL1, pointC2, pointC1], 20);

				q.notEqual(route1.toString(), route2.toString());
			});

			q.test('check Route doesn\'t combine consecutive points with different string', function() {
				var pOrigin = new route.PointCountry("KE", "origin"),
					pExporter = new route.PointCountry("ZW", "exporter"),
					pImporter = new route.PointCountry("TH", "importer"),
					route1 = new route.Route([pOrigin, pExporter, pImporter], 20);

				q.equal(route1.points.length, 3);
				q.deepEqual(route1.points[0].roles.toArray(), ["origin"]);
				q.deepEqual(route1.points[1].roles.toArray(), ["exporter"]);
				q.deepEqual(route1.points[2].roles.toArray(), ["importer"]);
			});

			q.test('check Route combines consecutive points with same string', function() {
				var pOrigin = new route.PointCountry("ZW", "origin"),
					pExporter = new route.PointCountry("ZW", "exporter"),
					pImporter = new route.PointCountry("TH", "importer"),
					route1 = new route.Route([pOrigin, pExporter, pImporter], 20);

				q.equal(route1.points.length, 2);
				q.deepEqual(route1.points[0].roles.toArray(), ["origin", "exporter"]);
				q.deepEqual(route1.points[1].roles.toArray(), ["importer"]);
			});

			q.test('check RouteCollection adds new routes not in it currently', function() {
				var route1 = new route.Route([pointL1, pointC1, pointC2], 20);
				var route2 = new route.Route([pointL1, pointC2, pointC1], 20);

				var collection = new route.RouteCollection();
				q.equal(0, collection.routeCount());
				collection.addRoute(route1);
				q.equal(1, collection.routeCount());
				collection.addRoute(route2);
				q.equal(2, collection.routeCount());
			});

			q.test('check RouteCollection combines quantity of routes with same points in same order', function() {
				var route1 = new route.Route([pointL1, pointC1, pointC2], 20);
				var route2 = new route.Route([pointL1, pointC1, pointC2], 10);

				var collection = new route.RouteCollection();
				q.equal(0, collection.routeCount());
				collection.addRoute(route1);
				q.equal(1, collection.routeCount());
				q.equal(20, collection.getRoutes()[0].quantity);
				collection.addRoute(route2);
				q.equal(1, collection.routeCount());
				q.equal(30, collection.getRoutes()[0].quantity);
			});

			q.test('check RouteCollection maxQuantity returns 0 when it has no routes', function() {
				var collection = new route.RouteCollection();
				q.equal(collection.maxQuantity(), 0);
			});

			q.test('check RouteCollection maxQuantity returns value when it has one route', function() {
				var collection = new route.RouteCollection(),
					route1 = new route.Route([pointC1, pointC2], 20);
				collection.addRoute(route1);
				q.equal(collection.maxQuantity(), 20);
			});

			q.test('check RouteCollection maxQuantity ignores single point routes by default', function() {
				var collection = new route.RouteCollection(),
					route1 = new route.Route([pointC1, pointC2], 20),
					route2 = new route.Route([pointC1], 200);
				collection.addRoute(route1);
				collection.addRoute(route2);
				q.equal(collection.maxQuantity(), 20);
			});

			q.test('check RouteCollection maxQuantity can include single point routes', function() {
				var collection = new route.RouteCollection(),
					route1 = new route.Route([pointC1, pointC2], 20),
					route2 = new route.Route([pointC1], 200),
					route3 = new route.Route([], 2000);
				collection.addRoute(route1);
				collection.addRoute(route2);
				collection.addRoute(route3);
				q.equal(collection.maxQuantity(1), 200);
			});

			q.test('check RouteCollection maxQuantity returns max when it has multiple routes', function() {
				var collection = new route.RouteCollection(),
					route1 = new route.Route([pointL1, pointC1], 10),
					route2 = new route.Route([pointC1, pointC2], 30),
					route3 = new route.Route([pointL1, pointC2], 20);
				collection.addRoute(route1);
				collection.addRoute(route2);
				collection.addRoute(route3);
				q.equal(collection.maxQuantity(), 30);
			});

			q.module("RouteCollection combining roles module", {
				setup: function() {
					// set a default function - required before we can create points
					route.setCountryGetPointFunc(function() { return [8, 9]; });
					pointC1o = new route.PointCountry("ZA", "origin");
					pointC1e = new route.PointCountry("ZA", "exporter");
					pointC2i = new route.PointCountry("GB", "importer");
				}
			});

			q.test('check RouteCollection combines routes and roles', function() {
				var collection = new route.RouteCollection(),
					route1 = new route.Route([pointC1o, pointC2i], 10),
					route2 = new route.Route([pointC1e, pointC2i], 30);
				collection.addRoute(route1);
				collection.addRoute(route2);
				q.equal(1, collection.routeCount());
				q.equal(collection.maxQuantity(), 40);
				var routeOut = collection.getRoutes()[0];
				q.equal(routeOut.points[0].roles.toString(), "origin,exporter");
				q.equal(routeOut.points[1].roles.toString(), "importer");
			});

			q.module("LatLongIdentity module", {
				setup: function() {
					// set a default function - required before we can create points
					route.setLatLongToPointFunc(function(latlong) { return [latlong[0], latlong[1]]; });
					pointL1 = new route.PointLatLong("exporter", 2.34, 3.45);
					pointL2 = new route.PointLatLong("exporter", 4.56, 5.67);
					pointL3 = new route.PointLatLong("exporter", 6.78, 7.89);
					pointL4 = new route.PointLatLong("exporter", 8.90, 9.01);
				}
			});

			q.test('check RouteCollection getCenterTerminalList does one two-stop route correctly', function() {
				var ctAndMax,
					collection = new route.RouteCollection(),
					route1 = new route.Route([pointL1, pointL2], 10);
				collection.addRoute(route1);
				ctAndMax = collection.getCenterTerminalList();
				q.equal(ctAndMax.maxSourceQuantity, 10);
				q.deepEqual(ctAndMax.centerTerminalList,
					[
						{
							center: {
								lat: 3.45,
								lng: 2.34,
								quantity: 10,
								point: pointL1
							},
							terminals: [
								{
									point: pointL2,
									lat: 5.67,
									lng: 4.56,
									quantity: 10
								}
							]
						}
					]);
			});

			q.test('check RouteCollection getCenterTerminalList does one three-stop route correctly', function() {
				var ctAndMax,
					collection = new route.RouteCollection(),
					route1 = new route.Route([pointL1, pointL2, pointL3], 10);
				collection.addRoute(route1);
				ctAndMax = collection.getCenterTerminalList();
				q.equal(ctAndMax.maxSourceQuantity, 10);
				q.deepEqual(ctAndMax.centerTerminalList,
					[
						{
							center: {
								lat: 3.45,
								lng: 2.34,
								quantity: 10,
								point: pointL1
							},
							terminals: [
								{
									point: pointL2,
									lat: 5.67,
									lng: 4.56,
									quantity: 10
								}
							]
						},
						{
							center: {
								lat: 5.67,
								lng: 4.56,
								quantity: 10,
								point: pointL2
							},
							terminals: [
								{
									point: pointL3,
									lat: 7.89,
									lng: 6.78,
									quantity: 10
								}
							]
						}
					]);
			});

			q.test('check RouteCollection getCenterTerminalList does two two-stop route correctly (same start)', function() {
				// Note the center quantity should be the sum of the others
				var ctAndMax,
					collection = new route.RouteCollection(),
					route1 = new route.Route([pointL1, pointL2], 10),
					route2 = new route.Route([pointL1, pointL3], 20);
				collection.addRoute(route1);
				collection.addRoute(route2);
				ctAndMax = collection.getCenterTerminalList();
				q.equal(ctAndMax.maxSourceQuantity, 30);
				q.deepEqual(ctAndMax.centerTerminalList,
					[
						{
							center: {
								lat: 3.45,
								lng: 2.34,
								quantity: 30,
								point: pointL1
							},
							terminals: [
								{
									point: pointL2,
									lat: 5.67,
									lng: 4.56,
									quantity: 10
								},
								{
									point: pointL3,
									lat: 7.89,
									lng: 6.78,
									quantity: 20
								}
							]
						}
					]);
			});

			q.test('check RouteCollection getCenterTerminalList does overlapping two-stop and three-stop route correctly', function() {
				// Note the center quantity should be the sum of the others
				var ctAndMax,
					collection = new route.RouteCollection(),
					route1 = new route.Route([pointL1, pointL2, pointL3], 10),
					route2 = new route.Route([pointL2, pointL4], 20);
				collection.addRoute(route1);
				collection.addRoute(route2);
				ctAndMax = collection.getCenterTerminalList();
				q.equal(ctAndMax.maxSourceQuantity, 30);
				q.deepEqual(ctAndMax.centerTerminalList,
					[
						{
							center: {
								lat: 3.45,
								lng: 2.34,
								quantity: 10,
								point: pointL1
							},
							terminals: [
								{
									point: pointL2,
									lat: 5.67,
									lng: 4.56,
									quantity: 10
								}
							]
						},
						{
							center: {
								lat: 5.67,
								lng: 4.56,
								quantity: 30,
								point: pointL2
							},
							terminals: [
								{
									point: pointL3,
									lat: 7.89,
									lng: 6.78,
									quantity: 10
								},
								{
									point: pointL4,
									lat: 9.01,
									lng: 8.90,
									quantity: 20
								}
							]
						}
					]);
			});

			q.module("Country Points module", {
				setup: function() {
					// set a default function - required before we can create points
					route.setCountryGetPointFunc(function() { return [8, 9]; });
					pointC1 = new route.PointCountry("ZA", "origin");
					pointC2e = new route.PointCountry("ZW", "exporter");
					pointC2t = new route.PointCountry("ZW", "transit");
					pointC3 = new route.PointCountry("GB", "importer");
					pointC4 = new route.PointCountry("AR", "importer");
				}
			});

			q.test('check getPointRoles sets combined roles for one two-stop route', function() {
				var pointRoles,
					collection = new route.RouteCollection(),
					route1 = new route.Route([pointC1, pointC3], 10);
				collection.addRoute(route1);
				pointRoles = collection.getPointRoles();
				q.deepEqual(pointRoles["ZA"].roles.roles, {
					origin: true,
					exporter: false,
					transit: false,
					importer: false
				});
				q.deepEqual(pointRoles["GB"].roles.roles, {
					origin: false,
					exporter: false,
					transit: false,
					importer: true
				});
			});

			q.test('check getPointRoles sets combined roles for one three-stop route', function() {
				var pointRoles,
					collection = new route.RouteCollection(),
					route1 = new route.Route([pointC1, pointC2t, pointC3], 10);
				collection.addRoute(route1);
				pointRoles = collection.getPointRoles();
				q.deepEqual(pointRoles["ZA"].roles.roles, {
					origin: true,
					exporter: false,
					transit: false,
					importer: false
				});
				q.deepEqual(pointRoles["ZW"].roles.roles, {
					origin: false,
					exporter: false,
					transit: true,
					importer: false
				});
				q.deepEqual(pointRoles["GB"].roles.roles, {
					origin: false,
					exporter: false,
					transit: false,
					importer: true
				});
			});

			q.test('check getPointRoles sets combined roles for overlapping two-stop and three-stop route', function() {
				var pointRoles,
					collection = new route.RouteCollection(),
					route1 = new route.Route([pointC1, pointC2t, pointC3], 10),
					route2 = new route.Route([pointC2e, pointC4], 20);
				collection.addRoute(route1);
				collection.addRoute(route2);
				pointRoles = collection.getPointRoles();
				q.deepEqual(pointRoles["ZA"].roles.roles, {
					origin: true,
					exporter: false,
					transit: false,
					importer: false
				});
				q.deepEqual(pointRoles["ZW"].roles.roles, {
					origin: false,
					exporter: true,
					transit: true,
					importer: false
				});
				q.deepEqual(pointRoles["GB"].roles.roles, {
					origin: false,
					exporter: false,
					transit: false,
					importer: true
				});
				q.deepEqual(pointRoles["AR"].roles.roles, {
					origin: false,
					exporter: false,
					transit: false,
					importer: true
				});
			});

		};
		return {run: run};
	}
);
