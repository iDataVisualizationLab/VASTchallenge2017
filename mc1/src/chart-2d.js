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

/**
 *
 * Set data before rendering the chart
 *
 * @param context: context information
 * @param dataArray data array, containing [ [{x: xValue1, y: yValue1}, {x: xValue2, y: yValue2}], [{}]]
 * @param xKey: key to get data for x axis. Default is x
 * @param yKey: key to get data for y axis. Default is y
 * @param color: color of the line
 */
Chart2D.prototype.addData = function addData(context, dataArray, xKey, yKey, color) {

    if (!this.lineData) {
        this.lineData = [];
    }

    if (!xKey) {
        xKey = 'x';
    }

    if (!yKey) {
        yKey = 'y';
    }

    if (!color) {
        color = '#000000';
    }

    let self = this;

    let valueLine = d3.line()
        .x(function(d) {
            return self.x(d[xKey]);
        })
        .y(function(d) { return self.y(d[yKey]); })
    ;

    this.lineData.push( {valueLine: valueLine, data: dataArray, color: color, context: context});
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
 */
Chart2D.prototype.renderAxis = function renderAxis(bottomLabel, leftLabel) {

    let height = this.height;
    let width = this.width;
    let margin = this.options.margin;
    // Add the x Axis
    this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(this.x));

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

    var myLine = this.svg.selectAll('.line-graph').data(this.lineData).enter()
        .append('g')
        .attr('class', 'line-graph')
    ;

    myLine
        .append('path')
        .attr("class", "line")
        .attr("d", function (line) {
            return line.valueLine(line.data);
        })
        .style('stroke-width', 1)
        .style('stroke', function (line) {
            return line.color;
        })
        .style('fill', 'none')

    ;

    if (events.length > 0) {
        events.forEach(function (e) {
            myLine.on(e.name, e.callback);
        })
    }
};
