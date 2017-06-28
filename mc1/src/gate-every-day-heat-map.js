'use strict';
class GateEveryDayHeatMap extends GateTimeHeatMap {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);

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

    onBrushEnd(e) {

        console.log('everyday heat map');
        console.log(e);

    }
}