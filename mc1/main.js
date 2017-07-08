var mc1 = mc1 || {};

var MAP_WIDTH = 200;
var MAP_HEIGHT = 200;
var mapFile = 'data/Lekagul Roadways.bmp';

mc1.mapSvg = d3.select('body').select('#map')
    .append('svg')
        .attr('width', (MAP_WIDTH + 1) * ParkMap.CELL_WIDTH )
        .attr('height', (MAP_HEIGHT + 1) * ParkMap.CELL_HEIGHT)
    ;

var PARA_WIDTH = 600;
var PARA_HEIGHT = 400;
mc1.paraSvg = d3.select('body').select('#parallelCoordinates')
    .append('svg')
;

Util.createMapByteData(MAP_WIDTH, MAP_HEIGHT, mapFile, function (mapByteData) {
    mc1.parkMap = new ParkMap(mapByteData, mc1.mapSvg);
    mc1.parkMap.render(true);
});

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 520 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

mc1.visitDurationSvg = d3.select('body').select('#visitDuration').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // .append("g")
        // .attr("transform",
        //     "translate(" + margin.left + "," + margin.top + ")")
    ;

mc1.firstDaySpanSvg = d3.select('body').select('#firstDaySpan').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .append("g")
    // .attr("transform",
    //     "translate(" + margin.left + "," + margin.top + ")")
;

d3.json("data/all-car-path.json", function(error, lines) {
    let visitParser = new VisitParser(mc1.parkMap);
    mc1.visitParser = visitParser;

    mc1.parsedVisits = visitParser.parse(lines);
    // mc1.parsedVisits = mc1.parsedVisits.filter(function (visit) {
    //     // return visit.carType != '2P' && visit.camping == false && visit.stopCount > 0;
    //     // return visit.carType != '2P'&& visit.overnight == true;
    //
    //     if (visit.carId == '20155111035113-452') {
    //         mc1.selectedCar = visit;
    //     }
    //
    //     // return visit.carType != '2P' && visit.stopCount == 2 && visit.camping == false;
    //     // return visit.carId == '20150322080300-861';
    //     // return visit.carId == '20154519024544-322';
    //     // return visit.carId == '20161008061012-639';
    //     // return visit.carId == '20150204100226-134';
    //     // return visit.carId == '20153427103455-30';
    //     // return visit.carId == "20155705025759-63";
    //     // return visit.carId == '20162904122951-717' || visit.carId == '20150322080300-861' ;
    //     return visit.carType == '2P';
    // });

    mc1.eventHandler = new EventHandler();

    mc1.simulationManager = new SimulationManager(mc1.parkMap);
    // mc1.singleVisit = new CarTraceMap('mySingleVisit', 1720, 400);
    mc1.singleVisit = new CarTraceNetwork('mySingleVisit', 1720, 415);
    mc1.roadHeatMap = new RoadHeatmap(mc1.parkMap, null, mc1.eventHandler);

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
        // mc1.controller.changeGraphType('hour');
        mc1.controller.changeGraphType('week-day');
        //
    });
});

function renderParallelCoordinate() {
    let dimensions = {
        // startTime: {label: "Start Time"},
        // publicCar: {label: 'Public Car', type: 'String'},
        carType:  { label: 'Car Type', type: 'String'},
        camping: {label: 'Camping', type: 'String'},
        stopCount: {label: 'Stop Count', type: 'String'},
        stopDuration: {label: 'Stop Duration (hrs)'},
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
