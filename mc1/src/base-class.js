'use strict';
class BaseClass {

    constructor(width, height, options, svgOptions) {
        this.originalWidth = width;
        this.originalHeight = height;

        this.options = this.handleOptions(options);

        if (!!svgOptions) {
            let divId = svgOptions.divId || "divId";
            let margin = this.options.margin;

            this.nativeSvg = d3.select("#" + divId).append("svg")
                .attr("width", this.originalWidth)
                .attr("height", this.originalHeight)
            ;
            this.svg = this.nativeSvg
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            ;
        }
    }

    handleOptions(options) {
        if (!options) {
            options = {};
        }

        if (!options.margin) {
            options.margin = {};
        }

        let margin = options.margin;
        if (!margin.top) {
            margin.top = 0;
        }

        if (!margin.right) {
            margin.right = 0;
        }

        if (!margin.bottom) {
            margin.bottom = 0;
        }

        if (!margin.left) {
            margin.left = 0;
        }

        if (!options.offSetX) {
            options.offSetX = 0;
        }

        if (!options.offSetY) {
            options.offSetY = 0;
        }

        if (!options.nodeRadius) {
            options.nodeRadius = 12;
        }

        if (!options.linkThickness) {
            options.linkThickness = 1;
        }

        return options;
    }

}