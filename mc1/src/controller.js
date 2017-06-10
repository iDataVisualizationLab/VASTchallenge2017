var mc1 = mc1 || {};

mc1.controller = mc1.controller || {};

mc1.controller.clickEntranceType = function(self) {
    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior =  document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;
    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;


    if (!!mc1.visitDuration) {
        mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }

    if (!!mc1.firstDayDuration) {
        mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
};

mc1.controller.clickVehicleCategory = function(self) {

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;
    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;
    console.log("entranceType: " + entranceType + "; vehicleCategory: " + self.value + "; vehicleBehavior" + vehicleBehavior + "; velocityBehavior: " + velocityBehavior + "; ");


    if (!!mc1.visitDuration) {
        mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }

    if (!!mc1.firstDayDuration) {
        mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
};


mc1.controller.clickVehicleBehavior = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;
    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + self.value + "; velocityBehavior: " + velocityBehavior + "; ");


    if (!!mc1.visitDuration) {
        mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }

    if (!!mc1.firstDayDuration) {
        mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
};

mc1.controller.clickVelocityBehavior = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;
    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;
    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + vehicleBehavior + "; velocityBehavior: " + self.value + "; ");


    if (!!mc1.visitDuration) {
        mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }

    if (!!mc1.firstDayDuration) {
        mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
};

mc1.controller.clickDurationBehavior = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;
    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;
    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + vehicleBehavior + "; velocityBehavior: " + self.value + "; ");


    if (!!mc1.visitDuration) {
        mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }

    if (!!mc1.firstDayDuration) {
        mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
};

mc1.controller.simulateTraffic = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + vehicleBehavior + "; velocityBehavior: " + self.value + "; ");

    mc1.simulationManager.simulateTraffic(mc1.visitParser.getVisits());
};

mc1.controller.simulateTimeBlock = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + vehicleBehavior + "; velocityBehavior: " + self.value + "; ");

    mc1.simulationManager.simulateTrafficByTimeBlock(mc1.firstDayDuration.getVisits());
};

mc1.controller.onVelocityLimitChange = function(self) {

    console.log('change velocity limit');

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;

    let velocityLimit = self.value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;


    if (!!mc1.visitDuration) {
        mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }

    if (!!mc1.firstDayDuration) {
        mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
};

mc1.controller.onDurationThresholdChange = function(self) {

    console.log('change duration threshold');

    let days = self.value / 24;
    days = days.toFixed(1);

    document.getElementById('durationRangeValLabel').innerHTML = self.value > 48 ? days : self.value;
    document.getElementById('durationUnit').innerHTML = self.value > 48 ? "(days)" : "(hrs)";



    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;

    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;


    if (!!mc1.visitDuration) {
        mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }

    if (!!mc1.firstDayDuration) {
        mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
};

mc1.controller.clearRoad = function(self) {

    console.log('clear road map');
    mc1.parkMap.clearRoad();
};

mc1.controller.viewRoadHeatMap = function(self) {

    console.log('road heat map');

    mc1.visitDuration.viewHeatMap();
};

mc1.controller.changeGraphType = function(graphType) {
    switch (graphType) {
        case 'hour':
            let firstDaySpanChart = new Chart2D(mc1.visitDurationSvg, width, height, {id: 2, margin: margin, timeChart: true});
            mc1.firstDayDuration = new VisitTimeBlock(firstDaySpanChart, mc1.parkMap, null, null, mc1.eventHandler, mc1.simulationManager);
            mc1.firstDayDuration.setVisits(mc1.parsedVisits);
            mc1.firstDayDuration.render();
            break;
        case 'hour-spiral':
            mc1.spiral = new SpiralGraph(mc1.visitDurationSvg);
            mc1.spiral.setVisits(mc1.parsedVisits);
            mc1.spiral.render();
            break;
        case 'week-day':
            break;
        case 'on-year':
        default:
            let visitChart = new Chart2D(mc1.visitDurationSvg, width, height, {id: 1, margin: margin, timeChart: true});
            mc1.visitDuration = new VisitDuration(visitChart, mc1.parkMap, null, null, mc1.eventHandler, mc1.simulationManager);
            mc1.visitDuration.render(mc1.parsedVisits);

    }

};


