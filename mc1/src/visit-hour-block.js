// fromHour is 0 by default
// toHour is closed hour that the car get recorded within 24 hours.
'use strict';
class VisitTimeBlock extends VisitDuration {
    constructor(visitChart, parkMap, fromHour, toHour, eventHandler, simulationManager, singleVisit, roadHeatMap) {
        super(visitChart, parkMap, fromHour, toHour, eventHandler, simulationManager, singleVisit, roadHeatMap);

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
        // let lines = visits.map(function (l) {
        //     return l;
        // });

        let lines = [];
        let tmpVisit;

        let  preCp, preMp, mp, j =0, countEntrance = 0;
        let myVisit, paths;

        for(let i=0; i< visits.length; i++) {
            tmpVisit = visits[i];
            if (tmpVisit.entranceCount < 3) {
                lines.push(tmpVisit);
                continue;
            }

            // break multi entrance lines here

            paths = [];
            tmpVisit.path.forEach(function (cp, index) {


                mp = cp.getMapPoint();

                if (mp.isEntrance()) {
                    countEntrance ++;
                }

                if (mp.isEntrance() && countEntrance % 2 == 1) { // enter
                    paths = [cp];
                }

                if (!mp.isEntrance()) {
                    paths.push(cp);
                }


                if (cp.getGate() && mp.isEntrance() && countEntrance % 2 == 0) { // exit
                    paths.push(cp);

                    myVisit = Object.assign({}, tmpVisit); // clone object
                    myVisit.startTime = paths[0].getTime();
                    myVisit.endTime = cp.getTime();

                    myVisit.path = paths;
                    lines.push(myVisit);
                    paths = []; // reset
                }

                preCp = cp;

            })

        }

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
            let carPoint, mp;
            let firstDayInMilliseconds;
            let endDayInMilliseconds;
            let d;
            let maxEndDate;
            let specialGateCount = 0;
            let tmpPaths = []; // multiple entrances on multiple days

            for(let i=0; i< line.path.length; i++) {
                // carPoint = line.path[i].clone();
                carPoint = line.path[i];
                carPoint.y = 1 + index + tmpPaths.length; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
                mp = carPoint.getMapPoint();
                if (mp.isEntrance() || mp.isRangerBase()) {
                    specialGateCount ++;
                }

                if ((mp.isEntrance() || mp.isRangerBase()) && specialGateCount % 2 == 1) { // enter Preserve
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

                if ((mp.isEntrance() || mp.isRangerBase()) && specialGateCount % 2 == 0) { // exit Preserve
                    tmpPaths.push(tmpPath);
                    tmpPath = [];
                }
            }

            if (tmpPath.length > 0) { // no exit situation
                tmpPaths.push(tmpPath);
                tmpPath = [];
            }

            let multiEntrance = tmpPaths.length > 1;
            let l;

            tmpPaths.forEach(function (tmpPath) {
                // lengthen the line to tell overnight cars
                //
                count ++;
                l = !!multiEntrance ? Object.assign({}, line) : line;
                let lastCarPoint = tmpPath[tmpPath.length-1];

                if (tmpPath.length < l.path.length && !lastCarPoint.getMapPoint().isEntrance() && !lastCarPoint.getMapPoint().isRangerBase()) {

                    let nextCarPoint = l.path[tmpPath.length];
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

                l.contextStartTime = timeContext[0];
                l.contextEndTime = timeContext[1];

                let detailLines = splitPathWithStopByGate(l, tmpPath);
                if (detailLines.length > 0) {
                    detailLines.forEach(function (splitPath) {

                        self.visitChart.addData(l, splitPath.path, 'x', 'y');

                    });
                }
            })
        });

        this.setYDomain(0, 1 + Math.ceil(1.05 * count));
    }

    render() {
        // parse the date / time
        this.handleChartContextTime();
        // this.visitChart.sortData();


        this.visitChart.renderChart(this.events);
        this.visitChart.renderAxis('Hours', 'Visits', "%H:%M");

        this.visitChart.updateTimeSelectors();
        this.visitChart.renderTimeRangeSelector();

    }
}
