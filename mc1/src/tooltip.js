'use strict';
class Tooltip {
    constructor(divId, eventHandler) {
        this.tooltip = d3.select('body').select('#' + divId)
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
        ;

        this.tooltip.selectAll('*').remove();
        this.tooltipSvg = this.tooltip.append('svg');

        this.eventHandler = eventHandler;
        this.visitChart = new VisitChart2D(this.tooltipSvg, 400, 300, {timeChart: true});

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
                d3.select(this)
                    .style('visibility', 'hidden')
                ;

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

        let minDate = line.context['startTime'];
        let maxDate = line.context['endTime'];

        this.visitChart.setXDomain(minDate, maxDate);
        this.visitChart.setYDomain(0, line.context.path.length);

        debugger;
        self.visitChart.addData(line.context, line.context.path, 'time' , 'y');

        this.visitChart.renderChart();
        this.visitChart.renderAxis('Time', 'Gates');

        this.show();
        //
        // let carPoints = line.context.path;
        //
        // let tableRows = '<tr><td colspan="2"> Car: ' + line.context.carId +
        //     '</td></tr>' +
        //     '<tr><th>Time</th><th>Gate</th></tr>';
        //
        // carPoints.forEach(function (carPoint) {
        //     tableRows += '<tr>' +
        //         '<td>' + carPoint.getFormattedTime() +
        //         '</td>' +
        //         '<td>' + carPoint.getGate() +
        //         '</td>' +
        //         '</tr>'
        // });
        //
        // self.tooltip.html('<table style="background: #000000; color: #FFFFFF; opacity: 0.5">' + tableRows + '</table>')
        //     .style("left", (d3.event.pageX) + "px")
        //     .style("top", (d3.event.pageY - 28) + "px")
        // ;
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