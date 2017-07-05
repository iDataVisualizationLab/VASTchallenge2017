'use strict';

class Chart2D {
    constructor(svg, width, height, options) {


        this.width = width;
        this.height = height;

        if (!options) {
            options = {};
        }

        if (!options) {
            options = {};
        }
        let margin = {top: 20, right: 20, bottom: 50, left: 70};
        if (!options.margin) {
            options.margin = margin;
        }

        if (!options.offSetX) {
            options.offSetX = 0;
        }

        if (!options.offSetY) {
            options.offSetY = 0;
        }

        if (!options.hasOwnProperty('removeChildren')) {
            options['removeChildren'] = true;
        }


        this.lineData = [];
        this.options = options;

        // let margin = this.options.margin;

        // this.svg.attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.top + margin.bottom)
        // ;

        // set the ranges
        this.x = !!this.options.timeChart ? d3.scaleTime().range([0, width]) :  d3.scaleLinear().range([0, width]);
        this.y = d3.scaleLinear().range([height, 0]);

        if (!this.options.defaultLineWidth) {
            this.options.defaultLineWidth = 0.2;
        }

        this.filters = {};

        this.nativeSvg = svg;

        if (!!options.removeChildren) {
            this.nativeSvg.selectAll('*').remove();
        }

        this.svg = this.nativeSvg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")
        ;
    }

    setEventHandler(eventHandler) {
        this.eventHandler = eventHandler;
    }

    addData(context, dataArray, xKey, yKey) {

        if (!this.lineData) {
            this.lineData = [];
        }

        // if (!xKey) {
        //     xKey = 'x';
        // }
        //
        // if (!yKey) {
        //     yKey = 'y';
        // }

        if (!context) {
            context = {};
        }


        if (!context.color) {
            context.color = '#000000';
        }

        let self = this;

        let valueLine = d3.line()
                .x(function(d, idx) {
                    let mx = !!xKey ? self.x(d[xKey]) : self.x(idx);
                    return mx + self.options.offSetX;
                })
                .y(function(d, idx) {
                    let my = !!yKey ? self.y(d[yKey]) : self.y(idx);
                    return my + self.options.offSetY;
                })
            ;

        self.lineData.push( {valueLine: valueLine, data: dataArray, context: context, x: xKey, y: yKey});
    }

    sortData() { // for hourly graph
        // lines.sort(function (l1, l2) {
        //     return getTimeInDayBySeconds(l1.startTime) - getTimeInDayBySeconds(l2.startTime);
        // });


        this.lineData.sort(function (d1, d2) {
            let l1 = d1.context;
            let l2 = d2.context;

            let t1 = getTimeInDayBySeconds(l1.contextStartTime);
            let t2 = getTimeInDayBySeconds(l2.contextStartTime);
            return  (t1- t2);
        });

    }

    renderChart(events) {

        let self = this;

        self.myLine = this.svg.selectAll('.line-graph').data(this.lineData).enter()
            .append('g')
            .attr('class', function (l) {
                return 'line-graph car-id-' + l.context.carId;
            })
            .style('visibility', function (line) {
                return line.visibility = 'visible';
            })
            .style('opacity', function (line) {
                return line.opacity = 1;
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

                    if (!!e.handler && typeof e.handler === 'function') {
                        e.handler.apply(e.context, [event]);
                    }

                    if (!!self.eventHandler) {
                        self.eventHandler.fireEvent(event);
                    }
                });
            })
        }
    }

    renderAxis(bottomLabel, leftLabel, format) {

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
    }

    setXDomain(min, max) {
        this.x.domain([min, max]);
    }

    setYDomain(min, max) {
        this.y.domain([min, max]);
    }

    getVisibleLines() {

        let myVisits = [];
        this.myLine.each(function (line) {
            if (line.visibility == 'visible' && line.opacity == 1) {
                myVisits.push(line);
            }
        });

        console.log('visible lines: ' + myVisits.length);
        return myVisits;
    }

    getMyLines() {
        return this.myLine;
    }

    getNativeSvg() {
        return this.nativeSvg;
    }

    bindSvgEvent(event, handler) {
        let nativeSvg = this.nativeSvg;
        nativeSvg.on('click', handler);
    }
}
