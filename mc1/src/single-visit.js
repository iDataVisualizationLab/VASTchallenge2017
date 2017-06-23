'use strict';
class SingleVisit {
    constructor(divId, roadHeatMap, eventHandler, options) {


        this.singleVisit = d3.select('body').select('#' + divId)
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
        ;

        if (!options) {
            options = {};
        }
        let margin = {top: 20, right: 20, bottom: 50, left: 70};
        if (!options.margin) {
            options.margin = margin;
        }

        if (!options.width) {
            options.width = 720 - margin.left - margin.right;
        }

        if (!options.height) {
            options.height = 500 - margin.top - margin.bottom;
        }

        this.width = options.width;
        this.height = options.height;

        this.options = options;

        this.singleVisit.selectAll('*').remove();
        this.visitSvg = this.singleVisit.append('svg').attr("width", options.width + options.margin.left + options.margin.right)
                        .attr("height", options.height + options.margin.top + options.margin.bottom)
                        // .append("g")
                        // .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
        ;

        this.eventHandler = eventHandler;

        this.init();

        this.roadHeatMap = roadHeatMap;
    }

    init() {

        let self = this;
        this.visitSvg
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
        this.visitSvg.selectAll('*').remove();
    }

    render(line) {

        let self = this;

        this.clear();

        let op =  {timeChart: true, defaultLineWidth: 3, defaultGateRadius: 3};
        // op.gatesForInternalCars = ['gate', 'entrance', 'camping'];
        op.gatesForVisitingCars = ['camping', 'gate', 'entrance', 'ranger-stop', 'ranger-base'];

        this.visitChart = new VisitChart2D(this.visitSvg, this.width, this.height, op);

        let minDate = line.context['startTime'];
        let maxDate = line.context['endTime'];

        this.visitChart.setXDomain(minDate, maxDate);
        let maxY = 2 * line.context.path[0].y;
        if (maxY > 20000) {
            maxY = 20000;
        }
        this.visitChart.setYDomain(0, maxY);

        let detailLines = splitPathWithStopByGate(line, line.context.path);
        if (detailLines.length > 0) {
            detailLines.forEach(function (l) {
                self.visitChart.addData(line.context, l.path, 'time', 'y');

            });
        }

        let events = [
            {name: 'mouseover', handler: this.handleMouseOver, context: this},
            {name: 'mouseout', handler: this.handleMouseOut, context: this}
        ];

        this.visitChart.renderChart(events);
        this.visitChart.renderAxis('Time', 'Visits');

        // render legends
        this.visitSvg.selectAll('.legend').remove();

        let lg = this.visitSvg.selectAll('.legend').data([line]).enter()
            .append('g')
                .style('class', 'legend')
        ;

        let margin = self.options.margin;
        let offsetX = (self.width - 300);
        let step = 20;
        lg.append('text')
            .text(function (l) {

                let d = l.context.path[0];
                return "Car: " + l.context.carId + ' (Type: ' + l.context.carType + ')';
            })
            .attr("transform", "translate(" + offsetX + "," + (margin.top) + ")")
        ;

        lg.append('text')
            .text(function (l) {

                let d = l.context.path[0];
                return "From Gate: " + d.getGate() + ' (' + d.getFormattedTime() + ')';
            })
            .attr("transform", "translate(" + offsetX + "," + (margin.top + step) + ")")
        ;

        lg.append('text')
            .text(function (l) {
                let p = l.context.path;
                let d = p[p.length-1];

                return "To Gate: " + d.getGate() + ' (' + d.getFormattedTime() + ')';
            })
            .attr("transform", "translate(" + offsetX + "," + (margin.top + 2*step) + ")")
        ;

        lg.append('text')
            .text(function (l) {

                return "Duration: " + l.context.visitDuration + ' (hrs)';
            })
            .attr("transform", "translate(" + offsetX + "," + (margin.top + 3*step) + ")")
        ;

        this.show();
    }

    handleMouseOver(e) {

        // this.eventHandler.fireEvent({name: 'show-road-heat-map', lines: [e.line.context]});

        this.roadHeatMap.renderHeatMap([e.line], {fullPath: true, alpha: 0.4});
        // debugger;
    }

    handleMouseOut(e) {
        this.roadHeatMap.clearMap();

    }

    hide() {
        // this.singleVisit
        //     .style('visibility', 'hidden')
        // ;
    }

    show() {
        this.singleVisit.transition()
            .duration(200)
            .style("visibility", 'visible')
            .style("opacity", .9);
    }
}