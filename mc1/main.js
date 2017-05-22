var MAP_WIDTH = 200;
var MAP_HEIGHT = 200;
var mapFile = 'data/Lekagul Roadways.bmp';
var parkMap;

var mapSvg = d3.select('body').select('#map')
    .append('svg')
        .attr('width', MAP_WIDTH * (ParkMap.CELL_WIDTH + 1))
        .attr('height', MAP_HEIGHT * (ParkMap.CELL_HEIGHT + 1))
    ;


Util.createMapByteData(MAP_WIDTH, MAP_HEIGHT, mapFile, function (mapByteData) {
    parkMap = new ParkMap(mapByteData, mapSvg);
    parkMap.render(true);

    let path = parkMap.findSinglePathByName("entrance4", "entrance2");

    parkMap.highLightPath(path);

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
        let visitChart = new Chart2D(visitDurationSvg, width, height, {margin: margin, timeChart: true});

        let visitDuration = new VisitDuration(visitChart, parkMap);
        visitDuration.render(lines);

    });
});

