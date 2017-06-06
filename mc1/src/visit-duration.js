var VisitDuration = function VisitDuration(visitChart, parkMap, startDate, endDate, eventHandler, simulationManager) {

    this.visitChart = visitChart;
    this.parkMap = parkMap;

    let parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    if (!startDate) {
        startDate = '2015-05-01 00:43:28';
    }

    if (!endDate) {
        endDate = '2016-05-31 23:56:06';
    }
    let minDate = parseTime(startDate);
    let maxDate = parseTime(endDate);

    this.visitChart.setXDomain(minDate, maxDate);
    this.visitChart.setYDomain(0, 20000);
    this.eventHandler = eventHandler;

    this.visitChart.setEventHandler(this.eventHandler);
    this.simulationManager = simulationManager;

    this.roadHeatMap = new RoadHeatmap(this.parkMap);

    this.init();

};


VisitDuration.prototype.init = function init() {
    this.events = [
        {name: 'mouseover'},
        {name: 'mouseout'}
    ];

    this.eventHandler.addEvent('mouseover', this.onLineMouseOver, this);
    this.eventHandler.addEvent('mouseout', this.onLineMouseOut, this);

};

VisitDuration.prototype.render = function render(lines) {
    // parse the date / time
    let self = this;

    // this.visitChart.setYDomain(0, Math.round(lines.length + lines.length / 10));

    lines.forEach(function(line, index) {

        line.path.forEach(function (carPoint) {
            carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
        });

        self.visitChart.addData(line, line.path, 'time', 'y');

    });

    this.visitChart.renderChart(this.events);
    this.visitChart.renderAxis('Time', 'Visits');
};

VisitDuration.prototype.onLineMouseOver = function onLineMouseOver(e) {


    let self = this;
    let line = e.line;

    self.visitChart.highlightSingleVisit(line.context.carId);

    console.log('event mouse over. Simulating: ' + line.context.carId);


    self.simulationManager.simulateCarMovement(line);

};

VisitDuration.prototype.onLineMouseOut = function onLineMouseOver(e) {

    let self = this;
    self.visitChart.clearSetting();

};

VisitDuration.prototype.viewHeatMap = function viewHeatMap() {

    let self = this;
    let lines = self.visitChart.getVisibleLines();

    self.roadHeatMap.renderHeatMap(lines);

};

VisitDuration.prototype.highlightVisitsByEntranceType = function highlightVisitsByEntranceType (entranceType, vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {

    if (campingBehavior == 'behavior-camping') {
        campingBehavior =  true;
    }else if ( campingBehavior == 'behavior-no-camping') {
        campingBehavior = false;
    }

    if (!velocityLimit) {
        velocityLimit = ParkMap.SPEED_LIMIT_EXTRA_10;
    }

    velocityLimit = +velocityLimit;
    durationThreshold = +durationThreshold;

    if (entranceType == 'multi-entrances') {
        this.visitChart.highLightMultiVisits(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
    else if (entranceType == 'single-entrance-over-night') {
        this.visitChart.highLightSingleVisitOvernight(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
    else if (entranceType == 'no-exit') {
        this.visitChart.highLightNoExit(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
    else if (entranceType == 'single-entrance-no-over-night') {
        this.visitChart.highLightSingleEntranceNotOvernightVisit(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
    else {
        this.visitChart.highLightAllTypesOfVisit(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);

    }
};