'use strict';
class GateEveryDayHeatMap extends GateTimeHeatMap {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.parseTime = d3.timeParse("%Y-%m-%d");

    }

    static createTimes() {
        let parseTime = d3.timeParse("%Y-%m-%d");
        let startDate = parseTime('2015-05-01');
        let endDate = parseTime('2016-06-01');
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


    handleOptions(options) {
        options = super.handleOptions(options);
        options.margin.top = 100;
        options.margin.bottom = 0;

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
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

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
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    }
}