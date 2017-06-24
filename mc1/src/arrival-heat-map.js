'use strict';
class ArrivalHeatMap extends CellHeatMap {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.init();
    }

    init() {

        let colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
            days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

        super.setColors(colors);
        super.setLabelX(times);
        super.setLabelY(days);
    }

    handleOptions(options) {
       options = super.handleOptions(options);

       options.xKey = 'hour';
       options.yKey = 'day';
       options.heatKey = 'count';
       options.legendOffsetY = -70;

       return options;
    }

    setData(visits) {

        let self = this;
        let myData = {};
        let key;
        let arrivalTime;
        let arrivalHour;
        let arrivalDay;
        let tmpData;

        self.yLabels.forEach(function (ly, idY) {

            self.xLabels.forEach(function (lx, idX) {
                key = ly + '-' + idX;

                if (!myData.hasOwnProperty(key)) {
                    myData[key] = {
                        id: key,
                        day: idY,
                        hour: idX,
                        count: 0
                    };
                }

            });

        });


        visits.forEach(function (l) {
            if (l.carType == '2P' || l.camping == false) {
                return;
            }

            arrivalTime = l.startTime;
            arrivalDay = arrivalTime.getDay();
            arrivalHour = arrivalTime.getHours();

            key = self.yLabels[arrivalDay] + '-' + arrivalHour;
            tmpData = myData[key];
            tmpData.count ++;

        });

        let visData = Object.keys(myData).map(function (k) {
           return myData[k];
        });

        super.setData(visData);
    }

    render() {
        super.render();
        super.renderLegends();
    }
}