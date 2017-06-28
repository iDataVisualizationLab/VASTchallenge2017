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

        options.strokeWidth = 0.1;

        options.margin.left = 80;
        options.margin.right = 0;

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

        let paths = line.context.path;


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


        let end = endDate.getTime();
        do {
            times.push(myTime.getHours() + '.' + myTime.getMinutes());

            if (myTime.getTime() > end) {
                break;
            }

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


        let paths = line.context.path;
        let myTimeData = {};

        let day;
        let hourMinutes;
        let key;

        let cpTime;

        let myYLabels = [];

        let preDay;

        let totalPoints = paths.length;
        let nextCp;
        // let currentTimeData;

        let skipDay = 0;

        paths.forEach(function (cp, index) {
            cpTime = cp.getTime();
            day = formatDate(cpTime);
            hourMinutes = cpTime.getHours() + '.' + cpTime.getMinutes();

            key = day + '-' + hourMinutes;

            if (preDay != day) {

                if (index > 0 && dayDiff(cp.getTime(), paths[index - 1].getTime()) > 1) {
                    skipDay ++;
                    myYLabels.push('work-' + skipDay);
                }

                myYLabels.push(day);
            }

            if (!myTimeData.hasOwnProperty(key)) {
                myTimeData[key] = {
                    id: key,
                    color: cp.getColor()
                };
            }

            // currentTimeData = myTimeData[key];


            // currentTimeData['minute'] = self.xLabels.indexOf(hourMinutes);
            // currentTimeData['day'] = myYLabels.indexOf(day);

            if (index < totalPoints - 1) {
                nextCp = paths[index + 1];

                if (cp.getGate() == nextCp.getGate()) { // stop period
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
                day = formatDate(start);
                hourMinutes = start.getHours() + '.' + start.getMinutes();
                key = day + '-' + hourMinutes;

                if (!myTimeData.hasOwnProperty(key)) {
                    myTimeData[key] = {
                        id: key,
                        color: self.options.stopByCellColor
                    };
                }

                if (start.getTime()>= end) {
                    break;
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

        let visData = Object.keys(myData).map(function (k) {
            return myData[k];
        });

        super.setData(visData);
    }

    render() {

        this.clear();
       super.render();
    }

    hide() {
        // this.singleVisit
        //     .style('visibility', 'hidden')
        // ;
    }

    show() {

    }
}