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
        {name: 'mouseover', callback: this.onLineMouseOver}
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

        self.visitChart.addData({carId: line.carId, carType: line.carType}, line.path, 'time', 'y', color);

    });

    this.visitChart.renderChart(this.events);
    this.visitChart.renderAxis('Time', 'Visit');
};

VisitDuration.prototype.onLineMouseOver = function onLineMouseOver(line) {
    debugger;
    console.log('event mouse over');
};