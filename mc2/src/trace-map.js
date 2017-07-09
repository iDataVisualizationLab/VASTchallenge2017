'use strict';
class TraceMap {
    constructor(divId, width, height, options) {

        options = this.handleOptions(options);

        let margin = options.margin;
        this.width = width - margin.left - margin.right;
        this.height =  height - margin.top - margin.bottom;
        this.originalWidth = width;
        this.originalHeight = height;

        d3.select("#" + divId).selectAll('*').remove();

        this.nativeSvg = d3.select("#" + divId).append("svg")
            .attr("width", this.originalWidth)
            .attr("height", this.originalHeight)
        ;

        var svg = this.nativeSvg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            ;


        this.svg = svg;

        this.options = options;

        this.init();

        this.tooltip = new TooltipHelper('tooltip');

    }


    init() {

        this.calculateGridSize();
    }


    calculateGridSize() {
        let options = this.options;

        if (!options.gridSizeX) {
            options.gridSizeX = this.width / options.gridColumns;
        }

        if (!options.gridSizeY) {
            options.gridSizeY = options.gridSizeX;
        }
    }

    handleOptions(options) {
        if (!options) {
            options = {};
        }

        if (!options.gridColumns) {
            options.gridColumns = 24;
        }

        if (!options.xKey) {
            options.xKey = 'x';
        }

        if (!options.yKey) {
            options.yKey = 'y';
        }

        if (!options.margin) {
            options.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        }

        if (!options.offSetX) {
            options.offSetX = 0;
        }

        if (!options.offSetY) {
            options.offSetY = 0;
        }

        if (!options.legendOffsetY) {
            options.legendOffsetY = 0;
        }

        if (!options.strokeWidth) {
            options.strokeWidth = 1;
        }


        return options;
    }

    setLabelX(labels) {
        this.xLabels = labels;
    }

    setLabelY(labels) {
        this.yLabels = labels;

    }

    /**
     * Must be invoked after setColors
     * @param data
     */
    setData(data) {
        let self = this;
        this.data = data;
        let xKey = self.options.xKey;
        let yKey = self.options.yKey;

        this.minX = d3.min(this.data, function (d) {
            return +d[xKey];
        });

        this.minY = d3.min(this.data, function (d) {
            return +d[yKey];
        })
    }

    renderAxis() {
        let self = this;
        let gridSizeY = self.options.gridSizeY;
        let gridSizeX = self.options.gridSizeX;
        self.svg.selectAll(".yLabel")
            .data(self.yLabels)
            .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return (i)* gridSizeY; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSizeY / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

        self.svg.selectAll(".xLabel")
            .data(self.xLabels)
            .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSizeX; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSizeX / 2 + ", -6)")
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    }

    render() {

        let self = this;
        let gridSizeX = self.options.gridSizeX;
        let gridSizeY = self.options.gridSizeY;
        let xKey = self.options.xKey;
        let yKey = self.options.yKey;
        let fillKey = self.options.fillKey;


        this.card = self.svg.selectAll('.card').data(this.data);

        this.cell = this.card.enter()
            .append('rect')
            .attr("class", function (l) {
                return "card bordered trace-map-cell-id-" + l.id;
            })
            .attr("x", function(d) {
                return (d[xKey] - self.minX) * gridSizeX + self.options.offSetX;
            })
            .attr("y", function(d) {
                return (d[yKey] - self.minY)* gridSizeY + self.options.offSetY;
            })
            // .attr("rx", 4)
            // .attr("ry", 4)
            .attr("width", gridSizeX)
            .attr("height", gridSizeY)
            .style("fill", function (d) {
                return d[fillKey];
            })
            .style("stroke", function (d) {
                return !!d.weekend ? '#990000' : '#E6E6E6';
            })
            .style("stroke-width", self.options.strokeWidth)
            .on('mouseout', function (d) {
                self.tooltip.hide();
            })
        ;

        this.card.exit().remove();

        this.renderAxis();
    }

    reset() {
        this.svg.selectAll('*').remove();
    }

    onBrushEnd(e) {

        let lines = mc1.parallel.getVisibleLines();

        this.reset();

        this.setData(lines);

        this.render();
    }

}