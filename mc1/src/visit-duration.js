var VisitDuration = function VisitDuration(visitChart) {

    this.visitChart = visitChart;
    this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

    let minDate = this.parseTime('2015-05-01 00:43:28');
    let maxDate = this.parseTime('2016-05-31 23:56:06');

    this.visitChart.setXDomain(minDate, maxDate);
    this.visitChart.setYDomain(0, 20000);
};


VisitDuration.prototype.init = function init(data) {


};
VisitDuration.prototype.render = function render(lines) {

    let colorFunction = d3.scaleOrdinal(d3.schemeCategory10);
    // parse the date / time
    let parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    let self = this;
    lines.forEach(function(line, index) {

        let colorIdx = line.carType;
        let color = line.carType == '2P' ? '#000000' : colorFunction(colorIdx);
        line.path.forEach(function (timeGate) {
            // debugger;
            timeGate.time = self.parseTime(timeGate.time);
            timeGate.y = 50 + index;
        });

        self.visitChart.addData(line.path, 'time', 'y', color);

    });

    this.visitChart.renderChart();
    this.visitChart.renderAxis('Time', 'Visit');
};