'use strict';
class SensorHeatMap extends CellHeatMap {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);
    }

    init() {

        let parseTime = d3.timeParse("%m/%d/%y %H:%M");

        let fromDate = parseTime('4/1/16 0:00');
        let toDate = parseTime('4/30/16 23:00');

        let sensors = this.constructor.createZ();
        let times = this.constructor.createX(fromDate, toDate);
        let chemicals = this.constructor.createY();

        this.zLabels = sensors;
        super.setLabelX(times);
        super.setLabelY(chemicals);

        super.init();

        this.setupDefaultHeatMapData();

    }

    setupDefaultHeatMapData() {
        let self = this;
        let key;
        let myData = this.objectData = {};

        self.zLabels.forEach(function (lz, idZ) {

            self.yLabels.forEach(function (ly, idY) {

                self.xLabels.forEach(function (lx, idX) {
                    key = lz + '-' + ly + '-' + lx;

                    if (!myData.hasOwnProperty(key)) {
                        myData[key] = {
                            id: key,
                            chemical: idY,
                            time: idX,
                            sensor: +lz,
                            count: 0
                        };
                    }

                });

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
            if (start.getMonth() != 3 && start.getMonth() != 7 && start.getMonth() != 11) {
                start.setMonth(start.getMonth() + 1);
            }

            if (start.getTime() > end) {
                break;
            }

            times.push(formatDateTime(start));

            start.setHours(start.getHours() + 1);
        }
        while(true);

        return times;
    }


    // chemical label
    static createY() {
        return ['Methylosmolene', 'Chlorodinine', 'AGOC-3A', 'Appluimonia'];
    }

    static createZ() {
        // return ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return ['1'];
    }


    handleOptions(options) {
        options = super.handleOptions(options);

        options.margin.left = 100;
        // options.margin.bottom = 10;
        options.xKey = 'time';
        options.yKey = 'chemical';
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
            options.gridSizeY = (this.originalHeight - options.margin.bottom - options.margin.top)/ this.yLabels.length + 1; // add one for legend
        }
    }

    handleTimeData(data) {
        let self = this;
        let myData = self.objectData;
        let key;

        let tmpData;


        data.forEach(function (sr) {
            if( sr.getSensor() != 1) {
                return;
            }

            key = sr.getSensor() + '-' + sr.getChamical() + '-' + sr.getLabelTime();
            if (!myData.hasOwnProperty(key)) {
                // throw new Error('Invalid data found: key=' + key);
                console.log('Invalid data found: key=' + key);
                return;
            }

            tmpData = myData[key];
            tmpData.count ++;

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
        // super.renderLegends();
    }
}