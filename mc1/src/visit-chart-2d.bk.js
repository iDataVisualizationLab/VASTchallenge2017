var VisitChart2D = function VisitChart2D(svg, width, height, options) {

    let chart = new Chart2D(svg, width, height, options);

    Object.assign(this, chart); // extend properties

    let proto = {};
    Object.assign(proto, Chart2D.prototype, VisitChart2D.prototype); // extend methods
    Object.assign(VisitChart2D.prototype, proto); // extend methods


    this.filters = {};
};


VisitChart2D.prototype.renderTimeRangeSelector = function renderTimeRangeSelector() {

    let self = this;
    let valueLine = d3.line()
            .x(function(d) {
                return d.x = self.x(d.x);
            })
            .y(function(d) {
                return d.y = self.y(d.y); })
        ;

    let xRange = this.x.range();

    // create two vertical lines
    createTimeSelector('left-time-selector', self.myLowerBoundTimeSelector);

    // create two vertical lines
    createTimeSelector('right-time-selector', self.myUpperBoundTimeSelector);


    function createTimeSelector(cssClass, selectorData) {
        self.svg.selectAll('.' + cssClass).data([selectorData]).enter()
            .append('path')
            .attr('class', cssClass)
            .attr("d", function (line) {

                return valueLine(line);
            })
            .style('stroke-width', 1)
            .style('stroke', '#FF0000')
            .on('mouseover', function (d) {
                d3.select(this)
                    .style('stroke-width', 3);
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .style('stroke-width', 1);
            })
            .call(
                d3.drag()
                    .on("drag", handleBoundaryDrag)
                    .on("end", function () {
                        self.updateTimeSelectors();
                        self.highLightVisits();
                    })
            )
        ;
    }

    function handleBoundaryDrag(d) {
        d3.select(this)
            .attr('transform', function(d) {
                if (!d.x) {
                    d.x = d[0].x;
                }

                d.x = d.x + d3.event.dx;
                if (d.x < xRange[0]) {
                    d.x = xRange[0];
                }
                if (d.x > xRange[1]) {
                    d.x = xRange[1];
                }

                return 'translate(' + (d.x - d[0].x) +  ', 0)';
            })
        ;
    }

};

VisitChart2D.prototype.renderChart = function renderChart(events) {

    let proto = this.__proto__;
    let superObj = Object.getPrototypeOf(proto);


    superObj.renderChart.call(this, events);



    this.renderPassingGates();

};

VisitChart2D.prototype.renderPassingGates = function renderPassingGates() {
    let self = this;
    let gateVisiting = ['gate', 'entrance', 'camping'];
    let gateInternal = ['camping', 'ranger-stop', 'ranger-base'];

    self.myLine.each(function (line) {

        let gates = line.context.carType == '2P' ? gateInternal : gateVisiting;
        let myEndPoints = line.data.filter(function (cp) {

            for(let i=0; i< gates.length; i++) {
                if (cp.getVirtual() == false && cp.getGate().startsWith(gates[i])) {
                    return true;
                }
            }

            return false;
        });

        d3.select(this).selectAll('.passing-gate').data(myEndPoints).enter()
            .append('circle')
            .attr('class', 'passing-gate gate-car-id-' + line.context.carId)
            .attr('r', 0.5)
            .attr('cx', function (d) {
                let xKey = line.x;
                return self.x(d[xKey]);
            })
            .attr('cy', function (d) {
                let yKey = line.y;
                return self.y(d[yKey]);
            })
            .style('fill', function (d) {
                return d.mapPoint.getColor();
            })
        ;
    });
};


VisitChart2D.prototype.getMyLines = function getMyLines() {
  return this.myLine;
};



VisitChart2D.prototype.highlightSingleVisit = function highlightSingleVisit (carId) {

    let self = this;

    // reduce opacity first
    self.myLine
        .style('opacity', 0.01)
        .each(function (d) {
            d3.select(this)
                .select('path')
                .style('stroke-width', self.options.defaultLineWidth)
            ;
        })

    ;

    // increase opacity for ones we want to highlight
    self.svg.selectAll('.car-id-' + carId)
        .style('opacity', 1)
        .each(function (d) {
            d3.select(this)
                .select('path')
                .style('stroke-width', 3)
            ;
        })
    ;

    self.svg.selectAll('.gate-car-id-' + carId)
        .attr('r', 3)
    ;
};

VisitChart2D.prototype.clearSetting = function highlightSingleVisit () {

    let self = this;

    self.myLine
        .style('opacity', 1)
        .each(function (d) {
            d3.select(this)
                .selectAll('path')
                .style('stroke-width', self.options.defaultLineWidth)
            ;
        })
    ;

    self.svg.selectAll('.passing-gate')
        .attr('r', 0.5)
    ;
};

VisitChart2D.prototype.setFilters = function setFilters (entranceType, data) {

    let self = this;

    let carType = data['carType'];
    let camping = data['camping'];
    let stopCount = data['stopCount'];
    let velocity = data['velocity'];
    let visitDuration = data['visitDuration'];
    let overnight = data['overnight'];

    self.filters['entranceType'] = entranceType;
    self.filters['carType'] = carType;
    self.filters['camping'] = camping;
    self.filters['stopCount'] = stopCount;
    self.filters['velocity'] = velocity;
    self.filters['visitDuration'] = visitDuration;
    self.filters['overnight'] = overnight;
};

VisitChart2D.prototype.updateTimeSelectors = function updateTimeSelectors() {
    let self = this;

    if (!self.myLowerBoundTimeSelector || isNaN(self.myLowerBoundTimeSelector.x)) {
        let xdm = this.x.domain();
        let ydm = this.y.domain();

        this.myLowerBoundTimeSelector = [
            {x: xdm[0], y: ydm[0]},
            {x: xdm[0], y: ydm[1]}
        ];
        this.myLowerBoundTimeSelector.x = this.x(xdm[0]);
        this.myUpperBoundTimeSelector = [
            {x: xdm[1], y: ydm[0]},
            {x: xdm[1], y: ydm[1]}
        ];
        this.myUpperBoundTimeSelector.x = this.x(xdm[1]);
    }

    let startTime = self.x.invert(self.myLowerBoundTimeSelector.x);
    let endTime = self.x.invert(self.myUpperBoundTimeSelector.x);
    self.filters['time'] = [endTime, startTime];
};
/**
 * This will highlight only visits that interfere with the time range specified. Out of this range will be hidden.
 */
VisitChart2D.prototype.showVisits = function showVisits() {
    let self = this;
    let campingBehavior = self.filters['campingBehavior'];
    let velocityLimit = self.filters['velocityLimit'];
    let durationThreshold = self.filters['durationThreshold'];
    let entranceType = self.filters['entranceType'];
    let vehicleCategory = self.filters['vehicleCategory'];
    let velocityBehavior = self.filters['velocityBehavior'];
    let durationBehavior = self.filters['durationBehavior'];

    if (campingBehavior == 'behavior-camping') {
        campingBehavior =  true;
    }else if ( campingBehavior == 'behavior-no-camping') {
        campingBehavior = false;
    }

    if (!velocityLimit) {
        velocityLimit = ParkMap.SPEED_LIMIT_EXTRA_10;
    }

    velocityLimit = +velocityLimit;
    durationThreshold = +durationThreshold;

    if (entranceType == 'multi-entrances') {
        this.highLightMultiVisits(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
    else if (entranceType == 'single-entrance-over-night') {
        this.highLightSingleVisitOvernight(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
    else if (entranceType == 'no-exit') {
        this.highLightNoExit(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
    else if (entranceType == 'single-entrance-no-over-night') {
        this.highLightSingleEntranceNotOvernightVisit(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);
    }
    else {
        this.highLightAllTypesOfVisit(vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold);

    }


};

VisitChart2D.prototype.highLightVisits = function highLightVisits() {
    let self = this;
    let carType = self.filters['carType'];
    let camping = self.filters['camping'];
    let stopCount = self.filters['stopCount'];
    let velocity = self.filters['velocity'];
    let visitDuration = self.filters['visitDuration'];
    let overnight = self.filters['overnight'];
    let time = self.filters['time'];



    // Generate visibility expression
    let ex = function (line) {

        let ctx = line.context;

        if (line.carId == '20152402052415-950') {
            debugger;
        }

        if (ctx.stopCount > 30) {
            debugger;
        }

        // car type criteria
        if (!!carType && carType.indexOf(ctx.carType) < 0) {
            return line.visibility = 'hidden';
        }

        // camping
        if (!!camping && camping.indexOf(ctx.camping) < 0) {
            return line.visibility = 'hidden';
        }

        // stop count
        if (!!stopCount && (ctx.stopCount > stopCount[0] || ctx.stopCount < stopCount[1])) {
            return line.visibility = 'hidden';
        }

        // overnight
        if (!!overnight && overnight.indexOf(ctx.overnight) < 0) {
            return line.visibility = 'hidden';
        }

        // visit duration
        if (!!visitDuration && (ctx.visitDuration > visitDuration[0] || ctx.visitDuration < visitDuration[1])) {
            return line.visibility = 'hidden';
        }

        // velocity
        if (!!velocity && (ctx.velocity > velocity[0] || ctx.velocity < velocity[1])) {
            return line.visibility = 'hidden';
        }
        // start time & end time
        let lineStartTime = line.x == 'time' ? ctx['startTime'] : ctx['contextStartTime'];
        let lineEndTime = line.x == 'time' ? ctx['endTime'] : ctx['contextEndTime'];

        if (!!time && (lineStartTime.getTime() > time[0].getTime() || lineEndTime.getTime() < time[1].getTime())) {
            return line.visibility = 'hidden';
        }


        return line.visibility = 'visible';
    };

    self.myLine.style('visibility', ex);
};

VisitChart2D.prototype.highLightMultiVisits = function highLightMultiVisits (carCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    if (!velocityLimit) {
        velocityLimit = ParkMap.SPEED_LIMIT_EXTRA_10;
    }

    let self = this;
    let startTime = self.x.invert(self.myLowerBoundTimeSelector.x);
    let endTime = self.x.invert(self.myUpperBoundTimeSelector.x);

    this.myLine
        .style('visibility', function (line) {
            if (line.context.startTime.getTime() >= endTime.getTime() || line.context.endTime.getTime() <= startTime.getTime()) {
                return line.visibility = 'hidden';
            }
            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount > 2 && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.entranceCount > 2 && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount > 2 && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.entranceCount > 2 && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }
                else {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount > 2 && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.entranceCount > 2 && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount > 2 && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.entranceCount > 2 && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }
                else {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }
            }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType != '2P') && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount > 2 && line.context.carType != '2P') && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }

                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold)  ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }

            }

            if (campingBehavior == 'all') {
                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }

            }

            switch (velocityBehavior) {
                case 'below-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return line.visibility = (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                        case 'above':
                            return line.visibility = (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
                case 'above-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return line.visibility = (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                        case 'above':
                            return line.visibility = (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
            }
        })
    ;
};

VisitChart2D.prototype.highLightSingleVisitOvernight = function highLightSingleVisitOvernight (carCategory, campingBehavior,  velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    if (!velocityLimit) {
        velocityLimit = ParkMap.SPEED_LIMIT_EXTRA_10;
    }

    let self = this;
    let startTime = self.x.invert(self.myLowerBoundTimeSelector.x);
    let endTime = self.x.invert(self.myUpperBoundTimeSelector.x);

    this.myLine
        .style('visibility', function (line) {
            if (line.context.contextStartTime.getTime() >= endTime.getTime() || line.context.contextEndTime.getTime() <= startTime.getTime()) {
                return line.visibility = 'hidden';
            }
            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount == 2 && line.context.overnight == true && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.entranceCount == 2 && line.context.overnight == true && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount == 2 && line.context.overnight == true && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.entranceCount == 2 && line.context.overnight == true && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.entranceCount == 2 && line.context.overnight == true && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';
                            case 'above':
                                return line.visibility = line.context.entranceCount == 2 && line.context.overnight == true && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.entranceCount == 2 && line.context.overnight == true && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';
                            case 'above':
                                return line.visibility = line.context.entranceCount == 2 && line.context.overnight == true && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == '2P'&& line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == '2P'&& line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }

                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }

            }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType != '2P' && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType != '2P' && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }

                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }

            }

            if (campingBehavior == 'all') {
                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }

            switch (velocityBehavior) {
                case 'below-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                        case 'above':
                            return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
                case 'above-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                        case 'above':
                            return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == true && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
            }
        })
    ;
};

VisitChart2D.prototype.highLightNoExit = function highLightNoExit(carCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    if (!velocityLimit) {
        velocityLimit = ParkMap.SPEED_LIMIT_EXTRA_10;
    }

    let self = this;
    let startTime = self.x.invert(self.myLowerBoundTimeSelector.x);
    let endTime = self.x.invert(self.myUpperBoundTimeSelector.x);

    this.myLine
        .style('visibility', function (line) {
            if (line.context.contextStartTime.getTime() >= endTime.getTime() || line.context.contextEndTime.getTime() <= startTime.getTime()) {
                return line.visibility = 'hidden';
            }

            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount < 2 && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.entranceCount < 2 && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount < 2 && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.entranceCount < 2 && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.entranceCount < 2 && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';
                            case 'above':
                                return line.visibility = line.context.entranceCount < 2 && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.entranceCount < 2 && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';
                            case 'above':
                                return line.visibility = line.context.entranceCount < 2 && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }

                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }

            if (campingBehavior == 'all') {
                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }

            switch (velocityBehavior) {
                case 'below-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return line.visibility = (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                        case 'above':
                            return line.visibility = (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
                case 'above-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return line.visibility = (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';
                        case 'above':
                            return line.visibility = (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';
                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
            }
        })
    ;
};

VisitChart2D.prototype.highLightAllTypesOfVisit = function highLightAllTypesOfVisit (carCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    if (!velocityLimit) {
        velocityLimit = ParkMap.SPEED_LIMIT_EXTRA_10;
    }

    let self = this;
    let startTime = self.x.invert(self.myLowerBoundTimeSelector.x);
    let endTime = self.x.invert(self.myUpperBoundTimeSelector.x);

    this.myLine
        .style('visibility', function (line) {
            if (line.context.contextStartTime.getTime() >= endTime.getTime() || line.context.contextEndTime.getTime() <= startTime.getTime()) {
                return line.visibility = 'hidden';
            }

            if (carCategory == 'car-all') {

                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold  ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }

                let myVisibility = 'visible';
                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                myVisibility = line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                break;
                            case 'above':
                                myVisibility = line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                break;
                        }
                        break;
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                myVisibility = line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                break;
                            case 'above':
                                myVisibility = line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                break;
                        }
                        break;
                }

                return line.visibility = myVisibility;
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.carType == '2P' && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.carType == '2P' && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                            }
                    }
                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                        }
                }
            }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                                default:
                                    throw new Error('Invalid duration behavior:' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.carType != '2P' && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                                case 'above':
                                    return line.visibility = line.context.carType != '2P' && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                            }
                    }

                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold  ? 'visible' : 'hidden';

                            case 'above':
                                return line.visibility = line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold  ? 'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                            case 'above':
                                return line.visibility = line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                        }
                }
            }

            if (campingBehavior == 'all') {
                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return  line.visibility = line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                            case 'above':
                                return  line.visibility = line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return  line.visibility = line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';

                            case 'above':
                                return  line.visibility = line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);

                        }
                }

            }

            switch (velocityBehavior) {
                case 'below-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return  line.visibility = line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';

                        case 'above':
                            return  line.visibility = line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';

                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
                case 'above-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return  line.visibility = line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ? 'visible' : 'hidden';
                        case 'above':
                            return  line.visibility = line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ? 'visible' : 'hidden';
                    }
            }
        })
    ;
};

VisitChart2D.prototype.highLightSingleEntranceNotOvernightVisit = function highLightSingleEntranceNotOvernightVisit (carCategory, campingBehavior, velocityBehavior, velocityLimit,  durationBehavior, durationThreshold) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    if (!velocityLimit) {
        velocityLimit = ParkMap.SPEED_LIMIT_EXTRA_10;
    }

    let self = this;
    let startTime = self.x.invert(self.myLowerBoundTimeSelector.x);
    let endTime = self.x.invert(self.myUpperBoundTimeSelector.x);

    this.myLine
        .style('visibility', function (line) {
            if (line.context.contextStartTime.getTime() >= endTime.getTime() || line.context.contextEndTime.getTime() <= startTime.getTime()) {
                return line.visibility = 'hidden';
            }

            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount == 2 && line.context.overnight == false && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';

                                case 'above':
                                    return line.visibility = line.context.entranceCount == 2 && line.context.overnight == false && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';

                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = line.context.entranceCount == 2 && line.context.overnight == false && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';

                                case 'above':
                                    return line.visibility = line.context.entranceCount == 2 && line.context.overnight == false && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';

                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.entranceCount == 2 && line.context.overnight == false && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold  ?  'visible' : 'hidden';

                            case 'above':
                                return line.visibility = line.context.entranceCount == 2 && line.context.overnight == false && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold  ?  'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = line.context.entranceCount == 2 && line.context.overnight == false && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold ?  'visible' : 'hidden';

                            case 'above':
                                return line.visibility = line.context.entranceCount == 2 && line.context.overnight == false && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold ?  'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                                case 'above':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == '2P' && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                                case 'above':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == '2P' && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'below-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                                case 'above':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType != '2P' && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                        case 'above-limit':
                            switch (durationBehavior) {
                                case 'below':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType != '2P' && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                                case 'above':
                                    return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType != '2P' && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                                default:
                                    throw new Error('Invalid duration behavior: ' + durationBehavior);
                            }
                    }
                }

                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }

            if (campingBehavior == 'all') {
                switch (velocityBehavior) {
                    case 'below-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == carCategory && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                    case 'above-limit':
                        switch (durationBehavior) {
                            case 'below':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                            case 'above':
                                return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == carCategory && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                            default:
                                throw new Error('Invalid duration behavior: ' + durationBehavior);
                        }
                }
            }

            switch (velocityBehavior) {
                case 'below-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                        case 'above':
                            return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
                case 'above-limit':
                    switch (durationBehavior) {
                        case 'below':
                            return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration <= durationThreshold) ? 'visible' : 'hidden';

                        case 'above':
                            return line.visibility = (line.context.entranceCount == 2 && line.context.overnight == false && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > velocityLimit && line.context.visitDuration > durationThreshold) ? 'visible' : 'hidden';

                        default:
                            throw new Error('Invalid duration behavior: ' + durationBehavior);
                    }
            }
        })
    ;
};