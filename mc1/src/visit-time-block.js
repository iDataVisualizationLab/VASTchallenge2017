// fromHour is 0 by default
// toHour is closed hour that the car get recorded within 24 hours.

var VisitTimeBlock = function VisitTimeBlock(visitChart, parkMap, fromHour, toHour) {
    this.visitChart = visitChart;
    this.parkMap = parkMap;

    if (!fromHour) {
        fromHour = '00:00:01';
    }

    if (!toHour) {
        toHour = '23:59:59';
    }

    this.parseTime = d3.timeParse("%H:%M:%S");

    this.fromTime = this.parseTime(fromHour);
    this.toTime = this.parseTime(toHour);

    this.visitChart.setXDomain(this.fromTime, this.toTime);
    this.visitChart.setYDomain(0, 20000);

    this.init();

};

VisitTimeBlock.prototype.init = function init() {
    this.events = [
        {name: 'mouseover', callback: this.onLineMouseOver, params: this},
        // {name: 'mouseout', callback: this.onLineMouseOut, params: this}
    ];

};

VisitTimeBlock.prototype.render = function render(lines) {
    // parse the date / time
    let self = this;
    lines.forEach(function(line, index) {

        let tmpPath = [];
        let carPoint;
        let firstDayInMilliseconds;
        let endDayInMilliseconds;
        let d;
        for(let i=0; i< line.path.length; i++) {
            carPoint = line.path[i].clone();

            if (i==0) {
                firstDayInMilliseconds = carPoint.getTimeInMiliseconds();
                endDayInMilliseconds = firstDayInMilliseconds + (self.toTime - self.fromTime)*1000;
            }

            if (carPoint.getTimeInMiliseconds() < endDayInMilliseconds) {

                if (carPoint.getTimeInDayBySeconds() > getTimeInDayBySeconds(self.fromTime) && carPoint.getTimeInDayBySeconds() < getTimeInDayBySeconds(self.toTime)) {
                    d = carPoint.getTimeInDayAsString();
                    carPoint.x = self.parseTime(d);
                    carPoint.y = 50 + index; // the same y coordinate for the same car 'index' (individual car). So we have horizontal line
                    tmpPath.push(carPoint);
                }
            }
        }

        self.visitChart.addData(line, tmpPath);

    });

    this.visitChart.renderChart(this.events);
    this.visitChart.renderAxis('Hours', 'Visits', "%H:%M");
};

VisitTimeBlock.prototype.onLineMouseOver = function onLineMouseOver(param, line) {

    console.log('event mouse over time block');

    debugger;
    let self = param;

    self.simulateCarMovement(line.context, line.data);

};


VisitTimeBlock.prototype.simulateCarMovement = function (context, gateSensorDataArray) {

    let self = this;

    if (!!self.simulationTimer) {
        self.simulationTimer.stop();
        self.parkMap.clearCarTrace();

        if (!!self.simulatedMapPoints && self.simulatedMapPoints.length > 0) {
            self.parkMap.clearPath(self.simulatedMapPoints);
            self.simulatedMapPoints = [];
        }
    }

    console.log('Simulating for car: ' + context.carId + "; type: " + context.carType);
    let timeDurationInMiliSecond;
    let fromCarPoint;
    let toCarPoint;
    let distance;

    self.simulationPath = [];
    self.simulatedMapPoints = [];

    let velocity;

    for(let i=0; i< gateSensorDataArray.length - 1; i++) {
        fromCarPoint = gateSensorDataArray[i];
        toCarPoint =  gateSensorDataArray[i+1];
        timeDurationInMiliSecond = toCarPoint.getTimeInMiliseconds() - fromCarPoint.getTimeInMiliseconds();

        if (fromCarPoint.getGate() != toCarPoint.getGate()) {
            distance = this.parkMap.findSinglePathByName(fromCarPoint.getGate(), toCarPoint.getGate());
            distance.shift(); // avoid counting current position
            velocity = distance.length * ParkMap.CELL_WIDTH_IN_MILE * 3600000 / timeDurationInMiliSecond; // mile per hour
        }
        else {
            velocity = 0; // not movement, stay in side for gaming, camping
        }

        self.simulationPath.push({from: fromCarPoint, to: toCarPoint, velocity: velocity, path: distance, id: self.simulationPath.length})
    }

    var nextSimplePath = self.simulationPath.shift();

    // show car tace
    let carTrace = self.parkMap.getCarTraceContainer();
    // let colorF =  d3.scaleOrdinal(d3.schemeCategory10);
    //
    // for(let i=0; i< 10; i++) {
    //     carTrace.append('rect')
    //         .attr('x', 0)
    //         .attr('y', -5)
    //         .attr('width', 6)
    //         .attr('height', 6)
    //         .attr('fill', colorF(i) )
    //         .style('opacity', 0.1)
    //     ;
    // }

    carTrace.append('text')
        .text('Car: ' + context.carId)
        .attr('x', 13)
        .attr('y', 1)
        .style("font-size", "10px")

    ;


    var doSimulation = function (simplePath, index) {

        let myIndex = index % 35;
        if (index != 0 && myIndex == 0) {
            // clear text
            self.parkMap.clearCarTrace();
        }
        let carTraceYPos = 15 + myIndex*15;



        self.renderCarTrace(simplePath.from, 0, carTraceYPos);

        if (simplePath.from.getGate() == simplePath.to.getGate()) {
            console.log('enter and quite the same place: ' + simplePath.from.getGate() + "; duration: " + ((simplePath.to.getTimeInMiliseconds() - simplePath.from.getTimeInMiliseconds())/1000*60) + "(min)");
            nextSimplePath = self.simulationPath.shift();
            if (!!nextSimplePath) {

                doSimulation(nextSimplePath, ++index);
            }
            else {
                self.renderCarTrace(simplePath.to, 0, carTraceYPos + 15, true); // last gate
            }

            return;

        }

        console.log('Simulate Path: from: ' + simplePath.from.getGate() + "; t: " + simplePath.to.getGate());
        // highlight cell
        let nextCell = simplePath.path.shift();

        var doJumping = function (cell) {

            console.log('jump to cell: ' + cell.getPos() + "; name: " + cell.getName());
            self.simulatedMapPoints.push(cell);

            self.parkMap.highLightOneCell(cell, context.color);

            self.simulationTimer = d3.timer(function (e) {
                    // clear cell
                    // console.log('out of cell : ' + cell.getPos());
                    self.simulationTimer.stop();
                    // self.parkMap.clearOneCell(cell);

                    nextCell = simplePath.path.shift();
                    if (!!nextCell) {
                        doJumping(nextCell);
                    }
                    else {
                        nextSimplePath = self.simulationPath.shift();
                        if (!!nextSimplePath) {

                            doSimulation(nextSimplePath, ++index);
                        }else {

                            self.renderCarTrace(simplePath.to, 0, carTraceYPos + 15, true); // last gate

                        }
                    }


                },
                simplePath.velocity
            );
        };

        doJumping(nextCell);
    };

    doSimulation(nextSimplePath, 0);
};

VisitTimeBlock.prototype.renderCarTrace = function renderCarTrace(carPoint, x, y, end) {

    let carTrace = this.parkMap.getCarTraceContainer();
    x = !!x ? x : 0;
    y = !!y ? y : 0;

    carTrace.append('rect')
        .attr('class', 'car-at-gate')
        .attr('width', 5)
        .attr('height', 5)
        .attr('fill', carPoint.getColor())
        .attr('x', x)
        .attr('y', y - 7)
    ;

    carTrace.append('text')
        .text(carPoint.getGate())
        .attr('x', x + 13)
        .attr('y', y)
        .style("font-size", "10px")
    ;

    carTrace.append('text')
        .text(carPoint.getFormattedTime())
        .attr('x', 80)
        .attr('y', y)
        .style("font-size", "10px")

    ;

    if (!!end) {
        carTrace.append('text')
            .text('Complete')
            .attr('x', x + 13)
            .attr('y', y + 15)
            .style("font-size", "10px")

        ;
    }
};
