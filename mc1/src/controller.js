var mc1 = mc1 || {};

mc1.controller = mc1.controller || {};

mc1.controller.clickEntranceType = function(self) {
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior =  document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;
    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;

    mc1.visitDuration.highlightVisitsByEntranceType(self.value, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    mc1.firstDayDuration.highlightVisitsByEntranceType(self.value, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
};

mc1.controller.clickVehicleCategory = function(self) {

    let entranceType = document.getElementById('entranceType').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;
    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;
    console.log("entranceType: " + entranceType + "; vehicleCategory: " + self.value + "; vehicleBehavior" + vehicleBehavior + "; velocityBehavior: " + velocityBehavior + "; ");


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, self.value, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, self.value, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
};


mc1.controller.clickVehicleBehavior = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;
    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;
    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + self.value + "; velocityBehavior: " + velocityBehavior + "; ");


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, self.value, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, self.value, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
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


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
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


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
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


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
};

mc1.controller.onDurationThresholdChange = function(self) {

    console.log('change velocity limit');

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;

    let velocityLimit = document.getElementById('velocityLimit').value;
    let durationBehavior =  document.getElementById('durationBehavior').value;
    let durationThreshold = document.getElementById('durationThreshold').value;


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
};

mc1.controller.clearRoad = function(self) {

    console.log('clear road map');
    mc1.parkMap.clearRoad();
};

mc1.controller.viewRoadHeatMap = function(self) {

    console.log('road heat map');

    mc1.visitDuration.viewHeatMap();
};

// mc1.controller.changeRoadHitmapTime = function (self) {
//         console.log(self.value);
//
//         mc1.roadHitmap.renderVisits();
// };