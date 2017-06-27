'use strict';
class CarTraceMap extends TraceMap {
    constructor(divId, width, height, options) {
        super(divId, width, height, options);
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

        options.defaultCellColor = '#CCCCCC';
        options.stopByCellColor = '#444444';

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
                        color: self.options.defaultCellColor
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

    static createTimes(startDate, endDate) {

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

        paths.forEach(function (cp, index) {
            cpTime = cp.getTime();
            day = formatDate(cpTime);
            hourMinutes = cpTime.getHours() + '.' + cpTime.getMinutes();

            key = day + '-' + hourMinutes;

            if (preDay != day) {

                if (index > 0 && dayDiff(cp, paths[index - 1]) > 1) {
                    myYLabels.push('day...');
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

        let myEndTime = new Date(endTime.getTime());
        myEndTime.setMinutes(myEndTime.getMinutes() - 1);

        let end = myEndTime.getTime();


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

            start.setMinutes(start.getMinutes() + 1);

            if (start.getTime() > end) {
                break;
            }
        }
        while(true);


        return myTimeData;
    }
    /**
     * Must be invoked after setColors
     * @param line
     */
    setData(line) {

        let times = this.constructor.createTimes(line.context.startTime, line.context.endTime);
        this.setLabelX(times);

        let myData = this.handleTimeData(line);

        let visData = Object.keys(myData).map(function (k) {
            return myData[k];
        });

        if (visData.length > 0 && visData[visData.length-1].color == this.options.defaultCellColor) {
            visData.pop();
        }

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