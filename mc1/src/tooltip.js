'use strict';

class TooltipHelper {
    constructor(divId) {
        this.tooltip = d3.select('body').select('#' + divId)
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
        ;

        this.init();
    }

    init() {

        this.tooltip
            .on('mouseover', function () {
                d3.select(this)
                    .style('visibility', 'visible')
            })
            .on('mouseout', function () {
                d3.select(this)
                    .style('visibility', 'hidden')
                ;
            })
        ;
    }

    render(html) {

        let self = this;

        self.tooltip
            .style('background', '#CCCCCC')
            .html(html)
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY - 50) + "px")
        ;

        this.show();

    }

    hide() {
        this.tooltip
            .style('visibility', 'hidden')
        ;
    }

    show() {
        this.tooltip.transition()
            .duration(200)
            .style("visibility", 'visible')
            .style("opacity", .9);
    }
}