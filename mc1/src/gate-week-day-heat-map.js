'use strict';
class GateWeekDayHeatMap extends GateTimeHeatMap {

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
                    day = myTime.getDay();

                    key = gate + '-' + day;

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
}