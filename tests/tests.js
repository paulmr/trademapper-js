require.config({
	baseUrl: '../trademapper/js',
	paths: {
		QUnit: '../../tests/lib/qunit-1.14.0',
		d3: "lib/d3",
		topojson: "lib/topojson.v1"
	},
	shim: {
		QUnit: {
			exports: 'QUnit',
			init: function() {
				QUnit.config.autoload = false;
				QUnit.config.autostart = false;
			}
		}
	}
});

require(
	[
		'QUnit',
		'../../tests/js/test-arrows',
		'../../tests/js/test-csv',
		'../../tests/js/test-route'
	],
	function(QUnit, test_arrow, test_csv, test_route) {
		test_arrow.run();
		test_csv.run();
		test_route.run();

		QUnit.load();
		QUnit.start();
	}
);
