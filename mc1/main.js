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

d3.json("data/all-car-path.json", function(error, lines) {
// d3.csv("data/data-test.csv", function(error, paths) {

    // parse the date / time
    let parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");


    let visitDuration = new Chart2D(visitDurationSvg, width, height, {margin: margin, timeChart: true});
    let minDate = parseTime('2015-05-01 00:43:28');
    let maxDate = parseTime('2016-05-31 23:56:06');

    visitDuration.setXDomain(minDate, maxDate);
    visitDuration.setYDomain(0, 20000);
    var colorFunction = d3.scaleOrdinal(d3.schemeCategory10);

    lines.forEach(function(line, index) {

        let colorIdx = line.carType;
        let color = line.carType == '2P' ? '#000000' : colorFunction(colorIdx);
        line.path.forEach(function (timeGate) {
            // debugger;
            timeGate.time = parseTime(timeGate.time);
            timeGate.y = 50 + index;
        });

        visitDuration.addData(line.path, 'time', 'y', color);

    });

    visitDuration.renderChart();
    visitDuration.renderAxis('Time', 'Visit');

});
