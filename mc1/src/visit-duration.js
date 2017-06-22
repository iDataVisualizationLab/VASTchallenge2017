'use strict';
class VisitDuration {
    constructor(visitChart, parkMap, startDate, endDate, eventHandler, simulationManager) {
        this.visitChart = visitChart;
        this.parkMap = parkMap;

        let parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
        if (!startDate) {
            startDate = '2015-05-01 00:43:28';
        }

        if (!endDate) {
            endDate = '2016-05-31 23:56:06';
        }
        let minDate = parseTime(startDate);
        let maxDate = parseTime(endDate);

        this.visitChart.setXDomain(minDate, maxDate);
        this.visitChart.setYDomain(0, 20000);
        this.eventHandler = eventHandler;

        this.visitChart.setEventHandler(this.eventHandler);
        this.simulationManager = simulationManager;

        this.roadHeatMap = new RoadHeatmap(this.parkMap);

        this.init();
    }

    init() {
        this.events = [
            {name: 'mouseover'}
            // {name: 'mouseout'}
        ];

        // this.eventHandler.addEvent('mouseout', this.onLineMouseOut, this);
        this.eventHandler.addEvent('brushEnd', this.onBrushEnd, this);


        this.singleVisit = new SingleVisit('singleVisit', this.eventHandler);
        let self = this;
        this.visitChart.bindSvgEvent('click',function () {
            self.clearSetting();
        });

    }

    getVisibleLines() {
        return this.visitChart.getVisibleLines();
    }

    onBrushEnd(e) {
        console.log("Brush end event");
        console.log(e);

        let data = e.data;

        this.visitChart.setFilters([], data);

        this.visitChart.highLightVisits();

    }

    render(lines) {
        // parse the date / time
        let self = this;
        lines.forEach(function(line, index) {

            line.path.forEach(function (carPoint) {
                carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
            });

            let timeContext = d3.extent(line.path, function (carPoint) {
                return carPoint.time;
            });

            line.contextStartTime = timeContext[0];
            line.contextEndTime = timeContext[1];

            // split paths

            // let tmpPath = line.path;
            // let preCPoint;
            // let nextCPoint;
            // let i=0;
            // let smallPaths = [tmpPath[0]];
            //
            //
            // do {
            //
            //     i++;
            //     if (i >= tmpPath.length) {
            //         if (smallPaths.length > 0) {
            //             self.visitChart.addData(line, smallPaths);
            //         }
            //         break;
            //     }
            //
            //     preCPoint = smallPaths[smallPaths.length-1];
            //     nextCPoint = tmpPath[i];
            //
            //     if (preCPoint.getGate() == nextCPoint.getGate()) {
            //         self.visitChart.addData(line, smallPaths);
            //
            //         let delayPeriod = [preCPoint, nextCPoint];
            //         delayPeriod.sameLocation = true;
            //         self.visitChart.addData(line, delayPeriod, 'time', 'y');
            //
            //         if (i >= tmpPath.length-1) {
            //             break;
            //         }
            //
            //         smallPaths = [nextCPoint];
            //     }
            //     else {
            //         smallPaths.push(nextCPoint);
            //     }
            //
            //
            // }
            // while (true);
            self.visitChart.addData(line, line.path, 'time', 'y');

        });


        this.visitChart.renderChart(this.events);
        this.visitChart.renderAxis('Time', 'Visits');

        this.visitChart.updateTimeSelectors();
        this.visitChart.renderTimeRangeSelector();
    }

    onLineMouseOver(e) {

        let self = this;
        let line = e.line;

        self.singleVisit.render(line);

        self.visitChart.highlightSingleVisit(line.context.carId);

        console.log('event mouse over. Simulating: ' + line.context.carId);

    }

    onLineMouseOut(e) {

        let self = this;
        self.singleVisit.hide();
        self.visitChart.clearSetting();

    }

    viewHeatMap() {

        let self = this;
        let lines = self.visitChart.getVisibleLines();

        self.roadHeatMap.renderHeatMap(lines);

    }

    clearSetting() {
        this.visitChart.clearSetting();
    }
}
