var VisitDuration = function VisitDuration(visitChart, parkMap) {

    this.visitChart = visitChart;
    this.parkMap = parkMap;

    this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

    let minDate = this.parseTime('2015-05-01 00:43:28');
    let maxDate = this.parseTime('2016-05-31 23:56:06');

    this.visitChart.setXDomain(minDate, maxDate);
    this.visitChart.setYDomain(0, 20000);

    this.init();

};


VisitDuration.prototype.init = function init() {
    this.events = [
        {name: 'mouseover', callback: this.onLineMouseOver, params: this},
        {name: 'mouseout', callback: this.onLineMouseOut, params: this}
    ];

};

VisitDuration.prototype.render = function render(lines) {

    let colorFunction = d3.scaleOrdinal(d3.schemeCategory10);
    // parse the date / time
    let self = this;
    lines.forEach(function(line, index) {

        let colorIdx = line.carType;
        let color = line.carType == '2P' ? '#000000' : colorFunction(colorIdx);
        line.path.forEach(function (timeGate) {
            // debugger;
            timeGate.time = self.parseTime(timeGate.time);
            timeGate.y = 50 + index;
        });

        self.visitChart.addData({carId: line.carId, carType: line.carType, color: color}, line.path, 'time', 'y');

    });

    this.visitChart.renderChart(this.events);
    this.visitChart.renderAxis('Time', 'Visit');
};

VisitDuration.prototype.onLineMouseOver = function onLineMouseOver(param, line) {
    console.log('event mouse over');

    let path = line.data;
    let startPoint;
    let endPoint;
    let steps;

    let self = param;

    for(let i=0; i< path.length-1; i++) {
        startPoint = path[i];
        endPoint = path[i+1];

        steps = self.parkMap.findSinglePathByName(startPoint.gate, endPoint.gate);
        self.parkMap.highLightPath(steps, line.context.color);
    }

};

VisitDuration.prototype.onLineMouseOut = function onLineMouseOver(param, line) {
    let path = line.data;
    let startPoint;
    let endPoint;
    let steps;

    let self = param;

    for(let i=0; i< path.length-1; i++) {
        startPoint = path[i];
        endPoint = path[i+1];

        steps = self.parkMap.findSinglePathByName(startPoint.gate, endPoint.gate);
        self.parkMap.clearPath(steps);
    }
};