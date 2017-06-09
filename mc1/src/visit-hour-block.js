// fromHour is 0 by default
// toHour is closed hour that the car get recorded within 24 hours.

var VisitTimeBlock = function VisitTimeBlock(visitChart, parkMap, fromHour, toHour, eventHandler, simulationManager) {

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
    this.simulationManager = simulationManager;

    this.init();

};

/**
 * Create new data and sort to render by time block
 * @param visits
 */
VisitTimeBlock.prototype.setVisits = function setVisits (visits) {
    let lines = visits.map(function (l) {
        return l;
    });

    lines.sort(function (l1, l2) {
        return getTimeInDayBySeconds(l1.startTime) - getTimeInDayBySeconds(l2.startTime);
    });

    this.lines = lines;
};

VisitTimeBlock.prototype.getVisits = function getVisits () {
    return this.lines;
};


VisitTimeBlock.prototype.render = function render() {
    // parse the date / time
    let self = this;
    let lines = this.lines;

    let count = 0;
    lines.forEach(function(line, index) {

        // if (line.overnight == false || count > 3) {
        //     return;
        // }
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

        // lengthen the line to tell overnight cars
        //
        // if (tmpPath.length < line.path.length) {
        //
        //     let lastCarPoint = tmpPath[tmpPath.length-1];
        //     let carPoint = new CarPoint(null, maxEndDate, lastCarPoint.velocity, null);
        //     let d = carPoint.getTimeInDayAsString();
        //     carPoint.x = self.parseTime(d);
        //     carPoint.y = lastCarPoint.y;
        //
        //     tmpPath.push(carPoint);
        // }

        self.visitChart.addData(line, tmpPath);

        // count ++;
    });

    this.visitChart.renderChart(this.events);
    this.visitChart.renderAxis('Hours', 'Visits', "%H:%M");
};
