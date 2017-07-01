'use strict';
class CarTraceMap extends TraceMap {
    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    }

    init() {



    }

    handleOptions(options) {

        options = super.handleOptions(options);

        options.xKey = 'minute';
        options.yKey = 'day';
        options.fillKey = 'color';

        options.strokeWidth = 0;

        options.margin.left = 100;
        options.margin.right = 0;
        options.margin.top = 50;

        options.defaultCellColor = '#CCCCCC';
        options.stopByCellColor = '#000000';

        return options;
    }

    setupDefaultTraceMapData(myTimeData) {
        let self = this;
        let key;
        let myData;

        self.yLabels.forEach(function (ly, idY) {

            self.xLabels.forEach(function (lx, idX) {
                key = ly + '-' + lx;

                if (!myTimeData.hasOwnProperty(key)) {
                    myTimeData[key] = {
                        id: key,
                        minute: idX,
                        day: idY,
                        color: ly.startsWith('work') ? self.options.stopByCellColor : self.options.defaultCellColor
                    };
                }
               else {
                    myData = myTimeData[key];
                    myData['minute'] = idX;
                    myData['day'] = idY;
                }

            });

        });
    }

    clear() {
        this.svg.selectAll('*').remove();
    }

    static createTimes(line) {

        let paths = line.path;


        let minMax = d3.extent(paths, function (cp) {

            let time = new Date();
            let cpTime = cp.getTime();

            time.setHours(cpTime.getHours());
            time.setMinutes(cpTime.getMinutes());
            time.setSeconds(cpTime.getSeconds());

            return time.getTime();

        });

        let startDate = new Date(minMax[0]);
        let endDate = new Date(minMax[1]);

        let times = [];
        let myTime = new Date(startDate.getTime());
        myTime.setSeconds(0);
        myTime.setMilliseconds(0);

        let end = endDate.getTime();

        do {
            if (myTime.getTime() > end) {
                break;
            }

            times.push(myTime.getHours() + '.' + myTime.getMinutes());
            myTime.setMinutes(myTime.getMinutes() + 1);
        }
        while (true);

        return times;
    }

    calculateGridSize(force) {
        let options = this.options;

        if (!options.gridSizeX || !!force) {
            options.gridSizeX = (this.width - options.margin.left - options.margin.right) / this.xLabels.length;
        }

        if (!options.gridSizeY || !!force) {
            options.gridSizeY = (this.height - options.margin.bottom - options.margin.top)/ this.yLabels.length + 1; // add one for legend
        }
    }
    /**
     * create days with activity only. Remove days without activity
     */
    createDays() {

    }

    handleTimeData(line) {
        let self = this;


        let paths = line.path;
        let myTimeData = {};

        let day;
        let hourMinutes;
        let key;

        let cpTime;

        let myYLabels = [];

        let preDay;

        let totalPoints = paths.length;
        let nextCp;
        let preCp;

        let skipDay = 0;

        paths.forEach(function (cp, index) {
            cpTime = cp.getTime();
            day = formatDate(cpTime);
            hourMinutes = cpTime.getHours() + '.' + cpTime.getMinutes();

            key = day + '-' + hourMinutes;
            if (preDay != day) {

                if (index > 0 && dayDiff(cp.getTime(), paths[index - 1].getTime()) > 1) {
                    skipDay ++;

                    if (cp.getMapPoint().isEntrance()) {
                        myYLabels.push('away-' + skipDay);
                    }
                    else {
                        myYLabels.push('work-' + skipDay);
                    }

                }

                myYLabels.push(day);
            }

            if (!myTimeData.hasOwnProperty(key)) {
                  myTimeData[key] = {
                    id: key,
                    color: cp.getColor(),
                      name: cp.getGate(),
                      time: cp.getFormattedTime()
                };
            }

            if (index < totalPoints - 1) {
                nextCp = paths[index + 1];

                if (cp.getGate() == nextCp.getGate() && !cp.getMapPoint().isEntrance()) { // stop period
                    self.updateStopPeriod(cp.getTime(), nextCp.getTime(), myTimeData);
                }
            }

            preDay = day;

        });


        super.setLabelY(myYLabels);

        this.setupDefaultTraceMapData(myTimeData);

        this.calculateGridSize(true);

        return myTimeData;
    }

    updateStopPeriod(startTime, endTime, myTimeData) {

        let self = this;
        let day;
        let hourMinutes;
        let key;

        let start = new Date(startTime.getTime());
        start.setMinutes(start.getMinutes() + 1);
        start.setSeconds(0); // avoid affecting exiting condition in while loop since we count to minutes only
        start.setMilliseconds(0);

        // let xEndTime = this.parseTime(self.xLabels[self.xLabels.length-1]);

       let myEndTime = new Date(endTime.getTime());
        myEndTime.setFullYear(startTime.getFullYear());
        myEndTime.setMonth(startTime.getMonth());
        myEndTime.setDate(startTime.getDate());

        let sameDay = formatDate(startTime) == formatDate(endTime);

        if (!!sameDay) { // same date
            myEndTime.setMinutes(myEndTime.getMinutes() - 1);
        }
        else{ // different date
            let hourMinutes = self.xLabels[self.xLabels.length-1];
            hourMinutes = hourMinutes.split('\.');
            myEndTime.setHours(hourMinutes[0]);
            myEndTime.setMinutes(hourMinutes[1]);
        }


        let end = myEndTime.getTime();


        // update from start time to end time of that day
        var updateTime = function (start, end) {

            if(start.getTime() > end) {
                return;
            }

            do {
                if (start.getTime()>= end) {
                    break;
                }

                day = formatDate(start);
                hourMinutes = start.getHours() + '.' + start.getMinutes();
                key = day + '-' + hourMinutes;

                if (!myTimeData.hasOwnProperty(key)) {
                    myTimeData[key] = {
                        id: key,
                        color: self.options.stopByCellColor
                    };
                }

                start.setMinutes(start.getMinutes() + 1);
            }
            while(true);
        };

        updateTime(start, end);


        // update for the day of actual end time
        start = new Date(startTime.getTime());
        start.setFullYear(endTime.getFullYear());
        start.setMonth(endTime.getMonth());
        start.setDate(endTime.getDate());

        if (!!sameDay) {
            start.setMinutes(start.getMinutes() + 1);
        }
        else {
            hourMinutes = self.xLabels[0];
            hourMinutes = hourMinutes.split('\.');
            start.setHours(hourMinutes[0]);
            start.setMinutes(hourMinutes[1]);
        }

        start.setSeconds(0);
        start.setMilliseconds(0);

        myEndTime = new Date(endTime.getTime());
        myEndTime.setMinutes(myEndTime.getMinutes() - 1);
        end = myEndTime.getTime();

       updateTime(start, end);

        return myTimeData;
    }
    /**
     * Must be invoked after setColors
     * @param line
     */
    setData(line) {

        let times = this.constructor.createTimes(line);
        this.setLabelX(times);

        let myData = this.handleTimeData(line);

        let tmp;
        let visData = Object.keys(myData).map(function (k) {

            tmp = myData[k];

            if (tmp.day == null|| tmp.minute == null) {
                debugger;
            }
            return myData[k];
        });

        super.setData(visData);

        this.line = line;
    }

    getCarId() {
        if (!!this.line) {
            return this.line.carId;
        }
    }

    render() {

        let self = this;
        this.clear();
       super.render();

       if (!!this.cell) {
           this.cell
               .on('mouseover', function (d) {

                   if (!!d.name) {
                       self.tooltip.render('Gate: ' + d.name + ' <br/> time: ' + d.time);

                   }
               })
       }

       this.show();

    }

    renderAxis() {
        let self = this;
        let gridSizeY = self.options.gridSizeY;
        let gridSizeX = self.options.gridSizeX;
        let dateParser = d3.timeParse('%Y-%m-%d');

        self.svg.selectAll(".yLabel")
            .data(self.yLabels)
            .enter().append("text")
            .text(function (d) {
                if (d.startsWith('work') || d.startsWith('away')) {
                    return '';
                }

                let curDate = dateParser(d);

                return formatDate(curDate, '%a %b %d');
            })
            .attr("x", 0)
            .attr("y", function (d, i) { return (i)* gridSizeY; })
            .style("text-anchor", "end")
            .style('fill', function (d) {
                let curDate = dateParser(d);

                if (curDate == null) {
                    return null;
                }

                return curDate.getDay() == 0 || curDate.getDay() == 6 ? '#FF0000' : null;
            })
            .attr("transform", "translate(-6," + gridSizeY / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });


        let gridPerText = Math.ceil(40 / gridSizeX);
        self.svg.selectAll(".xLabel")
            .data(self.xLabels)
            .enter().append("text")
            .text(function(d, index) {
                return ((index % gridPerText) == 0 || index == (self.xLabels.length-1)) ? d : '';
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * gridSizeX;
            })
            // .style("text-anchor", "middle")
            .attr("transform", "translate(7, 0) rotate(-90)")
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    }

    hide() {

        mc1.controller.viewDivOption('heatMapStats');

    }

    show() {
        mc1.controller.viewDivOption('mySingleVisit');
    }
}