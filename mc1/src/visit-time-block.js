// fromHour is 0 by default
// toHour is closed hour that the car get recorded within 24 hours.

var VisitTimeBlock = function VisitTimeBlock(visitChart, parkMap, fromHour, toHour, eventHandler) {

    Object.assign(this, VisitDuration.prototype);
    delete this.render; // remove extended functions to support override
    // delete this.highlightVisitsByEntranceType; // remove extended functions to support override

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

    this.eventHandler = eventHandler;
    this.visitChart.setEventHandler(this.eventHandler);

    this.init();

};

VisitTimeBlock.prototype.render = function render(lines) {
    // parse the date / time
    let self = this;
    lines = lines.map(function (l) {

        l.path = l.path.map(function (p) {
            return p;
        });

        return l;
    });

    lines.sort(function (l1, l2) {
        return l1.path[0].getTimeInDayBySeconds() - l2.path[0].getTimeInDayBySeconds();
    });

    lines.forEach(function(line, index) {

        let tmpPath = [];
        let carPoint;
        let firstDayInMilliseconds;
        let endDayInMilliseconds;
        let d;
        let maxEndDate;
        for(let i=0; i< line.path.length; i++) {
            carPoint = line.path[i].clone();

            if (i==0) {
                firstDayInMilliseconds = carPoint.getTimeInMiliseconds();
                maxEndDate = new Date(firstDayInMilliseconds);
                maxEndDate.setHours(23);
                maxEndDate.setMinutes(59);
                maxEndDate.setSeconds(59);
                maxEndDate.setMilliseconds(999);


                // endDayInMilliseconds = firstDayInMilliseconds + (getTimeInDayBySeconds(self.toTime) - getTimeInDayBySeconds(self.fromTime))*1000;
                 endDayInMilliseconds = maxEndDate.getTime();

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

        self.visitChart.addData(line, tmpPath);

    });

    this.visitChart.renderChart(this.events);
    this.visitChart.renderAxis('Hours', 'Visits', "%H:%M");
};
