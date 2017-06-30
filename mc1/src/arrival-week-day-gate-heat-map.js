'use strict';
class ArrivalWeekDayGateHeatMap extends GateTimeHeatMap {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);
    }

    static createTimes() {
        let times = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        return times;
    }

    handleTimeData(visits, depart) {
        let self = this;
        let myData = self.objectData;
        let key;
        let time;
        let day;
        let gate;
        let tmpData;

        let paths;

        visits.forEach(function (l) {

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
                let arrivalTime = new Date(preCp.getTime().getTime());
                day = arrivalTime.getDay();
                key = gate + '-' + day;

                if (!myData.hasOwnProperty(key)) {
                    throw  new Error('invalid data, double check if it has been initialized');
                }

                tmpData = myData[key];
                tmpData.count ++;

            });
        });

        return myData;
    }
}