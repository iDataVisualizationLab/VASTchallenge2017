var VisitParser = function VisitParse (parkMap) {
    this.parkMap = parkMap;
    this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

};

VisitParser.prototype.parse = function (visits) {
    let colorFunction = d3.scaleOrdinal(d3.schemeCategory10);
    // parse the date / time
    let self = this;
    visits.forEach(function(line, index) {

        let colorIdx = line.carType;
        line.color = line.carType == '2P' ? '#000000' : colorFunction(colorIdx);
        line.velocity = +line.velocity;

        let path = line.path.map(function (timeGate) {
            let carPoint;
            let mapPoint = self.parkMap.getMapPointByName(timeGate.gate);

            carPoint = new CarPoint(mapPoint, self.parseTime(timeGate.time), timeGate.velocity);

            return carPoint;
        });

        delete line.path;
        line.path = path;
    });

    return visits;
};