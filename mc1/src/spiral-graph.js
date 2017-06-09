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
            step: 0.1,
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

    let self = this;
    let totalRound = 0;
    lines.forEach(function (l) {
        if (l.visitDuration > 24 && totalRound < 1113) {

            self.addSpiral(getTimeInDayByHours(l.startTime), l.visitDuration);
            totalRound = totalRound + l.visitDuration / 24;
        }
    });

    if (totalRound > 0) {
        this.options.step = 220 / totalRound;
        // this.options.step = 1;
    }

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
    let end = start + duration;

    let roundCount = Math.ceil(duration / self.periodValue);
    let endRadius = self.radius + roundCount * step;

    let radiusFunc = d3.scaleLinear()
        .domain([start, end])
        .range([self.radius, endRadius]);

    let spiral = d3.radialLine()
        .curve(d3.curveCardinal)
        .angle(self.theta)
        .radius(radiusFunc);

    let points = d3.range(start, start + duration + 1, 1);

    this.spiralData.push({spiral: spiral, data: points});

    self.radius = endRadius + step;
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
    ;
};