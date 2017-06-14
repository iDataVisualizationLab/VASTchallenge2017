var ParallelCoordinate = function ParallelCoordinate(svg, width, height, dataSet, options) {

    if (!options) {
        options = {
            margin: {top: 30, right: 10, bottom: 10, left: 10},
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

ParallelCoordinate.prototype.init = function init() {
    this.x = d3.scaleBand().range([0, this.width]).padding(1);
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

    this.axisLabel = {};
};

/**
 * Add new dimension to the parallel coordinates
 *
 * @param dimension
 * @param accessKey nullable. Default value is the same as dimension
 */
ParallelCoordinate.prototype.addDimension = function addDimension(dimension, accessKey) {

    if (!accessKey) {
        accessKey = dimension;
    }

    let self = this;
    let domain = d3.extent(
        self.dataSet,
        function(row) {
            return +row[accessKey];
        }
    );

    self.y[accessKey] = d3.scaleLinear()
        .domain(domain)
        .range([self.height, 0])
    ;

    self.dimensions.push(accessKey);

    this.axisLabel[accessKey] = dimension;

    this.setDomain();
};

ParallelCoordinate.prototype.setDomain = function setDomain() {
    let self = this;

    // Extract the list of dimensions and create a scale for each.
    self.x.domain(self.dimensions);
};

ParallelCoordinate.prototype.renderGraph = function renderGraph() {

    let self = this;

    // Add grey background lines for context.
    let background = self.svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(self.dataSet)
        .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    let foreground = self.svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(self.dataSet)
        .enter().append("path")
        .attr("d", path);

    // Add a group element for each dimension.
    var g = self.svg.selectAll(".dimension")
        .data(self.dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + self.x(d) + ")"; })
        .call(d3.drag()
            .subject(function(d) {
                let t = {x: self.x(d)};
                return {x: self.x(d)};
            })
            .on("start", function(d) {
                dragging[d] = x(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function(d) {
                self.dragging[d] = Math.min(self.width, Math.max(0, d3.event.x));
                foreground.attr("d", path);
                self.dimensions.sort(function(a, b) { return position(a) - position(b); });
                self.x.domain(self.dimensions);
                g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
            })
            .on("end", function(d) {
                delete self.dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + self.x(d) + ")");
                transition(foreground).attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) {
                   d3.select(this).call(self.axis.scale(self.y[d]));
            // d3.select(this).call(d3.axisLeft(self.y[d]));
        })
        .append("text")
        .style("text-anchor", "middle")
        .style('fill', '#000000')
        .attr("y", -9)
        .text(function(d) { return self.axisLabel[d]; })
    ;

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
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
                    .on("brush", brush)
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
            return [position(p), self.y[p](d[p])];
        });

        return self.line(xy);
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {

        let actives = [];
        let extents = [];
        self.svg.selectAll(".brush")
            .filter(function(d) {
                return d3.brushSelection(this);
            })
            .each(function(d) {
                actives.push(d);
                let selectionDomain = d3.brushSelection(this);
                selectionDomain = selectionDomain.map(function (val) {
                    return self.y[d].invert(val);
                });
                extents.push(selectionDomain);

            });

        foreground.style("display", function(dimensions) {

            let myDp = actives.every(function(dim, i) {

                let max = +extents[i][0];
                let min = +extents[i][1];
                let val = +dimensions[dim];
                let dp = val >= min && val <= max;

                return !!dp;
            });

            return myDp ? null : "none";
        });
    }
};
