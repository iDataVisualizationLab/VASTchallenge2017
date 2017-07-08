var ParallelCoordinate = function ParallelCoordinate(svg, width, height, dataSet, options) {

    if (!options) {
        options = {
            margin: {top: 30, right: 10, bottom: 10, left: 30},
            width: width,
            height: height
        };

        this.options = options;
    }

    let margin = options.margin;

    this.width = width - margin.left - margin.right;
    this.height = height - margin.top - margin.bottom;

    this.svg =  svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;

    this.dataSet = dataSet;

    this.init();
};

ParallelCoordinate.prototype.setEventHandler = function setEventHandler(eventHandler) {
    this.eventHandler = eventHandler;
};

ParallelCoordinate.prototype.init = function init() {
    this.x = d3.scaleBand().range([0, this.width]);
    this.y = {};
    this.dragging = {};
    this.axis = d3.axisLeft();

    this.dimensions = [];

    this.line = d3.line().x(function (d) {
                                return d[0];
                            })
                        .y(function (d) {
                            return d[1];
                        });

    this.types = {
        "Number": {
            key: "Number",
            coerce: function(d) { return +d; },
            extent: function (ds, accessKey) {
                return d3.extent(ds, function (row) {
                    return +row[accessKey];
                })
            },            within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
            defaultScale: d3.scaleLinear().range([this.height, 0])
        },
        "String": {
            key: "String",
            coerce: String,
            extent: function (data, accessKey) {
                let myData =  data.map(function (d) {
                    return d[accessKey];
                });

                myData.sort();
                return myData.reverse();
            },
            within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
            defaultScale: d3.scalePoint().range([0, this.height])
        },
        "Date": {
            key: "Date",
            coerce: function(d) { return new Date(d); },
            extent: function (ds, accessKey) {
                return d3.extent(ds, function (row) {
                    return +row[accessKey];
                })
            },
            within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
            defaultScale: d3.scaleTime().range([0, this.height])
        }
    };

    this.axisConfig = {};
};

/**
 * Add new dimension to the parallel coordinates
 *
 * @param dimension
 * @param accessKey nullable. Default value is the same as dimension
 * @param type: to decide domain and scale of vertical axis

 */
ParallelCoordinate.prototype.addDimension = function addDimension(dimension, accessKey, type) {

    if (!accessKey) {
        accessKey = dimension;
    }

    if (!type) {
        type = 'Number';
    }

    let self = this;

    let options = self.types[type];
    let domain = options.extent(self.dataSet, accessKey);

    this.axisConfig[accessKey] = {
        label: dimension,
        type: type,
        options: self.types[type],
        domain: domain,
        counts: this.getDensityValues(accessKey, domain, type)
    };

    self.updateYDomain(accessKey, domain);

    self.dimensions.push(accessKey);

    this.setDomain();
};

ParallelCoordinate.prototype.getDensityValues = function getDensityValues(accessKey, domain, type) {

    let counts = {};
    let val;

    if (!type) {
        type = 'Number';
    }

    if (type != 'Number') {
        this.dataSet.forEach(function (d) {
            val = d[accessKey];

            if (!counts.hasOwnProperty(val)) {
                counts[val] = 0;
            }

            counts[val] ++;
        });
    }
    else {

        let numPoints = 100, min = domain[0], max = domain[1];
        let step = (max - min) / numPoints;
        let p, k, i = 0;
        let keys = [];

        do {
            p = step * i + min;
            if (p > domain[1]) {
                break;
            }

            counts[p] = 0;
            keys.push(p);
            i ++;
        }
        while(true);

        this.dataSet.forEach(function (d) {
            val = d[accessKey];

            for(let i=0; i < keys.length; i++) {
                k = keys[i];

                if (val <= k) {
                    counts[k] ++;
                    break;
                }
            }


        })
    }



    return counts;
};

ParallelCoordinate.prototype.getVisibleLines = function getVisibleLines() {

    let self = this;

    let myLines = [];
    self.foreground.each(function (l) {

        if (l.display == 'none') {
            return;
        }

        myLines.push(l);
    });

    return myLines;
};

ParallelCoordinate.prototype.updateYDomain = function updateYDomain(accessKey, newDomain) {
    let self = this;
    let type = self.axisConfig[accessKey].type;

    if (type == 'Number') {

        let lowerBound = Math.floor(newDomain[0]);
        let upperBound = Math.ceil(newDomain[1]);
        self.y[accessKey] = d3.scaleLinear()
            .domain([lowerBound, upperBound])
            .range([self.height, 0])
        // .range([0, self.height])
        ;
    }
    else {
        if (accessKey == 'carType') {
            newDomain = ["6", "5", "4", "3", "2", "1", "2P"];
        }

        let myScale = d3.scalePoint()
                .domain(newDomain)
                .range([0, self.height])
            ;

        myScale.invert = (function(){
            let domain = myScale.domain();
            let range = myScale.range();
            let scale = d3.scaleQuantize().domain(range).range(domain);

            return function(x){

                let re = scale(x);
                return re;
            }
        })();

        self.y[accessKey] = myScale;
    }
};

ParallelCoordinate.prototype.setDomain = function setDomain() {
    let self = this;

    // Extract the list of dimensions and create a scale for each.
    self.x.domain(self.dimensions);
};

ParallelCoordinate.prototype.clear = function clear() {
    let self = this;

    self.svg.selectAll('*').remove();
};


ParallelCoordinate.prototype.getSelectionDomain = function getSelectionDomain(dim, context) {
    let self = this;
    let selectionDomain = d3.brushSelection(context);
    if (!selectionDomain) {
        return null;
    }

    selectionDomain = selectionDomain.map(function (val) {
        return self.y[dim].invert(val);
    });

    return selectionDomain;
};


/**
 * update by time.
 * @param startDate
 * @param endDate
 * @param stops
 */
ParallelCoordinate.prototype.updatePCByTime = function updatePCByTime(startDate, endDate, stops) {

    let self = this;
    // update display for parallel coordinates
   self.updateByActiveSelection(startDate, endDate, stops);
   if (isNaN(self.filter)) {
       self.filter = {};
   }

   if (!!startDate && !!endDate) {
       self.filter['time'] = [startDate, endDate];
   }

    self.filter['stops'] = stops;


    // update display for other graphs via event dispatching
    if (!!self.eventHandler) {
        let event = {
            name: 'timeChange'
        };

        self.eventHandler.fireEvent(event);
    }
};

/**
 *
 * @param stops
 */
ParallelCoordinate.prototype.removeTimeConstraint = function removeTimeConstraint(stops) {
    let self = this;

    // update display for parallel coordinates
    self.filter = {}; // !Important - remove cached values, otherwise updateByActiveSelection will pick the cached ones

    self.updateByActiveSelection(null, null, stops);

    // update display for other graphs via event dispatching
    if (!!self.eventHandler) {
        let event = {
            name: 'timeChange'
        };

        self.eventHandler.fireEvent(event);
    }
};

/**
 *
 * @param startTime get from cached filter if null
 * @param endTime
 * @param stops
 * @return {{}}
 */
ParallelCoordinate.prototype.updateByActiveSelection = function updateByActiveSelection(startTime, endTime, stops) {
    let self = this;
    let actives = [];
    let extents = [];

    let params = {};

    if (!!self.filter && self.filter.hasOwnProperty('time')) {
        if (!startTime) {
            let timeRange = self.filter['time'];
            startTime = timeRange[0];
            endTime = timeRange[1];
        }
    }

    self.svg.selectAll(".brush")
        .filter(function(d) {
            return d3.brushSelection(this);
        })
        .each(function(d) {
            actives.push(d);
            let selectionDomain = self.getSelectionDomain(d, this);

            extents.push(selectionDomain);

            params[d] = selectionDomain;

        });

    // update display for parallel coordinates
    self.foreground.style("display", function(line) {

        let myDp = actives.every(function(dim, i) {

            let max = extents[i][0];
            let min = extents[i][1];
            let val = line[dim];

            let dp = val >= min && val <= max;

            // console.log('min: ' + min + "; max: " + max + "; val: " + val + ";visibility:" + dp);

            return !!dp;
        });

        if (!!startTime && !!endTime && !!myDp) {
            myDp = !(line.startTime.getTime() >= endTime.getTime() || line.endTime.getTime() <= startTime.getTime())
        }

        if (!!myDp && !!stops && stops.length > 0  && !!line.stops) {

            myDp = Object.keys(line.stops).some(function (st) {
                return stops.indexOf(st) >= 0;
            });
        }

        return line.display = (myDp ? null : "none");
    });

    return params;
};

ParallelCoordinate.prototype.renderGraph = function renderGraph() {

    let self = this;

    // Add grey background lines for context.
    let myDataSet = self.dataSet.filter(function (l) {
        return l.display != 'none';
    });

    self.clear();

    let background = self.svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(myDataSet)
        .enter().append("path")
        .attr("d", path)
        .style('stroke-width', 0.2)
    ;

    // Add blue foreground lines for focus.
    self.foreground = self.svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(myDataSet)
        .enter().append("path")
        .attr("d", path)
        .style('stroke-width', 0.2)

    ;

    // Add a group element for each dimension.
    var g = self.svg.selectAll(".dimension")
        .data(self.dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + self.x(d) + ")"; })
        ;

    // Add an axis and title.

    var area = d3.area()
        .x(function(d) { return x(d.date); })
        .y1(function(d) { return y(d.close); });

    let sizes = {};
    let myData = [];
    g.append("g")
        .attr("class", function (d) {
            return "axis axis-" + d;
        })
        .each(function(d, index) {
                   d3.select(this).call(self.axis.scale(self.y[d]));

                   // if (self.axisConfig[d].type != 'Number') {
                   //     d3.select(this).selectAll('.tick').each(function (d) {
                   //         d3.select(this).select('line')
                   //             .attr("x2", function (tf, index) {
                   //
                   //                 let xTranslate = 100 + 80 * Math.random();
                   //
                   //                 sizes[index] = xTranslate;
                   //
                   //                 return xTranslate;
                   //             })
                   //             .attr('transform', function (d, index) {
                   //                 let xTranslate = sizes[index];
                   //
                   //                 return "translate(-" + xTranslate/ 2 + ",0)";
                   //             })
                   //         ;
                   //     })
                   //     ;
                   // }
                   // else {
                   //     // area chart
                   //
                   //     d3.select(this)
                   //          .append("path")
                   //             .datum(myData)
                   //             .attr("fill", "steelblue")
                   //             .attr("d", area);
                   // }

        })
        .append("text")
        .style("text-anchor", "middle")
        .style('fill', '#000000')
        .attr("y", -9)
        .text(function(d) { return self.axisConfig[d].label; })
        .style('font-weight', function (dim) {
            let selected = self.axisConfig[dim].selected;

            return !!selected ? 'bold' : 'normal';
        })
        .on('click', function (d) {

            let type = self.axisConfig[d].type;
            if (type != 'Number') {
                alert('Do not support viewing details of this dimension.');
                return; // do not support zoom-in
            }

            let selected = !!self.axisConfig[d].selected;
            self.axisConfig[d].selected = !selected;

            updateScale(d);

        })
    ;

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", function (dim) {
            return "brush brush-" + dim;
        })
        .each(function(d) {
//                    d3.select(this).call(y[d].brush = d3.brushY().extent(y[d]).on("start", brushstart).on("brush", brush));

            let brushScale = self.y[d];
            let bRange = brushScale.range();

            // let myBrush = d3.brushY()
            //     .extent([[0, brushScale.range()[0]], [19, brushScale.range()[1]]])
            //         .on("start", brushstart)
            //         .on("brush", brush)
            //     ;
            let myBrush = d3.brushY()
                    .extent([[-10, 0], [10, self.height]])
                    .on("start", brushstart)
                    // .on("brush", brush)
                    .on("end", brush)
                ;
            self.y[d].brush = myBrush;

            d3.select(this).call(self.y[d].brush);

        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function position(d) {
        var v = self.dragging[d];
        return v == null ? self.x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
        let xy = self.dimensions.map(function(p) {

            if (p == 'cylinders') {
                let myY = self.y[p](d[p]);
                return [position(p), myY];

            }
            return [position(p), self.y[p](d[p])];
        });

        return self.line(xy);
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        let params = self.updateByActiveSelection();
        // update display for other graphs via event dispatching
        if (!!self.eventHandler) {
            let event = {
                name: 'brushEnd',
                data: params
            };

            self.eventHandler.fireEvent(event);
        }

    }

    function getSelectionDomain(dim, context) {
        let selectionDomain = d3.brushSelection(context);
        if (!selectionDomain) {
            return null;
        }

        selectionDomain = selectionDomain.map(function (val) {
            return self.y[dim].invert(val);
        });

        return selectionDomain;
    }

    function updateScale(dim) {
        let config = self.axisConfig[dim];
        if(!config) {
            return;
        }

        self.svg.selectAll('.brush-' + dim)
            .each(function () {
                let selectionDomain = getSelectionDomain(dim, this);

                self.updateYDomain(dim, selectionDomain == null ? self.axisConfig[dim].domain : selectionDomain.reverse());

                self.renderGraph();

            })
        ;

    }
};
