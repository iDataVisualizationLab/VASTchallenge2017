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

        this.tooltip = new TooltipHelper('tooltip');
    }

    handleOptions(options) {

        options = super.handleOptions(options);

        let margin = options.margin;
        margin.left = 80;
        margin.top = 20;
        margin.bottom = 50;
        margin.right = 100;


        return options;
    }

    static createGates() {
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

        let paths;
        let preCp;
        let self = this;


        let gates = this.constructor.createGates();
        let gateDuration = {};
        let tmpDuration, mp;
        let passingCount = 0;

        visits.forEach(function (line, lIndex) {
            paths = line.path;

            passingCount = 0;
            preCp = null;

            paths.forEach(function (cp, cIndex) {

                let gate = cp.getGate();
                mp = cp.getMapPoint();

                if (!mp.isCamping() && !mp.isRangerStop()) {
                    return;
                }

                passingCount ++;
                if (!preCp) {
                    preCp = cp;
                    return;
                }

                if (preCp.getGate() != gate) {
                    preCp = cp;
                    return;
                }


                if (!gateDuration.hasOwnProperty(gate)) {
                    gateDuration[gate] = 0;
                }

                tmpDuration = (cp.getTime().getTime() - preCp.getTime().getTime()) / 3600000;

                gateDuration[gate] += tmpDuration;

                if ( (mp.isCamping() || mp.isRangerStop()) && passingCount % 2 == 0) { // exit
                    preCp = null; // reset
                }


            });
        });

        this.myData = [];

        let maxTotalDuration = d3.max(Object.keys(gateDuration), function (k) {
            self.myData.push({gate: k, duration:  gateDuration[k]});
            return gateDuration[k];
        });

        self.x.domain([0, maxTotalDuration]);
        self.y.domain(gates);
    }

    render() {
        let self = this;

        // append the rectangles for the bar chart
        self.svg.selectAll(".bar")
            .data(self.myData)
            .enter().append("rect")
            .attr("class", "bar")
            //.attr("x", function(d) { return x(d.sales); })
            .attr("width", function(d) {return self.x(d.duration); } )
            .attr("y", function(d) { return self.y(d.gate); })
            .attr("height", self.y.bandwidth())
            .on('mouseover', function (d) {
                self.tooltip.render("Duration: " + d.duration.toFixed(3) + ' (hrs)', 0, 20);
            })
            .on('mouseout', function (d) {
                self.tooltip.hide();
            })
        ;

        // add the x Axis
        self.svg.append("g")
            .attr("transform", "translate(0," + self.height + ")")
            .call(d3.axisBottom(self.x))
        ;

        // add the y Axis
        self.svg.append("g")
            .call(d3.axisLeft(self.y))
        ;
    }

}