var Chart2D = function Chart2D(svg, width, height, options) {
    this.svg = svg;


    this.svg.selectAll('*').remove();


    this.width = width;
    this.height = height;

    if (!options) {
        options = {};
    }

    this.options = options;

    // set the ranges
    this.x = !!this.options.timeChart ? d3.scaleTime().range([0, width]) :  d3.scaleLinear().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);

    this.fisheye = d3.fisheye.circular()
        .radius(200)
        .distortion(2);

    this.options.defaultLineWidth = 0.2;

    this.filters = {};
    //
    // let xdm = this.x.domain();
    // let ydm = this.y.domain();
    // let xRange = this.x.range();
    //
    // this.myLowerBoundTimeSelector = [
    //     [
    //         {x: xdm[0], y: ydm[0]},
    //         {x: xdm[0], y: ydm[1]}
    //     ]
    // ];
    // this.myLowerBoundTimeSelector.x = this.x(xdm[0]);
    //
    // this.myUpperBoundTimeSelector = [
    //     [
    //         {x: xdm[1], y: ydm[0]},
    //         {x: xdm[1], y: ydm[1]}
    //     ]
    // ];
    // this.myUpperBoundTimeSelector.x = this.x(xdm[1]);
};

Chart2D.prototype.setEventHandler = function setEventHandler(eventHandler) {
    this.eventHandler = eventHandler;
};


Chart2D.prototype.getSvg = function getSvg() {
    return this.svg;
};

/**
 *
 * Set data before rendering the chart
 *
 * @param context: context information
 * @param dataArray data array, containing [ [{x: xValue1, y: yValue1}, {x: xValue2, y: yValue2}], [{}]]
 * @param xKey: key to get data for x axis. Default is x
 * @param yKey: key to get data for y axis. Default is y
 */
Chart2D.prototype.addData = function addData(context, dataArray, xKey, yKey) {

    if (!this.lineData) {
        this.lineData = [];
    }

    if (!xKey) {
        xKey = 'x';
    }

    if (!yKey) {
        yKey = 'y';
    }

    if (!context) {
        context = {};
    }


    if (!context.color) {
        context.color = '#000000';
    }

    let self = this;

    let valueLine = d3.line()
        .x(function(d) {
            return self.x(d[xKey]);
        })
        .y(function(d) {
            return self.y(d[yKey]); })
    ;

    self.lineData.push( {valueLine: valueLine, data: dataArray, context: context, x: xKey, y: yKey});


    // let myPaths = [];
    // let myContinuesPath = [];
    //
    // dataArray.forEach(function (carPoint, index) {
    //     myContinuesPath.push(carPoint);
    //
    //     if (!carPoint.path && index < dataArray.length-1) {
    //         myPaths.push(myContinuesPath);
    //         myContinuesPath = [];
    //     }
    //
    // });
    //
    // if (context.carId == '20153712013720-181') {
    //     debugger;
    // }
    // myPaths.forEach(function (cPath, index) {
    //     self.lineData.push( {valueLine: valueLine, data: cPath, context: context});
    //
    //     if (index < myPaths.length-1) {
    //         let nxtPath = myPaths[index+1];
    //         let nxtPoint = nxtPath[0];
    //
    //         self.lineData.push( {valueLine: valueLine, data: [cPath[cPath.length-1], nxtPoint], context: context, stopping: true});
    //     }
    //
    // });
};

Chart2D.prototype.setXDomain = function setXDomain(min, max) {
    this.x.domain([min, max]);
};

Chart2D.prototype.setYDomain = function setYDomain(min, max) {
    this.y.domain([min, max]);
};


Chart2D.prototype.getVisibleLines = function getVisibleLines() {

    let myVisits = [];
    this.myLine.each(function (line) {
        if (line.visibility == 'visible') {
            myVisits.push(line);
        }
    });

    console.log('visible lines: ' + myVisits.length);
    return myVisits;
};
/**
 *
 * Render axis with label for bottom and left axis
 *
 * @param bottomLabel
 * @param leftLabel
 * @param format (time for mat if time chart
 */
Chart2D.prototype.renderAxis = function renderAxis(bottomLabel, leftLabel, format) {

    let height = this.height;
    let width = this.width;
    let margin = this.options.margin;

    let bottom = d3.axisBottom(this.x);

    if (this.options.timeChart && !!format) {
        bottom = d3.axisBottom(this.x).tickFormat(d3.timeFormat(format))

    }
    // Add the x Axis
    this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(bottom)
    ;

    // text label for the x axis
    if (!!bottomLabel) {
        this.svg.append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," +
                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text(bottomLabel)
        ;
    }

    // Add the y Axis
    this.svg.append("g")
        .call(d3.axisLeft(this.y));

    if (!!leftLabel) {
        // text label for the y axis
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(leftLabel)
        ;
    }
};

Chart2D.prototype.renderTimeRangeSelector = function renderTimeRangeSelector() {

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
                        self.setFilters();
                        self.showVisits();
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

Chart2D.prototype.renderChart = function renderChart(events) {

    let self = this;

    self.myLine = this.svg.selectAll('.line-graph').data(this.lineData).enter()
        .append('g')
        .attr('class', function (l) {
            return 'line-graph car-id-' + l.context.carId;
        })
        .style('visibility', function (line) {
            return line.visibility = 'visible';
        })
    ;

    self.myLine
        .append('path')
        .attr("class", function (line) {
            return "line line-multi-visit-" + (!!line.context.multiEnterExit ? 1 : 0)
        })
        .attr("d", function (line) {
            return line.valueLine(line.data);
        })
        .style('stroke-width', self.options.defaultLineWidth)
        .style('stroke', '#000000')
        .style("stroke-dasharray", function (line) {
            return !!line.data.sameLocation ? ("3, 3") : null;
        })

        // .style('stroke', function (line) {
        //
        //     return line.context.color;
        // })
        .style('fill', 'none')
    ;

    if (!!events && events.length > 0) {
        events.forEach(function (e) {
            self.myLine.on(e.name, function (l, index) {
                // e.callback(e.params, l, index);

                let event = {
                    name: e.name,
                    line: l
                };

                if (!!self.eventHandler) {
                    self.eventHandler.fireEvent(event);
                }
            });
        })
    }

    this.renderPassingGates();

    // self.svg.on("mousemove", function() {
    //     self.fisheye.focus(d3.mouse(this));
    //     self.myLine.selectAll('.line')
    //         .attr("d", function(line) {
    //                 let data = line.data.map(function (carPoint) {
    //
    //                     let tmp = carPoint[line.x];
    //                     let myFish = {x: tmp.getTime(), y: carPoint[line.y]};
    //                     let afterFish = self.fisheye(myFish);
    //
    //                     // carPoint[line.y] = self.fisheye(carPoint[line.y]);
    //
    //                     debugger;
    //                     return carPoint;
    //                 });
    //
    //                 return line.valueLine(data);
    //             }
    //         );
    // });
};

Chart2D.prototype.renderPassingGates = function renderPassingGates() {
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


Chart2D.prototype.getMyLines = function getMyLines() {
  return this.myLine;
};



Chart2D.prototype.highlightSingleVisit = function highlightSingleVisit (carId) {

    let self = this;
    self.myLine
        .style('opacity', function (l) {

            return l.context.carId == carId ? 1 : 0.01;
        })
        .style('stroke-width', function (l) {
            return l.context.carId == carId ? 1 : self.options.defaultLineWidth;
        })
    ;

    self.svg.selectAll('.gate-car-id-' + carId)
        .attr('r', 2)
    ;
};

Chart2D.prototype.clearSetting = function highlightSingleVisit () {

    let self = this;
    self.myLine
        .style('opacity', 1)
        .style('stroke-width', self.options.defaultLineWidth)
    ;

    self.svg.selectAll('.passing-gate')
        .attr('r', 0.5)
    ;
};

Chart2D.prototype.setFilters = function setFilters (entranceType, vehicleCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {


    if (!entranceType || !vehicleCategory || !campingBehavior || !velocityBehavior || !velocityLimit || !durationBehavior || !durationThreshold) {
        entranceType = document.getElementById('entranceType').value;
        vehicleCategory = document.getElementById('vehicleCategory').value;
        campingBehavior = document.getElementById('campingBehavior').value;
        velocityBehavior =  document.getElementById('velocityBehavior').value;
        velocityLimit = document.getElementById('velocityLimit').value;
        durationBehavior =  document.getElementById('durationBehavior').value;
        durationThreshold = document.getElementById('durationThreshold').value;
    }

    let self = this;
    self.filters['entranceType'] = entranceType;
    self.filters['vehicleCategory'] = vehicleCategory;
    self.filters['campingBehavior'] = campingBehavior;
    self.filters['velocityBehavior'] = velocityBehavior;
    self.filters['velocityLimit'] = velocityLimit;
    self.filters['durationBehavior'] = durationBehavior;
    self.filters['durationThreshold'] = durationThreshold;


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
    self.filters['startTime'] = startTime;
    self.filters['endTime'] = endTime;

};

/**
 * This will highlight only visits that interfere with the time range specified. Out of this range will be hidden.
 */
Chart2D.prototype.showVisits = function showVisits() {
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

Chart2D.prototype.highLightMultiVisits = function highLightMultiVisits (carCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {
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

Chart2D.prototype.highLightSingleVisitOvernight = function highLightSingleVisitOvernight (carCategory, campingBehavior,  velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {
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

Chart2D.prototype.highLightNoExit = function highLightNoExit(carCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {
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

Chart2D.prototype.highLightAllTypesOfVisit = function highLightAllTypesOfVisit (carCategory, campingBehavior, velocityBehavior, velocityLimit, durationBehavior, durationThreshold) {
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

Chart2D.prototype.highLightSingleEntranceNotOvernightVisit = function highLightSingleEntranceNotOvernightVisit (carCategory, campingBehavior, velocityBehavior, velocityLimit,  durationBehavior, durationThreshold) {
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