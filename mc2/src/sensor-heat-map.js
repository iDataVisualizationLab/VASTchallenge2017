'use strict';
class SensorHeatMap extends CellHeatMap {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);
    }

    init() {

        let times = this.constructor.createX();
        let chemicals = this.constructor.createY();

        super.setColors(colors);
        super.setLabelX(times);
        super.setLabelY(chemicals);

        super.init();

        this.setupDefaultHeatMapData();

    }

    setupDefaultHeatMapData() {
        let self = this;
        let key;
        let myData = this.objectData = {};

        self.yLabels.forEach(function (ly, idY) {

            self.xLabels.forEach(function (lx, idX) {
                key = ly + '-' + lx;

                if (!myData.hasOwnProperty(key)) {
                    myData[key] = {
                        id: key,
                        sensor: idY,
                        time: idX,
                        count: 0
                    };
                }

            });

        });
    }

    static createX(fromDate, toDate) {
        fromDate.setHours(0);
        fromDate.setMinutes(0);
        fromDate.setSeconds(0);
        fromDate.setMilliseconds(0);

        toDate.setHours(23);
        toDate.setMinutes(59);
        toDate.setSeconds(59);
        toDate.setMilliseconds(999);

        let times = [];
        let start = new Date(fromDate.getTime());
        let end = toDate.getTime();

        do {
            if (start.getTime() > end) {
                break;
            }

            times.push(formatDateTime(start));

            start.setHours(start.getHours() + 1);
        }
        while(true);

        return times;
    }



    static createY() {
        return ['1', '2', '3', '4'];
    }


    handleOptions(options) {
        options = super.handleOptions(options);

        options.margin.left = 100;
        // options.margin.bottom = 10;
        options.xKey = 'time';
        options.yKey = 'gate';
        options.heatKey = 'count';
        options.legendOffsetY = 0;


        return options;
    }

    calculateGridSize() {
        let options = this.options;

        if (!options.gridSizeX) {
            options.gridSizeX = (this.originalWidth - options.margin.left - options.margin.right) / this.xLabels.length;
        }

        if (!options.gridSizeY) {
            options.gridSizeY = (this.height - options.margin.bottom - options.margin.top)/ this.yLabels.length + 1; // add one for legend
        }
    }

    handleTimeData(visits, depart) {
        let self = this;
        let myData = self.objectData;
        let key;
        let hour;
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

                    if (start.getTime() > end) {
                        break;
                    }

                    myTime = start;
                    hour = myTime.getHours();

                    key = gate + '-' + hour;

                    if (myData.hasOwnProperty(key)) {
                        tmpData = myData[key];
                        tmpData.count ++;
                    }

                    start.setHours(start.getHours() + 1);
                }
                while(true);


            });
        });

        return myData;
    }

    setData(visits, depart) {

        let myData = this.handleTimeData(visits, depart);

        let visData = Object.keys(myData).map(function (k) {
            return myData[k];
        });

        super.setData(visData);
    }

    reset() {
        super.reset();

        this.setupDefaultHeatMapData();
    }

    render() {
        super.render();
        super.renderLegends();
    }
}