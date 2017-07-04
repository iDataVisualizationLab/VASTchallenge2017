'use strict';
class CarTraceNetwork extends BaseNetwork {
    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.nodes = [];
        this.links = [];
        this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    }
}