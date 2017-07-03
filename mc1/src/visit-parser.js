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
        line.publicCar = line.carType != '2P';
        line.velocity = +line.velocity;
        line.visitDuration = +line.visitDuration;
        line.stopCount = +line.stopCount;
        line.stopDuration = +line.stopDuration;
        line.startTime = self.parseTime(line.startTime);
        line.endTime = self.parseTime(line.endTime);
        line.startDay = line.startTime.getDay();
        line.endDay = line.endTime.getDay();
        line.stops = {};

        let path = line.path.map(function (timeGate, index) {
            let carPoint;
            let mapPoint = self.parkMap.getMapPointByName(timeGate.gate);
            if (index > 0) {
                let preidx = index - 1;
                let prePoint = line.path[preidx];
                if (prePoint.gate == timeGate.gate) {
                    // stop point
                    mapPoint.increaseStopCount();
                    if (!prePoint.gate.startsWith('entrance')) {
                        line.stops[prePoint.gate] = index;

                    }

                    if(!prePoint.gate.startsWith('camp')) {
                        console.log('Stop at: ' + prePoint.gate + "; count:" + mapPoint.getStopCount());
                    }
                }
            }

            carPoint = new CarPoint(mapPoint, self.parseTime(timeGate.time), timeGate.velocity, timeGate.path);

            return carPoint;
        });

        delete line.path;
        line.path = path;
    });

    this.visits = visits;

    this.parkMap.setupStopCountDomain();

    return visits;
};

VisitParser.prototype.getVisits = function getVisits () {
    return this.visits;
};