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

    render(html, offsetX, offsetY) {

        if (!offsetX) {
            offsetX = 0;
        }

        if (!offsetY) {
            offsetY = 0;
        }
        let self = this;

        self.tooltip
            .style('background', '#CCCCCC')
            .html(html)
            .style("left", (d3.event.pageX + 20 + offsetX) + "px")
            .style("top", (d3.event.pageY - 50 + offsetY) + "px")
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