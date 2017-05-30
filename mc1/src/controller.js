var mc1 = mc1 || {};

mc1.controller = mc1.controller || {};

mc1.controller.clickEntranceType = function(self) {
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior =  document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;

    mc1.visitDuration.highlightVisitsByEntranceType(self.value, vehicleCategory, vehicleBehavior, velocityBehavior);
    mc1.firstDayDuration.highlightVisitsByEntranceType(self.value, vehicleCategory, vehicleBehavior, velocityBehavior);
};

mc1.controller.clickVehicleCategory = function(self) {

    let entranceType = document.getElementById('entranceType').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + self.value + "; vehicleBehavior" + vehicleBehavior + "; velocityBehavior: " + velocityBehavior + "; ");


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, self.value, vehicleBehavior, velocityBehavior);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, self.value, vehicleBehavior, velocityBehavior);
};


mc1.controller.clickVehicleBehavior = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let velocityBehavior =  document.getElementById('velocityBehavior').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + self.value + "; velocityBehavior: " + velocityBehavior + "; ");


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, self.value, velocityBehavior);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, self.value, velocityBehavior);
};

mc1.controller.clickVelocityBehavior = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + vehicleBehavior + "; velocityBehavior: " + self.value + "; ");


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, self.value);
    mc1.firstDayDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, vehicleBehavior, self.value);
};

mc1.controller.simulateTraffic = function(self) {
    console.log(self.name + "=" + self.value);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;

    console.log("entranceType: " + entranceType + "; vehicleCategory: " + vehicleCategory + "; vehicleBehavior: " + vehicleBehavior + "; velocityBehavior: " + self.value + "; ");

    mc1.simulationManager.simulateTraffic(mc1.visitParser.getVisits());
};

// mc1.controller.changeRoadHitmapTime = function (self) {
//         console.log(self.value);
//
//         mc1.roadHitmap.renderVisits();
// };