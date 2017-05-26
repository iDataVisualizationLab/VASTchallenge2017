// fromHour is 0 by default
// toHour is closed hour that the car get recorded within 24 hours.

var VisitTimeBlock = function VisitTimeBlock(visitChart, parkMap, fromHour, toHour) {
    this.visitChart = visitChart;
    this.parkMap = parkMap;

    if (!fromHour) {
        fromHour = '00:00:01';
    }

    if (!toHour) {
        toHour = '23:59:59';
    }

    this.parseTime = d3.timeParse("%H:%M:%S");

    this.fromTime = this.parseTime(fromHour);
    this.toTime = this.parseTime(toHour);

    this.visitChart.setXDomain(this.fromTime, this.toTime);
    this.visitChart.setYDomain(0, 20000);

    this.init();

};

VisitTimeBlock.prototype.init = function init() {
    this.events = [
        {name: 'mouseover', callback: this.onLineMouseOver, params: this},
        // {name: 'mouseout', callback: this.onLineMouseOut, params: this}
    ];

};

VisitTimeBlock.prototype.render = function render(lines) {
    // parse the date / time
    let self = this;
    debugger;
    lines.forEach(function(line, index) {

        let tmpPath = [];
        let carPoint;
        let firstDayInMilliseconds;
        let endDayInMilliseconds;
        let d;
        for(let i=0; i< line.path.length; i++) {
            carPoint = line.path[i].clone();

            if (i==0) {
                firstDayInMilliseconds = carPoint.getTimeInMiliseconds();
                endDayInMilliseconds = firstDayInMilliseconds + (self.toTime - self.fromTime)*1000;
            }

            if (carPoint.getTimeInMiliseconds() < endDayInMilliseconds) {

                if (carPoint.getTimeInDayBySeconds() > getTimeInDayBySeconds(self.fromTime) && carPoint.getTimeInDayBySeconds() < getTimeInDayBySeconds(self.toTime)) {
                    d = carPoint.getTimeInDayAsString();
                    carPoint.x = self.parseTime(d);
                    carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
                    tmpPath.push(carPoint);
                }
            }
        }

        debugger;
        self.visitChart.addData(line, tmpPath);

    });

    this.visitChart.renderChart(this.events);
    this.visitChart.renderAxis('Hours', 'Visit', "%H:%M");
};