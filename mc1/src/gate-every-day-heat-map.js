'use strict';
class GateEveryDayHeatMap extends GateTimeHeatMap {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.parseTime = d3.timeParse("%Y-%m-%d");

        let self = this;
        this.x = d3.scaleTime()
            .domain([this.parseTime('2015-05-01'), this.parseTime('2016-05-31')])
            .rangeRound([self.options.margin.left, self.originalWidth - self.options.margin.right])
            // .rangeRound([0, this.width])
        ;

        this.activeKeys = {};
        if (!self.filter) {
            self.filter = {};
        }

        this.nativeSvg.on('click',function () {

            self.eventHandler.fireEvent('clearSetting');
        });
    }

    static createTimes() {
        let parseTime = d3.timeParse("%Y-%m-%d");
        let startDate = parseTime('2015-05-01');
        let endDate = parseTime('2016-05-31');
        let end = endDate.getTime();
        let myTime;
        let times = [];
        do {
            myTime = startDate;

            times.push(formatDate(myTime));

            startDate.setDate(startDate.getDate() + 1);

            if (startDate.getTime() >= end) {
                break;
            }
        }
        while(true);

        return times;
    }


    setupEvent() {
        this.eventHandler.addEvent('brushEnd', this.onBrushEnd, this);
        this.eventHandler.addEvent('mouseover', this.highLightVisit, this);
        this.eventHandler.addEvent('clearSetting', this.clearSetting, this);
    }

    handleOptions(options) {
        options = super.handleOptions(options);
        options.margin.top = 100;
        options.margin.bottom = 0;
        options.strokeWidth = 0.5;

        return options;
    }

    setupDefaultHeatMapData() {
        let self = this;
        let key;
        let myData = this.objectData = {};
        let parseTime = d3.timeParse("%Y-%m-%d");
        let myTime;

        self.yLabels.forEach(function (ly, idY) {

            self.xLabels.forEach(function (lx, idX) {
                key = ly + '-' + idX;

                if (!myData.hasOwnProperty(key)) {

                    myTime = parseTime(lx);
                    myData[key] = {
                        id: key,
                        gate: idY,
                        time: idX,
                        count: 0,
                        weekend: (myTime.getDay() == 0 || myTime.getDay() == 6)
                    };
                }

            });

        });
    }

    handleTimeData(visits, depart) {
        let self = this;
        let myData = self.objectData;
        let key;
        let time;
        let gate;
        let tmpData;

        let paths;

        visits.forEach(function (l) {
            // if (l.carType == '2P' || l.camping == false) {
            //     return;
            // }

            paths = l.path;

            let preCp;

            paths.forEach(function (cp, index) {

                if (index < 1) {
                    return;
                }

                preCp = paths[index-1];
                gate = cp.getGate();

                if (preCp.getGate() != gate || gate.startsWith('entrance')) {
                    return;
                }

                // we are interested in gates where it stops for a while
                let start = new Date(preCp.getTime().getTime());
                let end = cp.getTime().getTime();
                let myTime;
                do {

                    myTime = start;
                    time = formatDate(myTime);

                    key = gate + '-' + self.xLabels.indexOf(time);

                    if (!myData.hasOwnProperty(key)) {
                        break;
                    }

                    tmpData = myData[key];
                    tmpData.count ++;

                    start.setDate(start.getDate() + 1);

                    if (start.getTime() > end) {
                        break;
                    }

                }
                while(true);


            });
        });

        return myData;
    }

    highLightWeekend() {

        let self = this;
        let gridSizeX = self.options.gridSizeX;
        let gridSizeY = self.options.gridSizeY;
        let heatKey = self.options.heatKey;

        let weekends = this.data.filter(function (d) {
            return !!d.weekend;
        });

        if (weekends.length > 0) {
            self.svg.append('g').selectAll('.weekend').data(weekends).enter()
                .append('rect')
                .attr("class", function (l) {
                    return "card weekend heat-map-cell-id-" + l.id;
                })
                .attr('x', function (d) {
                    return  d.x;
                })
                .attr('y', function (d) {
                    return  d.y;
                })
                .attr("width", gridSizeX)
                .attr("height", gridSizeY)
                .style("fill-opacity", 0)
                .style("stroke", function (d) {
                    return d.stroke = '#990000';
                })
                .style("stroke-width", self.options.strokeWidth)
            ;
        }
    }
    render() {

        super.render();

        this.highLightWeekend();

        let self = this;

        let gridSizeY = self.options.gridSizeY;
        let totalHeight = gridSizeY * self.yLabels.length + self.options.margin.top;
        // let totalHeight = self.options.originalHeight - self.options.margin.top - self.options.margin.bottom;

        if (!!self.brushX) {
            return;
        }

        self.brushX = d3.brushX()
            .extent([[self.options.margin.left, self.options.margin.top], [self.originalWidth - self.options.margin.right, totalHeight]])
            .on("start", function () {
                if (!d3.event.sourceEvent) {
                    return;
                }
                d3.event.sourceEvent.stopPropagation();
            })
            // .on("brush", brushEnd)
            .on("end", brushEnd)
        ;

        this.nativeSvg.append("g")
            .attr("class", "brush")
            .call(self.brushX)
        ;


        function brushEnd() {
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) {
                mc1.parallel.updatePCByTime(true);

                return;
            }

            let s = d3.event.selection;
            let selectedDateRange = s.map(self.x.invert);
            let d1 = selectedDateRange.map(d3.timeDay.round);

            // If empty when rounded, use floor & ceil instead.
            if (d1[0] >= d1[1]) {
                d1[0] = d3.timeDay.floor(d0[0]);
                d1[1] = d3.timeDay.offset(d1[0]);
            }

            d3.select(this).transition().call(d3.event.target.move, d1.map(self.x));
            // display cars who appears in this range
            mc1.parallel.updatePCByTime(d1[0], d1[1]);

            if (!self.filter) {
                self.filter = {};
            }

            self.filter['time'] = d1;

        }
    }

    renderAxis() {
        let self = this;
        let gridSizeY = self.options.gridSizeY;
        let gridSizeX = self.options.gridSizeX;


        let numberGridPerText = 1;
        if (gridSizeX < 20) {
            numberGridPerText = Math.ceil(20 / gridSizeX);
        }

        self.svg.selectAll(".yLabel")
            .data(self.yLabels)
            .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return (i)* gridSizeY; })
            .style("text-anchor", "end")
            // .attr("transform", "rotate(-65)")
            .attr("transform", "translate(-6," + gridSizeY / 1.5 + ")")
            .on('click', function (d) {
                if (!self.filter.hasOwnProperty(d)) {
                    self.filter[d] = {
                        selected: true
                    };
                }
                else {
                    self.filter[d].selected = !self.filter[d].selected;
                }

                let selected = self.filter[d].selected;

                d3.select(this).style('font-weight', function (e) {
                    return !!selected ? 'bold' : 'normal';
                })
            })
        ;

        self.svg.selectAll(".xLabel")
            .data(self.xLabels)
            .enter().append("text")
            .text(function(d, i) {

                let myTime = self.parseTime(d);
                return myTime.getDay() == 6 ? d : '';
            })
            // .attr("x", function(d, i) { return i * gridSizeX; })
            .attr("x", 10)
            .attr("y", function (d, i) {
                return i * gridSizeX + 6;
            })
            // .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSizeX / 2 + ", 0) rotate(-90)")
            .attr("class", "weekend-text");

    }

    highLightVisit(e) {

        let visit = e.line.context;
        let paths = visit.path;

        let startDate = new Date(visit.startTime.getTime());
        let endTime = visit.endTime.getTime();
        let preCp;

        let activeKeys = {};
        let key;

        let gate;
        let day;

        paths.forEach(function (cp, index) {

            gate = cp.getGate();
            day = formatDate(cp.getTime());

            key = gate + '-' + day;

            if (!activeKeys.hasOwnProperty(key)) {
                activeKeys[key] = true;
            }

            if (index < 1 || preCp != null && preCp.getGate() != cp.getGate()) {
                preCp = cp;
                return;
            }

            // has delay period
            startDate = new Date(preCp.getTime().getTime());
            startDate.setHours(0);
            startDate.setMinutes(0);
            startDate.setSeconds(0);
            startDate.setMilliseconds(0);

            endTime = cp.getTime().getTime();

            do {

                if (startDate.getTime() > endTime) {
                    break;
                }
                day = formatDate(startDate);

                key = gate + '-' + day;
                activeKeys[key] = true;
                startDate.setDate(startDate.getDate() + 1);
            }
            while(true);

            preCp = cp;


        });

        // clear previous setting
        this.clearSetting();

        // activate setting
        this.activeKeys = activeKeys;

        let self = this;
        let xKey = self.options.xKey;
        let yKey = self.options.yKey;
        let xOffset;
        let yOffset;
        let stroke;

        self.svg.selectAll('.card')
            .filter(function (d) {
                xOffset = d[xKey];
                yOffset = d[yKey];

                gate = self.yLabels[yOffset];
                day = self.xLabels[xOffset];

                key = gate + '-' + day;

                return self.activeKeys.hasOwnProperty(key);
            })
            .style('fill', '#000000')
            // .style('stroke', '#0065FF')
        ;
    }

    clearSetting() {
        let self = this;

        let xKey = self.options.xKey;
        let yKey = self.options.yKey;
        let xOffset;
        let yOffset;
        let key;

        let gate;
        let day;
        self.svg.selectAll('.card')
            .filter(function (d) {
                xOffset = d[xKey];
                yOffset = d[yKey];

                gate = self.yLabels[yOffset];
                day = self.xLabels[xOffset];

                key = gate + '-' + day;

                return self.activeKeys.hasOwnProperty(key);
            })
            .style('fill', function (d) {
                return d.color;
            });


        self.activeKeys = {};
    }

}