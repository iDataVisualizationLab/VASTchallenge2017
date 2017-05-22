var MAP_WIDTH = 200;
var MAP_HEIGHT = 200;
var mapFile = 'data/Lekagul Roadways.bmp';

var mapSvg = d3.select('body').select('#map')
    .append('svg')
        .attr('width', MAP_WIDTH * (ParkMap.CELL_WIDTH + 1))
        .attr('height', MAP_HEIGHT * (ParkMap.CELL_HEIGHT + 1))
    ;


Util.createMapByteData(MAP_WIDTH, MAP_HEIGHT, mapFile, function (mapByteData) {
    var parkMap = new ParkMap(mapByteData, mapSvg);
    parkMap.render(true);

    let path = parkMap.findSinglePathByName("entrance4", "entrance2");

    parkMap.highLightPath(path);

});

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var visitDurationSvg = d3.select('body').select('#visitDuration').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    ;
// d3.json("data/all-car-path.json", function(error, paths) {
d3.csv("data/data-test.csv", function(error, paths) {

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");
    paths.forEach(function(d) {
        d.date = parseTime(d.date);
        d.close = +d.close;
    });


    let test2 = paths.map(function (d) {
       return {date: d.date, closeTest: d.close - 10};
    });


    var visitDuration = new Chart2D(visitDurationSvg, width, height, {margin: margin, timeChart: true});

    let xDomain = d3.extent(paths, function(d) { return d.date; });
    let maxY = d3.max(paths, function(d) { return d.close; });

    visitDuration.setXDomain(xDomain[0], xDomain[1]);
    visitDuration.setYDomain(0, maxY);

    visitDuration.addData(paths, 'date', 'close');
    visitDuration.addData(test2, 'date', 'closeTest');
    visitDuration.renderChart();
    visitDuration.renderAxis('Time', 'Car');

});
