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
    }

    handleOptions(options) {
        if (!options) {
            options = {};
        }

        if (!options.gridSizeX) {
            options.gridSizeX = 10;
        }

        if (!options.gridSizeY) {
            options.gridSizeY = 10;
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
            options.margin = {top: 20, right: 20, bottom: 50, left: 70};
        }

        if (!options.offSetX) {
            options.offSetX = 0;
        }

        if (!options.offSetY) {
            options.offSetY = 0;
        }

        return options;
    }

    setLabelX(labels) {
        this.xLabels = labels;

        if (labels.length > 0) {

            this.options.gridSizeX = this.width / labels.length;
        }
    }

    setLabelY(labels) {
        this.yLabels = labels;

        if (labels.length > 0) {
            this.options.gridSizeY = this.height / labels.length;
        }
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

        this.colorScale = d3.scaleQuantile()
            .domain([0, self.colors.length - 1, d3.max(data, function (d) { return d[hKey]; })])
            .range(self.colors)
        ;

        this.minX = d3.min(this.data, function (d) {
            return d[xKey];
        });

        this.minY = d3.min(this.data, function (d) {
            return d[yKey];
        })
    }

    renderAxis() {

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
            .attr("class", "card bordered")
            .attr("x", function(d) {
                return (d[xKey] - self.minX) * gridSizeX + self.options.offSetX;
            })
            .attr("y", function(d) {
                return (d[yKey] - self.minY)* gridSizeY + self.options.offSetY;
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", gridSizeX)
            .attr("height", gridSizeY)
            .style("fill", function (d) {
                return self.colorScale(d[heatKey]);
            })
            // .style("fill", colors[0])
        ;

        this.renderAxis();
    }

}