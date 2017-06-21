'use strict';
class Tooltip {
    constructor(divId, eventHandler) {
        this.tooltip = d3.select('body').select('#' + divId)
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
        ;

        let margin = {top: 20, right: 20, bottom: 50, left: 70};
        this.width = 400;
        this.height = 300;

        this.tooltip.selectAll('*').remove();
        this.tooltipSvg = this.tooltip.append('svg')
                    .attr("width", this.width + margin.left + margin.right)
            .attr("height", this.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")
        ;

        this.eventHandler = eventHandler;

        this.init();
    }

    init() {

        let self = this;
        this.tooltipSvg
            .on('mouseover', function () {
                d3.select(this)
                    .style('visibility', 'visible')
            })
            .on('mouseout', function () {
                // d3.select(this)
                //     .style('visibility', 'hidden')
                // ;

                self.eventHandler.fireEvent('mouseout');
            })
        ;

    }

    clear() {
        this.tooltipSvg.selectAll('*').remove();
    }

    render(line) {

        let self = this;

        this.clear();

        this.visitChart = new VisitChart2D(this.tooltipSvg, this.width, this.height, {timeChart: true, defaultLineWidth: 1, defaultGateRadius: 1.5});

        let minDate = line.context['startTime'];
        let maxDate = line.context['endTime'];

        this.visitChart.setXDomain(minDate, maxDate);
        let maxY = 2 * line.context.path[0].y;
        this.visitChart.setYDomain(0, maxY);

        self.visitChart.addData(line.context, line.context.path, 'time', 'y');

        let events = [
            {name: 'mouseover', handler: this.handleMouseOver, context: this}
        ];
        this.visitChart.renderChart(events);
        this.visitChart.renderAxis('Time', 'Car Number');

        this.show();

    }

    handleMouseOver(e) {
        debugger;
    }

    hide() {
        // this.tooltip
        //     .style('visibility', 'hidden')
        // ;
    }

    show() {
        this.tooltip.transition()
            .duration(200)
            .style("visibility", 'visible')
            .style("opacity", .9);
    }
}