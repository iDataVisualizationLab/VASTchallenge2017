'use strict';
class VisitChart2D extends Chart2D {
    constructor(svg, width, height, options) {
        super(svg, width, height, options);

        this.filters = {};

        let op = this.options;

        if (!op.defaultGateRadius) {
            op.defaultGateRadius = 0.5;
        }

        if (!op.gatesForVisitingCars) {
            op.gatesForVisitingCars = ['gate', 'entrance', 'camping'];
        }

        if (!op.gatesForInternalCars) {
            op.gatesForInternalCars = ['camping', 'ranger-stop', 'ranger-base'];
        }

        this.tooltip = new TooltipHelper('tooltip');
    }

    renderTimeRangeSelector() {

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

    }

    renderChart(events) {

        super.renderChart(events);

        let myLines = super.getMyLines();
        myLines.style("stroke-dasharray", function (line) {

            return !!line.data.sameLocation ? ("3, 3") : null;
        });

        this.renderPassingGates();

    }

    renderPassingGates() {
        let self = this;
        let gateVisiting = self.options.gatesForVisitingCars; //['gate', 'entrance', 'camping'];
        let gateInternal = self.options.gatesForInternalCars; //['camping', 'ranger-stop', 'ranger-base'];

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
                .attr('r', self.options.defaultGateRadius)
                .attr('cx', function (d) {
                    let xKey = line.x;
                    return self.x(d[xKey]) + self.options.offSetX;
                })
                .attr('cy', function (d) {
                    let yKey = line.y;
                    return self.y(d[yKey]) + self.options.offSetY;
                })
                .style('fill', function (d) {
                    return d.mapPoint.getColor();
                })
                .on('mouseover', function (cp) {
                    self.tooltip.render(createGateTooltipHtml(cp));
                })
                .on('mouseout', function (d) {
                    self.tooltip.hide();
                })
            ;
        });
    }

    highlightSingleVisit (carId) {

        let self = this;

        // reduce opacity first
        self.myLine.filter(function (d) {
            return d.visibility == 'visible';
        })
            .style('opacity', function (d) {
                return d.opacity = 0.8;
            })
            .each(function (d) {
                d3.select(this)
                    .select('path')
                    .style('stroke-width', self.options.defaultLineWidth)
                ;
            })

        ;

        self.svg.selectAll('.passing-gate')
            .attr('r', 0.5)
        ;

        // increase opacity for ones we want to highlight
        self.svg.selectAll('.car-id-' + carId)
            .style('opacity', function (d) {
                return d.opacity = 1;
            })
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
    }

    clearSetting () {

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
    }

    setFilters (entranceType, data) {

        let self = this;

        let carType = data['carType'];
        let camping = data['camping'];
        let stopCount = data['stopCount'];
        let stopDuration = data['stopDuration'];
        let velocity = data['velocity'];
        let visitDuration = data['visitDuration'];
        let overnight = data['overnight'];

        self.filters['entranceType'] = entranceType;
        self.filters['carType'] = carType;
        self.filters['camping'] = camping;
        self.filters['stopCount'] = stopCount;
        self.filters['stopDuration'] = stopDuration;
        self.filters['velocity'] = velocity;
        self.filters['visitDuration'] = visitDuration;
        self.filters['overnight'] = overnight;
    }

    updateTimeSelectors() {
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
    }

    highLightVisits() {
        let self = this;
        let carType = self.filters['carType'];
        let camping = self.filters['camping'];
        let stopCount = self.filters['stopCount'];
        let stopDuration = self.filters['stopDuration'];
        let velocity = self.filters['velocity'];
        let visitDuration = self.filters['visitDuration'];
        let overnight = self.filters['overnight'];
        let time = self.filters['time'];



        // Generate visibility expression
        let ex = function (line) {

            let ctx = line.context;

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

            // stop duration
            if (!!stopDuration && (ctx.stopDuration > stopDuration[0] || ctx.stopDuration < stopDuration[1])) {
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

            if (ctx.display == 'none') {
                return line.visibility = 'hidden';
            }

            return line.visibility = 'visible';
        };

        self.myLine.style('visibility', ex);
    }

}
