var SimulationManager = function (parkMap) {
    this.parkMap = parkMap;
};

SimulationManager.prototype.simulateTraffic = function simulateCarMovement (visits) {

    let i =0;

    let startIndex = 0;
    let myNextStartIndex = 0;
    let line;
    let firstCar;

    let myCars;

    let self = this;

    d3.interval(function (elapsed) {

        console.log("time: " + elapsed);
        myCars = [];
        for(i=startIndex; i< visits.length; i++) {
            line = visits[i];

            if (startIndex == i) {
                firstCar = visits[i];
            }

            if (line.startTime.getTime() >  elapsed * TIME_RATIO + firstCar.startTime.getTime()) {
                break;
            }

            myCars.push(line);
            myNextStartIndex = i;
        }

        startIndex = myNextStartIndex + 1;
        myCars.forEach(function (l) {
            self.simulateCarMovement(l, l.path);
        });

    }, 30);
};

/**
 *
 * @param line
 * @param delay time in milliseconds
 */
SimulationManager.prototype.simulateCarMovement = function simulateCarMovement (line, delay) {

    let self = this;
    let context = line.context;
    let gateSensorDataArray = line.data;

    // show car tace
    let carTrace = self.parkMap.getCarTraceContainer();
    carTrace.append('text')
        .text('Car: ' + context.carId)
        .attr('x', 13)
        .attr('y', 1)
        .style("font-size", "10px")

    ;

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
            console.log('arrive last gate: ' + carPoint.getGate());

            return;
        }

        console.log('at gate:' + carPoint.getGate());


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

            self.parkMap.highLightOneCellAtPos(pos, context.color);

            let travelTime = ParkMap.CELL_WIDTH_IN_MILE * 3600000 / carPoint.velocity;
            d3.timeout(function () {
                    idx ++;
                    doJumping(idx);
                },

                convertToSimulationTime(travelTime)
            );
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