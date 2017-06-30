var mc1 = mc1 || {};

mc1.controller = mc1.controller || {};

mc1.controller.simulateTraffic = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let campingBehavior = document.getElementById('campingBehavior').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; campingBehavior: " + campingBehavior + "; velocityBehavior: " + self.value + "; ");

    let myChart = mc1.visitDuration || mc1.firstDayDuration;
    let visibleLines = myChart.getVisibleLines();

    mc1.simulationManager.simulateTraffic(visibleLines);
};

mc1.controller.simulateTimeBlock = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; campingBehavior: " + vehicleBehavior + "; velocityBehavior: " + self.value + "; ");

    mc1.simulationManager.simulateTrafficByTimeBlock(mc1.firstDayDuration.getVisits());
};


mc1.controller.clearRoad = function(self) {

    console.log('clear road map');
    mc1.parkMap.clearRoad();
};

mc1.controller.viewRoadHeatMap = function(self) {

    console.log('road heat map');

    let myChart = mc1.firstDayDuration || mc1.visitDuration;
    myChart.viewHeatMap();
};

mc1.controller.stopSimulation = function() {

    console.log('Stop simulation');

    mc1.simulationManager.reset();

};

mc1.controller.reset = function() {

    let chart = mc1.firstDayDuration || mc1.visitDuration;
    chart.clearSetting();

};

mc1.controller.changeGraphType = function(graphType) {
    switch (graphType) {
        case 'hour':
            let firstDaySpanChart = new VisitChart2D(mc1.firstDaySpanSvg, width, height, {id: 2, margin: margin, timeChart: true});
            mc1.firstDayDuration = new VisitTimeBlock(firstDaySpanChart, mc1.parkMap, null, null, mc1.eventHandler, mc1.simulationManager);
            mc1.firstDayDuration.setVisits(mc1.parsedVisits);
            mc1.firstDayDuration.render();

            delete mc1.visitDuration;

            break;
        case 'hour-spiral':
            mc1.spiral = new SpiralGraph(mc1.firstDaySpanSvg);
            mc1.spiral.setVisits(mc1.parsedVisits);
            mc1.spiral.render();
            break;
        case 'on-year':
        case 'week-day':
        default:
            //
            // d3.timeout(function () {
            //     mc1.dayOfWeekChart = new VisitByDay(mc1.firstDaySpanSvg,  mc1.parkMap, mc1.eventHandler, mc1.simulationManager, width, height, {margin: margin, timeChart: true});
            //     mc1.dayOfWeekChart.setVisits(mc1.parsedVisits);
            //     mc1.dayOfWeekChart.render();
            // });


            // entire year graph
            d3.timeout(function () {
                let firstDaySpanChart = new VisitChart2D(mc1.firstDaySpanSvg, width, height, {id: 2, margin: margin, timeChart: true});
                mc1.firstDayDuration = new VisitTimeBlock(firstDaySpanChart, mc1.parkMap, null, null, mc1.eventHandler, mc1.simulationManager);
                mc1.firstDayDuration.setVisits(mc1.parsedVisits);
                mc1.firstDayDuration.render();
            });

            // hour graph
            d3.timeout(function () {
                let visitChart = new VisitChart2D(mc1.visitDurationSvg, width, height, {id: 1, margin: margin, timeChart: true});
                mc1.visitDuration = new VisitDuration(visitChart, mc1.parkMap, null, null, mc1.eventHandler, mc1.simulationManager);
                mc1.visitDuration.setVisits(mc1.parsedVisits);
                mc1.visitDuration.render();
            });



            //delete mc1.firstDayDuration;

            // heatmap
            // d3.timeout(function () {
            //     mc1.arrivalHeatMap = new DayHourHeatMap('arrivalHeatMap', 720, 360);
            //     mc1.arrivalHeatMap.setData(mc1.parsedVisits);
            //     mc1.arrivalHeatMap.render();
            // });


            // density map by day and hour
            d3.timeout(function () {
                mc1.densityHeatMap = new DensityHeatMap('densityHeatMap', 720, 280);
                mc1.densityHeatMap.setData(mc1.parsedVisits);
                mc1.densityHeatMap.render();
            });

            // stop heat map by hour
            // d3.timeout(function () {
            //     mc1.gateTimetHeatMap = new GateTimeHeatMap('gateTimeHeatMap', 720, 510);
            //     mc1.gateTimetHeatMap.setData(mc1.parsedVisits);
            //     mc1.gateTimetHeatMap.render();
            // });

            // spatial heat map by week day
            d3.timeout(function () {
                mc1.weekDayHeatMap = new GateWeekDayHeatMap('gateDayHeatMap', 500, 510);
                mc1.weekDayHeatMap.setData(mc1.parsedVisits);
                mc1.weekDayHeatMap.render();
            });

            // spatial heat map by month
            d3.timeout(function () {
                mc1.monthlyHeatMap = new GateMonthHeatMap('gateMonthHeatMap', 500, 510);
                mc1.monthlyHeatMap.setData(mc1.parsedVisits);
                mc1.monthlyHeatMap.render();
            });

            // everyday heat map
            d3.timeout(function () {
                mc1.dailyHeatMap = new GateEveryDayHeatMap('gateEveryDayHeatMap', 1720, 510);
                mc1.dailyHeatMap.setData(mc1.parsedVisits);
                mc1.dailyHeatMap.render();
            });
    }

};

mc1.controller.viewStopHeatMap = function() {
    
    let chart = mc1.firstDayDuration || mc1.visitDuration;
    chart.viewVisitHeatMap();

};


