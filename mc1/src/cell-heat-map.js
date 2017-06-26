'use strict';
class CellHeatMap {
    constructor(divId, width, height, options) {

       options = this.handleOptions(options);

        let margin = options.margin;
        this.width = width - margin.left - margin.right;
        this.height =  height - margin.top - margin.bottom;




        var svg = d3.select("#" + divId).append("svg")
            .attr("width", this.width + margin.left + margin.right)
            .attr("height", this.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        this.svg = svg;

        this.options = options;

        this.init();

        this.calculateGridSize();
    }

    init() {

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

        if (!options.heatKey) {
            options.heatKey = 'value';
        }

        if (!options.margin) {
            options.margin = { top: 50, right: 30, bottom: 100, left: 30 };
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

        return options;
    }

    setLabelX(labels) {
        this.xLabels = labels;
    }

    setLabelY(labels) {
        this.yLabels = labels;

    }

    setColors(colors) {
        this.colors = colors;
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
        let hKey = self.options.heatKey;

        let totalColors = self.colors.length - 1;


        let minMax = d3.extent(data, function (d) {
            return +d[hKey];
        });

        this.colorScale = d3.scaleQuantile()
            .domain([minMax[0], totalColors, minMax[1]])
            .range(self.colors)
        ;

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
            .attr("y", function (d, i) { return i * gridSizeY; })
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
        let heatKey = self.options.heatKey;


        self.svg.selectAll('.card').data(this.data).enter()
            .append('rect')
            .attr("class", function (l) {
                return "card bordered heat-map-cell-id-" + l.id;
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
                return self.colorScale(d[heatKey]);
            })
            .style("stroke", function (d) {
                return !!d.weekend ? '#990000' : '#E6E6E6';
            })
            .style("stroke-width", 1)
        ;

        this.renderAxis();
    }

    renderLegends() {
        let self = this;
        let legendElementWidth = self.options.gridSizeX * 2;
        let gridSizeY = self.options.gridSizeY;
        let height = this.height;

        let quantiles = self.colorScale.quantiles();
        var legend = self.svg.selectAll(".legend")
            .data([0].concat(quantiles), function(d) {
                return d;
            })
            .enter().append("g")
            .attr("class", "legend");

        legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + self.options.legendOffsetY)
            .attr("width", legendElementWidth)
            .attr("height", gridSizeY / 2)
            .style("fill", function(d, i) { return self.colors[i]; });

        legend.append("text")
            .attr("class", "mono")
            .text(function(d) {
                return "≥ " + Math.round(d);
            })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSizeY + self.options.legendOffsetY);

        legend.exit().remove();
    }

}