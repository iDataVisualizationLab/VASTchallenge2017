'use strict';
class DensityHeatMap extends DayHourHeatMap {
    constructor(divId, width, height, options) {
        super(divId, width, height, options);
    }

    handleTimeData(visits, depart) {
        let self = this;
        let myData = this.objectData;
        let key;
        let time;
        let hour;
        let day;
        let tmpData;

        visits.forEach(function (l) {

            let start = new Date(l.startTime.getTime());
            let endTime = l.endTime.getTime();

            do {

                time = start;
                day = time.getDay();
                hour = time.getHours();

                key = self.yLabels[day] + '-' + hour;
                tmpData = myData[key];
                tmpData.count ++;

                start.setHours(start.getHours() + 1);

                if (start.getTime() > endTime) {
                    break;
                }
            }
            while(true);
        });

        return myData;
    }

}