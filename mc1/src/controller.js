var mc1 = mc1 || {};

mc1.controller = mc1.controller || {};
mc1.controller.currentHeatMapIndex = 0;
mc1.controller.currentVisTypeIndex = 0;

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

            // everyday heat map
            d3.timeout(function () {
                mc1.dailyHeatMap = new GateEveryDayHeatMap('gateEveryDayHeatMap', 1720, 480);
                mc1.dailyHeatMap.setData(mc1.parsedVisits);
                mc1.dailyHeatMap.render();
            });

            // entire year graph
            d3.timeout(function () {
                let firstDaySpanChart = new VisitChart2D(mc1.firstDaySpanSvg, width, height, {id: 2, margin: margin, timeChart: true});
                mc1.firstDayDuration = new VisitTimeBlock(firstDaySpanChart, mc1.parkMap, null, null, mc1.eventHandler, mc1.simulationManager, mc1.singleVisit);
                mc1.firstDayDuration.setVisits(mc1.parsedVisits);
                mc1.firstDayDuration.render();
            });

            // hour graph
            d3.timeout(function () {
                let visitChart = new VisitChart2D(mc1.visitDurationSvg, width, height, {id: 1, margin: margin, timeChart: true});
                mc1.visitDuration = new VisitDuration(visitChart, mc1.parkMap, null, null, mc1.eventHandler, mc1.simulationManager, mc1.singleVisit);
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


            let heatMapHeight = 400;

            // density map by day and hour
            d3.timeout(function () {
                mc1.densityHeatMap = new DensityHourlyGateHeatMap('hourlyLocationDensityHeatMap', 720, heatMapHeight);
                mc1.densityHeatMap.setData(mc1.parsedVisits);
                mc1.densityHeatMap.render();
            });

            // spatial heat map by week day
            d3.timeout(function () {
                mc1.weekDayHeatMap = new DensityGateWeekDayHeatMap('weekDayLocationDensityHeatMap', 500, heatMapHeight);
                mc1.weekDayHeatMap.setData(mc1.parsedVisits);
                mc1.weekDayHeatMap.render();
            });

            // spatial heat map by month
            d3.timeout(function () {
                mc1.monthlyHeatMap = new DensityGateMonthHeatMap('monthlyLocationDensityHeatMap', 500, heatMapHeight);
                mc1.monthlyHeatMap.setData(mc1.parsedVisits);
                mc1.monthlyHeatMap.render();
            });


            this.viewDivOption('heatMapStats');
            this.viewHeatMap(0);

            // arrival week day by hour heat map
            // d3.timeout(function () {
            //     mc1.arrivalWdHHeatMap = new ArrivalWeekDayHourHeatMap('weekDayHourArrivalHeatMap', 720, 360);
            //     mc1.arrivalWdHHeatMap.setData(mc1.parsedVisits);
            //     mc1.arrivalWdHHeatMap.render();
            // });

            d3.timeout(function () {
                mc1.arrivalWdHHeatMap = new ArrivalHourlyGateHeatMap('hourlyLocationArrivalHeatMap', 720, heatMapHeight);
                mc1.arrivalWdHHeatMap.setData(mc1.parsedVisits);
                mc1.arrivalWdHHeatMap.render();
            });

            d3.timeout(function () {
                mc1.arrivalWdHHeatMap = new ArrivalWeekDayGateHeatMap('weekDayLocationArrivalHeatMap', 500, heatMapHeight);
                mc1.arrivalWdHHeatMap.setData(mc1.parsedVisits);
                mc1.arrivalWdHHeatMap.render();
            });

            d3.timeout(function () {
                mc1.arrivalWdHHeatMap = new ArrivalMonthlyGateHeatMap('monthlyLocationArrivalHeatMap', 500, heatMapHeight);
                mc1.arrivalWdHHeatMap.setData(mc1.parsedVisits);
                mc1.arrivalWdHHeatMap.render();
            });


            // departure heat map
            d3.timeout(function () {
                mc1.arrivalWdHHeatMap = new DepartureHourlyGateHeatMap('hourlyLocationDepartureHeatMap', 720, heatMapHeight);
                mc1.arrivalWdHHeatMap.setData(mc1.parsedVisits);
                mc1.arrivalWdHHeatMap.render();
            });

            d3.timeout(function () {
                mc1.arrivalWdHHeatMap = new DepartureWeekDayGateHeatMap('weekDayLocationDepartureHeatMap', 500, heatMapHeight);
                mc1.arrivalWdHHeatMap.setData(mc1.parsedVisits);
                mc1.arrivalWdHHeatMap.render();
            });

            d3.timeout(function () {
                mc1.arrivalWdHHeatMap = new DepartureMonthlyGateHeatMap('monthlyLocationDepartureHeatMap', 500, heatMapHeight);
                mc1.arrivalWdHHeatMap.setData(mc1.parsedVisits);
                mc1.arrivalWdHHeatMap.render();
            });


            // visit network
            d3.timeout(function () {
                mc1.visitNetwork = new VisitNetwork('visit-network', 520, 410, {}, mc1.eventHandler);
                mc1.visitNetwork.setData(mc1.parsedVisits);
                mc1.visitNetwork.render();
            });

            this.viewVisType(1);



    }

};

mc1.controller.viewStopHeatMap = function() {
    
    let chart = mc1.firstDayDuration || mc1.visitDuration;
    chart.viewVisitHeatMap();

};


mc1.controller.viewHeatMap = function(idx) {
    if (idx == null || isNaN(idx)) {
        idx = 0;
    }
    let maps = ['heatmap', 'arrivalHeatMap', 'departureHeatMap'];

    this.currentHeatMapIndex = this.currentHeatMapIndex + idx;

    this.currentHeatMapIndex = Math.abs(this.currentHeatMapIndex) % maps.length;

    let mapType = maps[this.currentHeatMapIndex];

    maps.forEach(function (mapId) {
        let dp = mapId == mapType ? 'initial' : 'none';

        d3.select('body').select('#' + mapId).style('display', dp);
    });

};


mc1.controller.viewVisType = function(idx) {
    if (idx == null || isNaN(idx)) {
        idx = 0;
    }
    let visTypes = ['timeVis', 'spatialVis'];

    this.currentVisTypeIndex = this.currentVisTypeIndex + idx;

    this.currentVisTypeIndex = Math.abs(this.currentVisTypeIndex) % visTypes.length;

    let type = visTypes[this.currentVisTypeIndex];

    visTypes.forEach(function (typeId) {
        let dp = typeId == type ? 'initial' : 'none';

        d3.select('body').select('#' + typeId).style('display', dp);
    });

};

mc1.controller.viewDivOption = function(divId) {
    let divIds = ['mySingleVisit', 'heatMapStats'];
    let dp;
    divIds.forEach(function (id) {

        dp = (id == divId) ? 'initial' : 'none';

        d3.select('body').select('#' + id).style('display', dp);
    })
};
