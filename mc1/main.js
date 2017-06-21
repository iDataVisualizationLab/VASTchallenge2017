var mc1 = mc1 || {};

var MAP_WIDTH = 200;
var MAP_HEIGHT = 200;
var mapFile = 'data/Lekagul Roadways.bmp';

mc1.mapSvg = d3.select('body').select('#map')
    .append('svg')
        .attr('width', (MAP_WIDTH + 1) * ParkMap.CELL_WIDTH + 300)
        .attr('height', (MAP_HEIGHT + 1) * ParkMap.CELL_HEIGHT)
    ;

var PARA_WIDTH = 720;
var PARA_HEIGHT = 500;
mc1.paraSvg = d3.select('body').select('#parallelCoordinates')
    .append('svg')
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

mc1.firstDaySpanSvg = d3.select('body').select('#firstDaySpan').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
;

d3.json("data/all-car-path.json", function(error, lines) {
    let visitParser = new VisitParser(mc1.parkMap);
    mc1.visitParser = visitParser;

    mc1.parsedVisits = visitParser.parse(lines);
    // mc1.parsedVisits = mc1.parsedVisits.slice(0, 100);
    // mc1.parsedVisits = mc1.parsedVisits.filter(function (visit) {
    //     return visit.carId == '20150322080300-861';
    // });

    mc1.eventHandler = new EventHandler();
    mc1.simulationManager = new SimulationManager(mc1.parkMap);


    d3.timeout(function () {
        renderParallelCoordinate();
    });

    // d3.timeout(function () {
    //     mc1.controller.changeGraphType('one-year');
    //     // mc1.controller.changeGraphType('hour-spiral');
    //     //
    // });

    d3.timeout(function () {
        // mc1.controller.changeGraphType('one-year');
        mc1.controller.changeGraphType('hour');
        // mc1.controller.changeGraphType('hour-spiral');
        //
    });
});

function renderParallelCoordinate() {
    let dimensions = {
        // startTime: {label: "Start Time"},

        carType:  { label: 'Car Type', type: 'String'},
        camping: {label: 'Camping', type: 'String'},
        stopCount: {label: 'Stop Count'},
        overnight: {label: 'Overnight', type: 'String'},
        visitDuration: {label: 'Visit Duration (hrs)' },
        velocity: {label: 'Velocity (mph)'}
    };

    mc1.parallel = new ParallelCoordinate(mc1.paraSvg, PARA_WIDTH, PARA_HEIGHT, mc1.parsedVisits);
    mc1.parallel.setEventHandler(mc1.eventHandler);

    let dim;
    for(let key in dimensions) {
        if (!dimensions.hasOwnProperty(key)) {
            continue;
        }

        dim = dimensions[key];

        mc1.parallel.addDimension(dim.label, key, dim.type);

    }

    mc1.parallel.renderGraph();
}
