/**
 *
 * @param svg
 * @param periodValue: the smallest value equivalent to 2PI angle. Default is 3600 as number of minutes for 1 day
 * @param options: configuration object for radius: smallest radius of the spiral and step: distance between two consecutive radius
 * @constructor
 */
var SpiralGraph = function (svg, periodValue, options) {
    if (!periodValue) {
        periodValue = 24;
        // periodValue = 60;
    }

    if (!options) {
        options = {
            radius: 10,
            step: 2,
            svgWidth: 600,
            svgHeight: 440
        };
    }

    this.options = options;

    svg.selectAll('*').remove();

    this.svg = svg.append('g')
        .attr("transform",
            "translate(" + options.svgWidth/2 + "," + options.svgHeight/2 + ")")
    ;


    this.options = options;
    this.radius = options.radius;
    this.periodValue = periodValue;

    this.theta = function (value) {
        return (value * 2 * Math.PI) / periodValue;
    };

    this.spiralData = [];
};

/**
 * Create new data and sort to render by time block
 * @param visits
 */
SpiralGraph.prototype.setVisits = function setVisits (visits) {
    let lines = visits.map(function (l) {
        return l;
    });

    lines.sort(function (l1, l2) {
        return getTimeInDayBySeconds(l1.startTime) - getTimeInDayBySeconds(l2.startTime);
    });

    if (lines.length > 0) {
        this.options.step =  120 / lines.length;
    }



    let self = this;
    let totalLine = 0;
    lines.forEach(function (l) {
        console.log('duration: ' + l.visitDuration + '; start: ' + formatDateTime(l.startTime) + '; end:' + formatDateTime(l.endTime));
        self.addSpiral(getTimeInDayByHours(l.startTime), l.visitDuration);
        // totalLine ++;
    });

    this.lines = lines;
};

/**
 *
 * @param start: start minute of day
 * @param duration: end minute of day
 */
SpiralGraph.prototype.addSpiral = function addSpiral(start, duration) {

    let self = this;
    let step = self.options.step;
    let myRadius = self.radius + step;


    let spiral = d3.radialLine()
        .curve(d3.curveCardinal)
        .angle(self.theta)
        .radius(myRadius);

    let nextStart;
    let currentStart = start;
    let points;
    let end = start + duration;

    do {
        nextStart = currentStart + 24;
        points = nextStart >= end ? d3.range(currentStart, end, 1) : d3.range(currentStart, nextStart + 1, 1);
        this.spiralData.push({spiral: spiral, data: points});
        currentStart = nextStart;

        if (currentStart >= end) {
            break;
        }

    }
    while(true);

    self.radius = myRadius + step;
};

SpiralGraph.prototype.render = function render() {

    let self = this;
    self.mySpirals = self.svg.selectAll('.spiral-graph').data(self.spiralData).enter()
        .append('g')
        .attr('class', 'spiral-graph')
    ;


    self.mySpirals.append("path")
        .attr("d", function (line) {
            return line.spiral(line.data);
        })
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-width", 0.1)
        .style("opacity", 0.2)
    ;
};