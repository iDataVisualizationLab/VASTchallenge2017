var mc1 = mc1 || {};

mc1.controller = mc1.controller || {};

mc1.controller.clickEntranceType = function(self) {
    let vehicleCategory = document.getElementById('vehicleCategory').value;
    let vehicleBehavior =  document.getElementById('vehicleBehavior').value;

    mc1.visitDuration.highlightVisitsByEntranceType(self.value, vehicleCategory, vehicleBehavior);
};

mc1.controller.clickVehicleCategory = function(self) {
    console.log(self.name + "=" + self.value + "-" + self.checked);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleBehavior = document.getElementById('vehicleBehavior').value;

    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, self.value, vehicleBehavior);
};


mc1.controller.clickVehicleBehavior = function(self) {
    console.log(self.name + "=" + self.value + "-" + self.checked);

    let entranceType = document.getElementById('entranceType').value;
    let vehicleCategory = document.getElementById('vehicleCategory').value;

    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, self.value);
};

mc1.controller.changeRoadHitmapTime = function (self) {
        console.log(self.value);

        mc1.roadHitmap.renderVisits();
};