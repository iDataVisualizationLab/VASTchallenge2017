var Chart2D = function Chart2D(svg, width, height, options) {
    this.svg = svg;
    this.width = width;
    this.height = height;

    if (!options) {
        options = {};
    }

    this.options = options;

    // set the ranges
    this.x = !!this.options.timeChart ? d3.scaleTime().range([0, width]) :  d3.scaleLinear().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);
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

Chart2D.prototype.renderChart = function renderChart(events) {

    let self = this;
    self.myLine = this.svg.selectAll('.line-graph').data(this.lineData).enter()
        .append('g')
        .attr('class', function (l) {
            return 'line-graph car-id-' + l.context.carId;
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
        .style('stroke-width', 0.5)
        .style('stroke', function (line) {

            return line.context.color;
        })
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
};

Chart2D.prototype.renderPassingGates = function renderPassingGates(gates) {
    let self = this;

    if (!gates) {
        // gates = ['gate', 'general', 'entrance', 'camping', 'ranger-stop', 'ranger-base'];
        gates = ['gate', 'entrance', 'camping', 'ranger-base'];
    }

    self.myLine.each(function (line) {
        let myEndPoints = line.data.filter(function (cp) {

            for(let i=0; i< gates.length; i++) {
                if (cp.getGate().startsWith(gates[i])) {
                    return true;
                }
            }

            return false;
        });

        if (myEndPoints.length > 0) {
            debugger;
        }


        d3.select(this).selectAll('.passing-gate').data(myEndPoints).enter()
            .append('circle')
            .attr('class', 'passing-gate gate-car-id-' + line.context.carId)
            .attr('r', 1)
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
    self.myLine.selectAll('.line')
        .style('opacity', function (l) {

            return l.context.carId == carId ? 1 : 0.1;
        })

};

Chart2D.prototype.clearSetting = function highlightSingleVisit () {

    let self = this;
    self.myLine.selectAll('.line')
        .style('opacity', 1)

};

Chart2D.prototype.highLightMultiVisits = function highLightMultiVisits (carCategory, campingBehavior, velocityBehavior) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    let self = this;
    this.myLine
        //.selectAll('.line')
        // .style('opacity', function (line) {
        //     if (carCategory == 'car-all') {
        //         return line.context.entranceCount > 2 ? 1 : 0;
        //     }
        //     else if (carCategory == 'car-internal') {
        //         return (line.context.entranceCount > 2 && line.context.carType == '2P') ? 1 : 0;
        //     }
        //
        //     return (line.context.entranceCount > 2 && line.context.carType != '2P') ? 1 : 0;
        //
        // })
        .style('visibility', function (line) {
            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    if (velocityBehavior == 'all') {
                        return line.context.entranceCount > 2 ? 'visible' : 'hidden';
                    }else if (velocityBehavior == 'below-limit') {
                        return line.context.entranceCount > 2 && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    }else {
                        return line.context.entranceCount > 2 && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    }
                }
                else {
                    switch (velocityBehavior) {
                        case 'all':
                            return line.context.entranceCount > 2 && line.context.camping == campingBehavior ? 'visible' : 'hidden';
                        case 'below-limit':
                            return line.context.entranceCount > 2 && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                        case 'above-limit':
                            return line.context.entranceCount > 2 && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    }
                }
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return (line.context.entranceCount > 2 && line.context.carType == '2P') ? 'visible' : 'hidden';
                        case 'below-limit':
                            return (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                        case 'above-limit':
                            return (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                    }
                }
                else {
                    switch (velocityBehavior) {
                        case 'all':
                            return (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                        case 'below-limit':
                            return (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                        case 'above-limit':
                            return (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                    }
                }
            }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {

                    switch (velocityBehavior) {
                        case 'all':
                            return (line.context.entranceCount > 2 && line.context.carType != '2P') ? 'visible' : 'hidden';
                        case 'below-limit':
                            return (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                        case 'above-limit':
                            return (line.context.entranceCount > 2 && line.context.carType != '2P') && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    }

                }

                switch (velocityBehavior) {
                    case 'all':
                        return (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                    case 'below-limit':
                        return (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    case 'above-limit':
                        return (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                }

            }

            if (carCategory == 'all') {
                switch (velocityBehavior) {
                    case 'all':
                        return (line.context.entranceCount > 2 && line.context.carType == carCategory) ? 'visible' : 'hidden';
                    case 'below-limit':
                        return (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    case 'above-limit':
                        return (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                }

            }

            switch (velocityBehavior) {
                case 'all':
                    return (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                case 'below-limit':
                    return (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                case 'above-limit':
                    return (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
            }
        })
    ;
};

Chart2D.prototype.highLightSingleVisit = function highLightSingleVisit (carCategory, campingBehavior,  velocityBehavior) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    this.myLine
        // .selectAll('.line')
        // .style('opacity', function (line) {
        //
        //     if (carCategory == 'car-all') {
        //         return line.context.entranceCount < 3 ?  1 : 0.01;
        //     }
        //     else if (carCategory == 'car-internal') {
        //         return (line.context.entranceCount < 3 && line.context.carType == '2P') ?  1 : 0.01;
        //     }
        //
        //     return (line.context.entranceCount < 3 && line.context.carType != '2P') ? 1 : 0.01;
        // })
        .style('visibility', function (line) {

            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return line.context.entranceCount < 3 ?  'visible' : 'hidden';
                        case 'below-limit':
                            return line.context.entranceCount < 3 && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ?  'visible' : 'hidden';
                        case 'above-limit':
                            return line.context.entranceCount < 3 && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ?  'visible' : 'hidden';
                    }
                }

                switch (velocityBehavior) {
                    case 'all':
                        return line.context.entranceCount < 3 && line.context.camping == campingBehavior ?  'visible' : 'hidden';
                    case 'below-limit':
                        return line.context.entranceCount < 3 && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ?  'visible' : 'hidden';
                    case 'above-limit':
                        return line.context.entranceCount < 3 && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ?  'visible' : 'hidden';
                }
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return (line.context.entranceCount < 3 && line.context.carType == '2P') ? 'visible' : 'hidden';
                        case 'below-limit':
                            return (line.context.entranceCount < 3 && line.context.carType == '2P' && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                        case 'above-limit':
                            return (line.context.entranceCount < 3 && line.context.carType == '2P'&& line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                    }

                }

                switch (velocityBehavior) {
                    case 'all':
                        return (line.context.entranceCount < 3 && line.context.carType == '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                    case 'below-limit':
                        return (line.context.entranceCount < 3 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    case 'above-limit':
                        return (line.context.entranceCount < 3 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                }

            }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return (line.context.entranceCount < 3 && line.context.carType != '2P') ? 'visible' : 'hidden';
                        case 'below-limit':
                            return (line.context.entranceCount < 3 && line.context.carType != '2P' && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                        case 'above-limit':
                            return (line.context.entranceCount < 3 && line.context.carType != '2P' && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    }

                }

                switch (velocityBehavior) {
                    case 'all':
                        return (line.context.entranceCount < 3 && line.context.carType != '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                    case 'below-limit':
                        return (line.context.entranceCount < 3 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    case 'above-limit':
                        return (line.context.entranceCount < 3 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                }

            }

            if (campingBehavior == 'all') {
                switch (velocityBehavior) {
                    case 'all':
                        return (line.context.entranceCount < 3 && line.context.carType == carCategory) ? 'visible' : 'hidden';
                    case 'below-limit':
                        return (line.context.entranceCount < 3 && line.context.carType == carCategory && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    case 'above-limit':
                        return (line.context.entranceCount < 3 && line.context.carType == carCategory && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                }
            }

            switch (velocityBehavior) {
                case 'all':
                    return (line.context.entranceCount < 3 && line.context.carType == carCategory && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                case 'below-limit':
                    return (line.context.entranceCount < 3 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                case 'above-limit':
                    return (line.context.entranceCount < 3 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
            }
        })
    ;
};

Chart2D.prototype.highLightNoExit = function highLightNoExit(carCategory, campingBehavior, velocityBehavior) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    this.myLine
        //.selectAll('.line')
        // .style('opacity', function (line) {
        //
        //     if (carCategory == 'car-all') {
        //         return line.context.entranceCount < 2 ?  1 : 0.01;
        //     }
        //     else if (carCategory == 'car-internal') {
        //         return (line.context.entranceCount < 2 && line.context.carType == '2P') ?  1 : 0.01;
        //     }
        //
        //     return (line.context.entranceCount < 2 && line.context.carType != '2P') ? 1 : 0.01;
        // })
        .style('visibility', function (line) {

            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {

                    switch (velocityBehavior) {
                        case 'all':
                            return line.context.entranceCount < 2 ?  'visible' : 'hidden';
                        case 'below-limit':
                            return line.context.entranceCount < 2 && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ?  'visible' : 'hidden';
                        case 'above-limit':
                            return line.context.entranceCount < 2 && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ?  'visible' : 'hidden';
                    }
                }

                switch (velocityBehavior) {
                    case 'all':
                        return line.context.entranceCount < 2 && line.context.camping == campingBehavior ?  'visible' : 'hidden';
                    case 'below-limit':
                        return line.context.entranceCount < 2 && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ?  'visible' : 'hidden';
                    case 'above-limit':
                        return line.context.entranceCount < 2 && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ?  'visible' : 'hidden';
                }
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return (line.context.entranceCount < 2 && line.context.carType == '2P') ? 'visible' : 'hidden';
                        case 'below-limit':
                            return (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                        case 'above-limit':
                            return (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ) ? 'visible' : 'hidden';
                    }
                }

                switch (velocityBehavior) {
                    case 'all':
                        return (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                    case 'below-limit':
                        return (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    case 'above-limit':
                        return (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                }
            }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return (line.context.entranceCount < 2 && line.context.carType != '2P') ? 'visible' : 'hidden';
                        case 'below-limit':
                            return (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                        case 'above-limit':
                            return (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    }

                }

                switch (velocityBehavior) {
                    case 'all':
                        return (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                    case 'below-limit':
                        return (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    case 'above-limit':
                        return (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                }
            }

            if (campingBehavior == 'all') {
                switch (velocityBehavior) {
                    case 'all':
                        return (line.context.entranceCount < 2 && line.context.carType == carCategory) ? 'visible' : 'hidden';
                    case 'below-limit':
                        return (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                    case 'above-limit':
                        return (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                }
            }

            switch (velocityBehavior) {
                case 'all':
                    return (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
                case 'below-limit':
                    return (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
                case 'above-limit':
                    return (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10) ? 'visible' : 'hidden';
            }
        })
    ;
};

Chart2D.prototype.highLightAllTypesOfVisit = function highLightAllTypesOfVisit (carCategory, campingBehavior, velocityBehavior) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    this.myLine
        //.selectAll('.line')
        // .style('opacity', function (line) {
        //     if (carCategory == 'car-all') {
        //         return 1;
        //     }
        //     else if (carCategory == 'car-internal') {
        //         return line.context.carType == '2P' ? 1 : 0.01;
        //     }
        //
        //     return  line.context.carType != '2P' ? 1 : 0.01;
        // })
        .style('visibility', function (line) {
            if (carCategory == 'car-all') {

                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return 'visible';
                        case 'below-limit':
                            return line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                        case 'above-limit':
                            return line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    }
                }

                let myVisibility = 'visible';
                switch (velocityBehavior) {
                    case 'all':
                        myVisibility = line.context.camping == campingBehavior ? 'visible' : 'hidden';
                        break;
                    case 'below-limit':
                        myVisibility = line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                        break;
                    case 'above-limit':
                        myVisibility = line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                        break;
                }

                return myVisibility;
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return line.context.carType == '2P' ? 'visible' : 'hidden';
                        case 'below-limit':
                            return line.context.carType == '2P' && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                        case 'above-limit':
                            return line.context.carType == '2P' && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    }
                }

                switch (velocityBehavior) {
                    case 'all':
                        return line.context.carType == '2P' && line.context.camping == campingBehavior ? 'visible' : 'hidden';
                    case 'below-limit':
                        return line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    case 'above-limit':
                        return line.context.carType == '2P' && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                }
            }
            else if (carCategory == 'car-visiting') {

                if (campingBehavior == 'all') {
                    switch (velocityBehavior) {
                        case 'all':
                            return line.context.carType != '2P' ? 'visible' : 'hidden';
                        case 'below-limit':
                            return line.context.carType != '2P' && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                        case 'above-limit':
                            return line.context.carType != '2P' && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    }

                }

                switch (velocityBehavior) {
                    case 'all':
                        return line.context.carType != '2P' && line.context.camping == campingBehavior ? 'visible' : 'hidden';
                    case 'below-limit':
                        return line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    case 'above-limit':
                        return line.context.carType != '2P' && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                }
            }

            if (campingBehavior == 'all') {
                switch (velocityBehavior) {
                    case 'all':
                        return  line.context.carType == carCategory ? 'visible' : 'hidden';
                    case 'below-limit':
                        return  line.context.carType == carCategory && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                    case 'above-limit':
                        return  line.context.carType == carCategory && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                }

            }

            switch (velocityBehavior) {
                case 'all':
                    return  line.context.carType == carCategory && line.context.camping == campingBehavior ? 'visible' : 'hidden';
                case 'below-limit':
                    return  line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity <= ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
                case 'above-limit':
                    return  line.context.carType == carCategory && line.context.camping == campingBehavior && line.context.velocity > ParkMap.SPEED_LIMIT_EXTRA_10 ? 'visible' : 'hidden';
            }
        })
    ;
};
