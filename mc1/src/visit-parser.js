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
        line.visitDuration = +line.visitDuration;
        line.startTime = self.parseTime(line.startTime);

        let path = line.path.map(function (timeGate) {
            let carPoint;
            let mapPoint = self.parkMap.getMapPointByName(timeGate.gate);

            carPoint = new CarPoint(mapPoint, self.parseTime(timeGate.time), timeGate.velocity, timeGate.path);

            return carPoint;
        });

        delete line.path;
        line.path = path;
    });

    this.visits = visits;

    return visits;
};

VisitParser.prototype.getVisits = function getVisits () {
    return this.visits;
};