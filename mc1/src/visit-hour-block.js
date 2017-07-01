// fromHour is 0 by default
// toHour is closed hour that the car get recorded within 24 hours.
'use strict';
class VisitTimeBlock extends VisitDuration {
    constructor(visitChart, parkMap, fromHour, toHour, eventHandler, simulationManager, singleVisit) {
        super(visitChart, parkMap, fromHour, toHour, eventHandler, simulationManager, singleVisit);

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
    }

    init() {

        super.init();

    }


    setVisits (visits) {
        let lines = visits.map(function (l) {
            return l;
        });

        lines.sort(function (l1, l2) {
            return getTimeInDayBySeconds(l1.startTime) - getTimeInDayBySeconds(l2.startTime);
        });

        super.setVisits(lines);
    }

    getVisits () {
        return this.lines;
    }

    handleChartContextTime() {

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
                // carPoint = line.path[i].clone();
                carPoint = line.path[i];
                carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line

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
                        // carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
                        tmpPath.push(carPoint);
                    }
                }
            }

            // lengthen the line to tell overnight cars
            //
            if (tmpPath.length < line.path.length) {

                let lastCarPoint = tmpPath[tmpPath.length-1];
                let nextCarPoint = line.path[tmpPath.length];
                let carPoint = new CarPoint(nextCarPoint.getMapPoint(), maxEndDate, lastCarPoint.velocity, null);
                carPoint.setVirtual(true);

                let d = carPoint.getTimeInDayAsString();
                carPoint.x = self.parseTime(d);
                carPoint.y = lastCarPoint.y;

                tmpPath.push(carPoint);
            }

            // split paths
            // self.visitChart.addData(line, tmpPath);
            let timeContext = d3.extent(tmpPath, function (cp) {
                return cp.x;
            });

            line.contextStartTime = timeContext[0];
            line.contextEndTime = timeContext[1];

            let detailLines = splitPathWithStopByGate(line, tmpPath);
            if (detailLines.length > 0) {
                detailLines.forEach(function (l) {

                    self.visitChart.addData(line, l.path, 'x', 'y');

                });
            }
        });
    }

    render() {
        // parse the date / time
        this.handleChartContextTime();


        this.visitChart.renderChart(this.events);
        this.visitChart.renderAxis('Hours', 'Visits', "%H:%M");

        this.visitChart.updateTimeSelectors();
        this.visitChart.renderTimeRangeSelector();

    }
}
