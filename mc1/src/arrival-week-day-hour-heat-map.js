'use strict';
class ArrivalWeekDayHourHeatMap extends DayHourHeatMap {
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
            let paths = l.path;
            let entranceCount = 0;

            paths.forEach(function (cp) {
                if (l.carType != '2P' && !cp.getMapPoint().isEntrance() || l.carType == '2P' && !cp.getMapPoint().isRangerBase()) {
                    return;
                }

                entranceCount ++;

                if (entranceCount % 2 == 1 ) { // enter
                    time = cp.getTime();
                    day = time.getDay();
                    hour = time.getHours();
                    key = self.yLabels[day] + '-' + hour;
                    tmpData = myData[key];
                    tmpData.count ++;
                }
            });
        });

        return myData;
    }

}