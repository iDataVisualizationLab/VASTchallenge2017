var SimulationManager = function (parkMap) {
    this.parkMap = parkMap;
    this.simulatingCars = {};
    this.subTimers = [];
};

SimulationManager.prototype.reset = function reset() {
    this.simulatingCars = {};
    if (!!this.timer) {
        this.timer.stop();
    }

    this.subTimers.forEach(function (t) {
        t.stop();
    });

    this.subTimers = [];
};

SimulationManager.prototype.simulateTraffic = function simulateCarMovement (lines) {

    // let i =0;
    //
    // let startIndex = 0;
    // let myNextStartIndex = 0;
    // let line;
    // let firstCar;
    //
    // let myCars;
    //
    // let self = this;
    //
    // self.timer = d3.interval(function (elapsed) {
    //
    //     // console.log("time: " + elapsed);
    //     myCars = [];
    //     // get cars to be executed
    //     for(i=startIndex; i< lines.length; i++) {
    //         line = lines[i].context;
    //
    //         if (startIndex == i) {
    //             firstCar = lines[i].context;
    //         }
    //
    //         if (line.contextStartTime.getTime() >  elapsed * TIME_RATIO + firstCar.contextStartTime.getTime()) {
    //             break;
    //         }
    //
    //         myCars.push(line);
    //         myNextStartIndex = i;
    //     }
    //
    //     startIndex = myNextStartIndex + 1;
    //     // execute the cars
    //     myCars.forEach(function (l) {
    //         self.simulateCarMovement(l);
    //     });
    //
    //     if (startIndex >= lines.length) {
    //         console.log('finish timer interval');
    //         self.timer.stop();
    //     }
    //
    // }, 30);
};


SimulationManager.prototype.simulateTrafficByTimeBlock = function simulateTrafficByTimeBlock (visits) {

    // let i =0;
    //
    // let startIndex = 0;
    // let myNextStartIndex = 0;
    // let line;
    // let firstCar;
    //
    // let myCars;
    //
    // let self = this;
    //
    // d3.interval(function (elapsed) {
    //
    //     console.log("time: " + elapsed);
    //     myCars = [];
    //     for(i=startIndex; i< visits.length; i++) {
    //         line = visits[i];
    //
    //         if (startIndex == i) {
    //             firstCar = visits[i];
    //         }
    //
    //         if (getTimeInDayByMilliseconds(line.startTime) >  elapsed * TIME_RATIO + getTimeInDayByMilliseconds(firstCar.startTime)) {
    //             break;
    //         }
    //
    //         myCars.push(line);
    //         myNextStartIndex = i;
    //     }
    //
    //     startIndex = myNextStartIndex + 1;
    //     myCars.forEach(function (l) {
    //         self.simulateCarMovement(l);
    //     });
    //
    // }, 30);
};

/**
 *
 * @param line
 * @param delay time in milliseconds
 */
SimulationManager.prototype.simulateCarMovement = function simulateCarMovement (line, delay) {

    let self = this;
    let context = !!line.context ? line.context : line;
    let gateSensorDataArray = line.data || line.path;

    if (this.simulatingCars.hasOwnProperty(context.carId)) {
        return; // not simulating the car has been simulated
    }

    this.simulatingCars[context.carId] = line;

    // show car tace
    // let carTrace = self.parkMap.getCarTraceContainer();
    // carTrace.append('text')
    //     .text('Car: ' + context.carId)
    //     .attr('x', 13)
    //     .attr('y', 1)
    //     .style("font-size", "10px")
    //
    // ;

    var doSimulation = function (index) {
        if (!index && index !=0) {
            index = 0;
        }

        if (index >= gateSensorDataArray.length) {
            console.log('no gate to simulate');
            return;
        }

        let carPoint = gateSensorDataArray[index];
        if (!carPoint.path || carPoint.path.length < 1) {

            if (index < gateSensorDataArray.length-1) {
                let nextGate = gateSensorDataArray[index + 1];
                let relaxTime = convertToSimulationTime(nextGate.getTimeInMiliseconds() - carPoint.getTimeInMiliseconds());
                console.log('arrive gate for relaxing: ' + carPoint.getGate() + ": duration: " + relaxTime + "(ms)");

                let t = d3.timeout(
                    function () {
                        doSimulation(index + 1);
                    },
                    relaxTime
                );

                self.subTimers.push(t);
            }
            else {
                console.log('arrive last gate: ' + carPoint.getGate() + ": at: " + carPoint.getFormattedTime());

            }

            return;
        }

        console.log('at gate:' + carPoint.getGate() + ":at: " + carPoint.getFormattedTime());


        // highlight cell

        var doJumping = function (idx) {

            if (!idx && idx != 0) {
                idx = 0;
            }

            if (idx >= carPoint.path.length-1) {
                console.log('no more path. Go to next gate');
                doSimulation(index + 1);
                return;
            }


            let pos = carPoint.path[idx];

            self.parkMap.highLightOneCellAtPos(pos, context.color, 0.3, true);

            let travelTime = ParkMap.CELL_WIDTH_IN_MILE * 3600000 / carPoint.velocity; // in milliseconds
            let t = d3.timeout(function () {
                    idx ++;
                    doJumping(idx);
                },

                convertToSimulationTime(travelTime)
            );

            self.subTimers.push(t);

        };

        doJumping();
    };

    d3.timeout(
        function () {
            doSimulation();
        },
        delay
    );
};


SimulationManager.prototype.renderCarTrace = function renderCarTrace(carPoint, x, y, end) {

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