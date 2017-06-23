'use strict';
const ONE_DAY_HEIGHT = 100;
class VisitByDay {
    constructor(svg, parkMap,  eventHandler, simulationManager) {

        this.parseTime = d3.timeParse("%H:%M:%S");

        this.days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        this.charts = {};

        this.chartDatas = {};

        let self = this;

        this.days.forEach(function (d) {
           self.charts[d] = new Chart2D(svg, width, ONE_DAY_HEIGHT, {id: 3, margin: margin, timeChart: true});
        });


        // this.fromTime = this.parseTime(fromHour);
        // this.toTime = this.parseTime(toHour);
        //
        // this.visitChart.setXDomain(this.fromTime, this.toTime);
        // this.visitChart.setYDomain(0, 20000);
    }

    getDayStringFromIndex(idx) {
        return this.days[idx];
    }

    setVisits(visits) {
        let self = this;
        let cData;
        let dayString;

        visits.forEach(function (l) {
            l.startDay = l.startTime.getDay();
            l.endDay = l.endTime.getDay();

            dayString = self.getDayStringFromIndex(l.startDay);
            if (!self.chartDatas.hasOwnProperty(dayString)) {
                self.chartDatas[dayString] = [];
            }

            cData = self.chartDatas[dayString];
            cData.push(l);

            return l;
        });

        for(let day in self.chartDatas) {
            if (!self.chartDatas.hasOwnProperty(day)) {
                continue;
            }

            cData = self.chartDatas[day];
            cData.sort(function (l1, l2) {
                return getTimeInDayBySeconds(l1.startTime) - getTimeInDayBySeconds(l2.startTime);
            });
        }
    }

    render() {

    }
}

// var VisitByDay = function VisitByDay(visitChart, parkMap, eventHandler, simulationManager) {
//
//     Object.assign(this, VisitDuration.prototype);
//     delete this.render; // remove extended functions to support override
//     // delete this.highlightVisitsByEntranceType; // remove extended functions to support override
//
//     this.visitChart = visitChart;
//     this.parkMap = parkMap;
//
//     this.parseTime = d3.timeParse("%H:%M:%S");
//
//     this.visitChart.setXDomain(0, 200);
//     this.visitChart.setYDomain(0, 20000);
//
//     this.eventHandler = eventHandler;
//     this.visitChart.setEventHandler(this.eventHandler);
//     this.simulationManager = simulationManager;
//
//     this.init();
// };
//
//
// /**
//  * Create new data and sort to render by day and time
//  * @param visits
//  */
// VisitByDay.prototype.setVisits = function setVisits (visits) {
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
// VisitByDay.prototype.getVisits = function getVisits () {
//     return this.lines;
// };
//
//
// VisitByDay.prototype.render = function render() {
//     // parse the date / time
//     // let self = this;
//     // let lines = this.lines;
//     //
//     // lines.forEach(function(line, index) {
//     //
//     //     let tmpPath = [];
//     //     let carPoint;
//     //     let firstDayInMilliseconds;
//     //     let endDayInMilliseconds;
//     //     let d;
//     //     let maxEndDate;
//     //     for(let i=0; i< line.path.length; i++) {
//     //         carPoint = line.path[i].clone();
//     //
//     //         if (i==0) {
//     //             firstDayInMilliseconds = carPoint.getTimeInMiliseconds();
//     //             maxEndDate = new Date(firstDayInMilliseconds);
//     //             maxEndDate.setHours(23);
//     //             maxEndDate.setMinutes(59);
//     //             maxEndDate.setSeconds(59);
//     //             maxEndDate.setMilliseconds(999);
//     //
//     //
//     //             // endDayInMilliseconds = firstDayInMilliseconds + (getTimeInDayBySeconds(self.toTime) - getTimeInDayBySeconds(self.fromTime))*1000;
//     //             endDayInMilliseconds = maxEndDate.getTime();
//     //
//     //         }
//     //
//     //         if (carPoint.getTimeInMiliseconds() < endDayInMilliseconds) {
//     //
//     //             if (carPoint.getTimeInDayBySeconds() > getTimeInDayBySeconds(self.fromTime) && carPoint.getTimeInDayBySeconds() < getTimeInDayBySeconds(self.toTime)) {
//     //                 d = carPoint.getTimeInDayAsString();
//     //                 carPoint.x = self.parseTime(d);
//     //                 carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
//     //                 tmpPath.push(carPoint);
//     //             }
//     //         }
//     //     }
//     //
//     //     self.visitChart.addData(line, tmpPath);
//     //
//     // });
//     //
//     // this.visitChart.renderChart(this.events);
//     // this.visitChart.renderAxis('Hours', 'Visits', "%H:%M");
// };
