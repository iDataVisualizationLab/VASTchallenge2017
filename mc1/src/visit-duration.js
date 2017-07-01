'use strict';
class VisitDuration {
    constructor(visitChart, parkMap, startDate, endDate, eventHandler, simulationManager, singleVisit) {
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

        this.singleVisit = singleVisit;

        this.init();


    }

    setName(name) {
        this.name = name;
    }

    init() {
        this.events = [
            // {name: 'mouseover', handler: this.onLineMouseOver, context: this}
            {name: 'mouseover'}
            // {name: 'mouseout'}
        ];

        // this.eventHandler.addEvent('mouseout', this.onLineMouseOut, this);
        this.eventHandler.addEvent('brushEnd', this.onBrushEnd, this); // brush end from PC
        this.eventHandler.addEvent('timeChange', this.onBrushEnd, this); // time change from everyday selection
        this.eventHandler.addEvent('mouseover', this.onLineMouseOver, this);
        this.eventHandler.addEvent('clearSetting', this.clearSetting, this);

        let self = this;
        this.visitChart.bindSvgEvent('click',function () {
            self.singleVisit.hide();

            self.eventHandler.fireEvent('clearSetting');
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

    setXDomain(min, max) {
        this.visitChart.setXDomain(min, max);
    }

    setYDomain(min, max) {
        this.visitChart.setYDomain(min, max);
    }

    setVisits (visits) {

        this.lines = visits;

        this.visitChart.setYDomain(0, Math.ceil(visits.length + 0.05*visits.length));

    }

    handleChartContextTime() {

        let self = this;

        let lines = this.lines;
        lines.forEach(function(line, index) {

            line.path.forEach(function (carPoint) {
                carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
            });

            let timeContext = d3.extent(line.path, function (carPoint) {
                return carPoint.time;
            });

            // line.contextStartTime = timeContext[0];
            // line.contextEndTime = timeContext[1];

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
    }

    render() {
        // parse the date / time
        this.handleChartContextTime();

        this.visitChart.renderChart(this.events);
        this.visitChart.renderAxis('Time', 'Visits', '%b');

        this.visitChart.updateTimeSelectors();
        this.visitChart.renderTimeRangeSelector();
    }

    onLineMouseOver(e) {

        let self = this;
        let line = e.line;
        // let line = {context: mc1.selectedCar};

        self.visitChart.highlightSingleVisit(line.context.carId);

        if (self.singleVisit.getCarId() != line.context.carId) {
            self.singleVisit.setData(line.context);
            self.singleVisit.render();

            console.log('event mouse over. rendering: ' + line.context.carId);

        }
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

    viewVisitHeatMap() {
        let self = this;
        let lines = self.visitChart.getVisibleLines();

        self.roadHeatMap.renderVisitHeatMap(lines);
    }
}
