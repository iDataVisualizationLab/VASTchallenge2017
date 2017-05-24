var mc1 = mc1 || {};

mc1.controller = mc1.controller || {};

mc1.controller.clickEntranceType = function(self) {

    let vehicleCategory = document.querySelector('input[name="vehicleCategory"]:checked').value;

    console.log(self.name + "=" + self.value + "-" + self.checked + "; vehicle cate: " + vehicleCategory);

    mc1.visitDuration.highlightVisitsByEntranceType(self.value, vehicleCategory);
};

mc1.controller.clickVehicleCategory = function(self) {
    console.log(self.name + "=" + self.value + "-" + self.checked);

    let entranceType = document.querySelector('input[name="entranceType"]:checked').value;
    mc1.visitDuration.highlightVisitsByEntranceType(entranceType, self.value);
};