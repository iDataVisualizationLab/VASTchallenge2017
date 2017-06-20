// fromHour is 0 by default
// toHour is closed hour that the car get recorded within 24 hours.
'use strict';
class VisitTimeBlock extends VisitDuration {
    constructor(visitChart, parkMap, fromHour, toHour, eventHandler, simulationManager) {
        super(visitChart, parkMap, fromHour, toHour, eventHandler, simulationManager);

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

    setVisits (visits) {
        let lines = visits.map(function (l) {
            return l;
        });

        lines.sort(function (l1, l2) {
            return getTimeInDayBySeconds(l1.startTime) - getTimeInDayBySeconds(l2.startTime);
        });

        this.lines = lines;
    }

    getVisits () {
        return this.lines;
    }

    render() {
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


            let preCPoint;
            let nextCPoint;
            let i=0;
            let smallPaths = [tmpPath[0]];


            do {

                i++;
                if (i >= tmpPath.length) {
                    if (smallPaths.length > 1) {
                        self.visitChart.addData(line, smallPaths, 'x', 'y');
                    }
                    break;
                }

                preCPoint = smallPaths[smallPaths.length-1];
                nextCPoint = tmpPath[i];

                if (preCPoint.getGate() == nextCPoint.getGate()) {

                    if (!nextCPoint.getMapPoint().isEntrance()) {
                        if (smallPaths.length > 1) { // only create line if there are two points or above
                            self.visitChart.addData(line, smallPaths, 'x', 'y');
                        }

                        let delayPeriod = [preCPoint, nextCPoint];
                        delayPeriod.sameLocation = true;
                        self.visitChart.addData(line, delayPeriod, 'x', 'y');

                        if (i >= tmpPath.length-1) {
                            break;
                        }

                        smallPaths = [nextCPoint];
                    }
                    else {
                        // get out of park (two consecutive entrances
                        i ++;
                        smallPaths = [tmpPath[i]]; // reset
                    }


                }
                else {
                    smallPaths.push(nextCPoint);
                }


            }
            while (true);


            // count ++;
        });


        this.visitChart.renderChart(this.events);
        this.visitChart.renderAxis('Hours', 'Visits', "%H:%M");

        this.visitChart.updateTimeSelectors();
        this.visitChart.renderTimeRangeSelector();

    }
}

//
//
// var VisitTimeBlock = function VisitTimeBlock(visitChart, parkMap, fromHour, toHour, eventHandler, simulationManager) {
//
//     Object.assign(this, VisitDuration.prototype);
//     delete this.render; // remove extended functions to support override
//     // delete this.highlightVisitsByEntranceType; // remove extended functions to support override
//
//     this.visitChart = visitChart;
//     this.parkMap = parkMap;
//
//     if (!fromHour) {
//         fromHour = '00:00:01';
//     }
//
//     if (!toHour) {
//         toHour = '23:59:59';
//     }
//
//     this.parseTime = d3.timeParse("%H:%M:%S");
//
//     this.fromTime = this.parseTime(fromHour);
//     this.toTime = this.parseTime(toHour);
//
//     this.visitChart.setXDomain(this.fromTime, this.toTime);
//     this.visitChart.setYDomain(0, 20000);
//
//     this.eventHandler = eventHandler;
//     this.visitChart.setEventHandler(this.eventHandler);
//     this.simulationManager = simulationManager;
//
//     this.roadHeatMap = new RoadHeatmap(this.parkMap);
//
//     this.init();
//
// };
//
// /**
//  * Create new data and sort to render by time block
//  * @param visits
//  */
// VisitTimeBlock.prototype.setVisits = function setVisits (visits) {
//     let lines = visits.map(function (l) {
//         return l;
//     });
//
//     lines.sort(function (l1, l2) {
//         return getTimeInDayBySeconds(l1.startTime) - getTimeInDayBySeconds(l2.startTime);
//     });
//
//     this.lines = lines;
// };
//
// VisitTimeBlock.prototype.getVisits = function getVisits () {
//     return this.lines;
// };
//
//
// VisitTimeBlock.prototype.render = function render() {
//     // parse the date / time
//     let self = this;
//     let lines = this.lines;
//
//     let count = 0;
//     lines.forEach(function(line, index) {
//
//         // if (line.overnight == false || count > 3) {
//         //     return;
//         // }
//         let tmpPath = [];
//         let carPoint;
//         let firstDayInMilliseconds;
//         let endDayInMilliseconds;
//         let d;
//         let maxEndDate;
//         for(let i=0; i< line.path.length; i++) {
//             carPoint = line.path[i].clone();
//
//             if (i==0) {
//                 firstDayInMilliseconds = carPoint.getTimeInMiliseconds();
//                 maxEndDate = new Date(firstDayInMilliseconds);
//                 maxEndDate.setHours(23);
//                 maxEndDate.setMinutes(59);
//                 maxEndDate.setSeconds(59);
//                 maxEndDate.setMilliseconds(999);
//
//
//                 // endDayInMilliseconds = firstDayInMilliseconds + (getTimeInDayBySeconds(self.toTime) - getTimeInDayBySeconds(self.fromTime))*1000;
//                  endDayInMilliseconds = maxEndDate.getTime();
//
//             }
//
//             if (carPoint.getTimeInMiliseconds() < endDayInMilliseconds) {
//
//                 if (carPoint.getTimeInDayBySeconds() > getTimeInDayBySeconds(self.fromTime) && carPoint.getTimeInDayBySeconds() < getTimeInDayBySeconds(self.toTime)) {
//                     d = carPoint.getTimeInDayAsString();
//                     carPoint.x = self.parseTime(d);
//                     carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
//                     tmpPath.push(carPoint);
//                 }
//             }
//         }
//
//         // lengthen the line to tell overnight cars
//         //
//         if (tmpPath.length < line.path.length) {
//
//             let lastCarPoint = tmpPath[tmpPath.length-1];
//             let nextCarPoint = line.path[tmpPath.length];
//             let carPoint = new CarPoint(nextCarPoint.getMapPoint(), maxEndDate, lastCarPoint.velocity, null);
//             carPoint.setVirtual(true);
//
//             let d = carPoint.getTimeInDayAsString();
//             carPoint.x = self.parseTime(d);
//             carPoint.y = lastCarPoint.y;
//
//             tmpPath.push(carPoint);
//         }
//
//         // split paths
//         // self.visitChart.addData(line, tmpPath);
//         let timeContext = d3.extent(tmpPath, function (cp) {
//             return cp.x;
//         });
//
//         line.contextStartTime = timeContext[0];
//         line.contextEndTime = timeContext[1];
//
//
//         let preCPoint;
//         let nextCPoint;
//         let i=0;
//         let smallPaths = [tmpPath[0]];
//
//
//         do {
//
//             i++;
//             if (i >= tmpPath.length) {
//                 if (smallPaths.length > 1) {
//                     self.visitChart.addData(line, smallPaths, 'x', 'y');
//                 }
//                 break;
//             }
//
//             preCPoint = smallPaths[smallPaths.length-1];
//             nextCPoint = tmpPath[i];
//
//             if (preCPoint.getGate() == nextCPoint.getGate()) {
//
//                 if (!nextCPoint.getMapPoint().isEntrance()) {
//                     if (smallPaths.length > 1) { // only create line if there are two points or above
//                         self.visitChart.addData(line, smallPaths, 'x', 'y');
//                     }
//
//                     let delayPeriod = [preCPoint, nextCPoint];
//                     delayPeriod.sameLocation = true;
//                     self.visitChart.addData(line, delayPeriod, 'x', 'y');
//
//                     if (i >= tmpPath.length-1) {
//                         break;
//                     }
//
//                     smallPaths = [nextCPoint];
//                 }
//                 else {
//                     // get out of park (two consecutive entrances
//                     i ++;
//                     smallPaths = [tmpPath[i]]; // reset
//                 }
//
//
//             }
//             else {
//                 smallPaths.push(nextCPoint);
//             }
//
//
//         }
//         while (true);
//
//
//         // count ++;
//     });
//
//
//     this.visitChart.renderChart(this.events);
//     this.visitChart.renderAxis('Hours', 'Visits', "%H:%M");
//
//     this.visitChart.updateTimeSelectors();
//     this.visitChart.renderTimeRangeSelector();
//
// };
