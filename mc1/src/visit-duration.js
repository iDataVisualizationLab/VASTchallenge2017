var VisitDuration = function VisitDuration(visitChart, parkMap) {

    this.visitChart = visitChart;
    this.parkMap = parkMap;

    this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

    let minDate = this.parseTime('2015-05-01 00:43:28');
    let maxDate = this.parseTime('2016-05-31 23:56:06');

    this.visitChart.setXDomain(minDate, maxDate);
    this.visitChart.setYDomain(0, 20000);
    this.simulationInProgress = false;

    this.init();

};


VisitDuration.prototype.init = function init() {
    this.events = [
        {name: 'mouseover', callback: this.onLineMouseOver, params: this},
        // {name: 'mouseout', callback: this.onLineMouseOut, params: this}
    ];

};

VisitDuration.prototype.render = function render(lines) {

    let colorFunction = d3.scaleOrdinal(d3.schemeCategory10);
    // parse the date / time
    let self = this;
    lines.forEach(function(line, index) {

        let colorIdx = line.carType;
        let color = line.carType == '2P' ? '#000000' : colorFunction(colorIdx);
        line.path.forEach(function (timeGate) {
            // debugger;
            timeGate.time = self.parseTime(timeGate.time);
            timeGate.y = 50 + index;
        });

        self.visitChart.addData({carId: line.carId, carType: line.carType, color: color}, line.path, 'time', 'y');

    });

    this.visitChart.renderChart(this.events);
    this.visitChart.renderAxis('Time', 'Visit');
};

VisitDuration.prototype.onLineMouseOver = function onLineMouseOver(param, line) {
    console.log('event mouse over');

    let self = param;

    // let mapPointPaths = line.data.map(function (gateData) {
    //     return self.parkMap.getMapPointByName(gateData.gate);
    // });
    // self.parkMap.findThenHighLightPath(mapPointPaths, line.context.color);
    self.simulateGateMovement(line.context, line.data);

};

VisitDuration.prototype.onLineMouseOut = function onLineMouseOver(param, line) {
    let path = line.data;
    let startPoint;
    let endPoint;
    let steps;

    let self = param;

    for(let i=0; i< path.length-1; i++) {
        startPoint = path[i];
        endPoint = path[i+1];

        steps = self.parkMap.findSinglePathByName(startPoint.gate, endPoint.gate);
        self.parkMap.clearPath(steps);
    }
};

VisitDuration.prototype.simulateGateMovement = function (context, gateSensorDataArray) {

    if (this.simulationInProgress) {
        return;
    }

    this.simulationInProgress = true;

    console.log('Simulating for car: ' + context.carId + "; type: " + context.carType);
    let timeDurationInMiliSecond;
    let fromGate;
    let toGate;
    let distance;

    let completePath = [];
    let velocity;

    for(let i=0; i< gateSensorDataArray.length - 1; i++) {
        fromGate = gateSensorDataArray[i];
        toGate =  gateSensorDataArray[i+1];
        timeDurationInMiliSecond = toGate.time.getTime() - fromGate.time.getTime();

        if (fromGate.gate != toGate.gate) {
            distance = this.parkMap.findSinglePathByName(fromGate.gate, toGate.gate);
            distance.shift(); // avoid counting current position
            velocity = distance.length * ParkMap.CELL_WIDTH_IN_MILE * 3600000 / timeDurationInMiliSecond; // mile per hour
        }
        else {
            velocity = 0; // not movement, stay in side for gaming, camping
        }

        completePath.push({from: fromGate, to: toGate, velocity: velocity, path: distance, id: completePath.length})
    }

    var nextSimplePath = completePath.shift();

    let self = this;

    var doSimulation = function (simplePath) {

        if (simplePath.from.gate == simplePath.to.gate) {
            console.log('enter and quite the same place: ' + simplePath.from.gate + "; duration: " + ((simplePath.to.time.getTime() - simplePath.from.time.getTime())/1000*60) + "(min)");
            nextSimplePath = completePath.shift();
            if (!!nextSimplePath) {

                doSimulation(nextSimplePath);
            }

            return;

        }

        console.log('Simulate Path: from: ' + simplePath.from.gate + "; t: " + simplePath.to.gate);
        // highlight cell
        let nextCell = simplePath.path.shift();

        var doJumping = function (cell) {

            console.log('jump to cell: ' + cell.getPos());

            self.parkMap.highLightOneCell(cell, context.color);

            let myTimer = d3.timer(function (e) {
                    // clear cell
                    // console.log('out of cell : ' + cell.getPos());
                    myTimer.stop();
                    // self.parkMap.clearOneCell(cell);

                    nextCell = simplePath.path.shift();
                    if (!!nextCell) {
                        doJumping(nextCell);
                    }
                    else {
                        nextSimplePath = completePath.shift();
                        if (!!nextSimplePath) {

                            doSimulation(nextSimplePath);
                        }else {
                            self.simulationInProgress = false;
                        }
                    }


                },
                simplePath.velocity
            );
        };

        doJumping(nextCell);
    };

    doSimulation(nextSimplePath);
};