'use strict';
class GateDayHeatMap extends CellHeatMap {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.init();
    }

    init() {

        let colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
            gates = Object.keys(mc1.parkMap.pointNameMapping)
                .filter(function (g) {


                return !g.startsWith('gate') && !g.startsWith('entrance') && !g.startsWith('ranger-base') && !g.startsWith('general');
            }).sort(function (a, b) {

                if (a == b) {
                    return 0;
                }

                return a > b ? 1 : -1;
            }),
            days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
            ;

        super.setColors(colors);
        super.setLabelX(days);
        super.setLabelY(gates);

        let self = this;
        let key;
        let myData = this.objectData = {};

        self.yLabels.forEach(function (ly, idY) {

            self.xLabels.forEach(function (lx, idX) {
                key = ly + '-' + idX;

                if (!myData.hasOwnProperty(key)) {
                    myData[key] = {
                        id: key,
                        gate: idY,
                        day: idX,
                        count: 0
                    };
                }

            });

        });
    }

    handleOptions(options) {
       options = super.handleOptions(options);

        options.margin.left = 150;
        options.margin.bottom = 40;
       options.xKey = 'day';
       options.yKey = 'gate';
       options.heatKey = 'count';
       options.legendOffsetY = 0;


       return options;
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

    setData(visits, depart) {

        let myData = this.handleTimeData(visits, depart);

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