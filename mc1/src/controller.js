var mc1 = mc1 || {};

mc1.controller = mc1.controller || {};

mc1.controller.clickEntranceType = function(self) {

    let vehicleCategory = document.querySelector('input[name="vehicleCategory"]:checked').value;
    let vehicleBehavior =  document.querySelector('input[name="vehicleBehavior"]:checked').value;

    console.log(self.name + "=" + self.value + "-" + self.checked + "; vehicle cate: " + vehicleCategory);

    mc1.visitDuration.highlightVisitsByEntranceType(self.value, vehicleCategory, vehicleBehavior);
};

mc1.controller.clickVehicleCategory = function(self) {
    console.log(self.name + "=" + self.value + "-" + self.checked);

    let entranceType = document.querySelector('input[name="entranceType"]:checked').value;
    let vehicleBehavior = document.querySelector('input[name="vehicleBehavior"]:checked').value;

    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, self.value, vehicleBehavior);
};


mc1.controller.clickVehicleBehavior = function(self) {
    console.log(self.name + "=" + self.value + "-" + self.checked);

    let entranceType = document.querySelector('input[name="entranceType"]:checked').value;
    let vehicleCategory = document.querySelector('input[name="vehicleCategory"]:checked').value;


    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, vehicleCategory, self.value);
};