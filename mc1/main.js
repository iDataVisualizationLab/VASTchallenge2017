var mc1 = mc1 || {};

var MAP_WIDTH = 200;
var MAP_HEIGHT = 200;
var mapFile = 'data/Lekagul Roadways.bmp';

mc1.mapSvg = d3.select('body').select('#map')
    .append('svg')
        .attr('width', (MAP_WIDTH + 1) * ParkMap.CELL_WIDTH + 300)
        .attr('height', (MAP_HEIGHT + 1) * ParkMap.CELL_HEIGHT)
    ;


Util.createMapByteData(MAP_WIDTH, MAP_HEIGHT, mapFile, function (mapByteData) {
    mc1.parkMap = new ParkMap(mapByteData, mc1.mapSvg);
    mc1.parkMap.render(true);
});

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 720 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

mc1.visitDurationSvg = d3.select('body').select('#visitDuration').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
    ;

d3.json("data/all-car-path.json", function(error, lines) {
    let visitChart = new Chart2D(mc1.visitDurationSvg, width, height, {margin: margin, timeChart: true});

    mc1.visitDuration = new VisitDuration(visitChart, mc1.parkMap);
    mc1.visitDuration.render(lines);

});
