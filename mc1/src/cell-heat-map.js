'use strict';
class CellHeatMap extends TraceMap {
    constructor(divId, width, height, options) {
        super(divId, width, height, options);
    }

    handleOptions(options) {

        options = super.handleOptions(options);

        if (!options.heatKey) {
            options.heatKey = 'value';
        }

        return options;
    }

    setColors(colors) {
        this.colors = colors;
    }

    /**
     * Must be invoked after setColors
     * @param data
     */
    setData(data) {

        super.setData(data);

        let self = this;
        let hKey = self.options.heatKey;
        let totalColors = self.colors.length - 1;

        let tmpData = data.filter(function (d) {
            return +d[hKey] > 0;
        });

        let minMax = d3.extent(tmpData, function (d) {
            return +d[hKey];
        });

        this.colorScale = d3.scaleQuantile()
            .domain([minMax[0], totalColors, minMax[1]])
            .range(self.colors)
        ;
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
                return "card heat-map-cell-id-" + l.id;
            })
            .attr("x", function(d) {
                return d.x = (d[xKey] - self.minX) * gridSizeX + self.options.offSetX;
            })
            .attr("y", function(d) {
                return d.y = (d[yKey] - self.minY)* gridSizeY + self.options.offSetY;
            })
            // .attr("rx", 4)
            // .attr("ry", 4)
            .attr("width", gridSizeX)
            .attr("height", gridSizeY)
            .style("fill", function (d) {
                return d.color = d[heatKey] == 0 ? '#f2f1e1' : self.colorScale(d[heatKey]);
            })
            .style("stroke", '#E6E6E6')
            .style("stroke-width", self.options.strokeWidth)
        ;

        this.renderAxis();
    }

    renderLegends() {
        let self = this;
        let legendElementWidth = (this.originalWidth-this.options.margin.left - this.options.margin.right) / (this.colors.length);
        let gridSizeY = self.options.gridSizeY;
        let height = this.height;
        let legendY = (self.yLabels.length + 1) * gridSizeY;

        let quantiles = self.colorScale.quantiles();
        var legend = self.svg.selectAll(".legend")
            .data([0].concat(quantiles), function(d) {
                return d;
            })
            .enter().append("g")
            .attr("class", "legend");

        legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", legendY + self.options.legendOffsetY)
            .attr("width", legendElementWidth)
            .attr("height", gridSizeY / 2)
            .style("fill", function(d, i) {
                return self.colors[i];
            });

        legend.append("text")
            .attr("class", "mono")
            .text(function(d) {
                // return "≥ " + Math.round(d);
                return d == 0 ? "> " + Math.round(d) : "≥ " + Math.round(d);
            })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", legendY + gridSizeY / 2 + self.options.legendOffsetY + 16);

        legend.exit().remove();
    }

}