'use strict';
class WorkDuration extends BaseClass {

    constructor (divId, width, height, options, eventHandler) {
        super(width, height, options, {divId: divId});

        this.eventHandler = eventHandler;

        let margin = this.options.margin;

        this.width = this.originalWidth - margin.left - margin.right;
        this.height = this.originalHeight - margin.top - margin.bottom;

        // set the ranges
        this.y = d3.scaleBand()
            .range([this.height, 0])
            .padding(0.1);

        this.x = d3.scaleLinear()
            .range([0, this.width]);
    }

    static createGates() {
        let self = this;
        let ignoreGates = ['gate', 'entrance', 'ranger-base', 'general', 'ranger-stop0', 'ranger-stop2'];

        let gates = Object.keys(mc1.parkMap.pointNameMapping)
            .filter(function (item) {
                let inIgnore = false;
                ignoreGates.forEach(function (d) {
                    if (!inIgnore && item.startsWith(d)) {
                        inIgnore = true;
                    }
                });

                return !inIgnore;
            }).sort(function (a, b) {

                if (a == b) {
                    return 0;
                }

                return a > b ? 1 : -1;
            });

        return gates;
    }


    setData(visits) {


        let maxTotalDuration = d3.max(visits, function (d) {

        });

        let gates = this.constructor.createGates();

        x.domain([0, maxTotalDuration]);
        y.domain(gates);
    }

    render() {
        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));
    }

}