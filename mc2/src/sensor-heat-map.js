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

        this.dataSensors = {};

        this.setupDefaultHeatMapData();

    }

    setupDefaultHeatMapData() {
        let self = this;
        let key;
        let myData;

        self.zLabels.forEach(function (lz, idZ) {

            myData = {};

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

            self.dataSensors[lz] = myData;
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

        options.margin.left = 130;
        options.margin.top = 35;
        options.margin.bottom = 10;
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
            options.gridSizeY = (this.originalHeight - options.margin.bottom - options.margin.top)/ (this.zLabels.length * this.yLabels.length + 1); // add one for legend
        }
    }

    handleTimeData(data) {
        let self = this;
        let myData;
        let key;

        let tmpData;


        data.forEach(function (sr) {
            myData = self.dataSensors[sr.getSensor()];
            if (!myData) {
                console.log('No data for Sensor: ' + sr.getSensor());
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

        return self.dataSensors;
    }

    setData(visits, depart) {

        let myData = this.handleTimeData(visits, depart);

        let visData = [];
        
        let tmp;
        let singleSensorData;

        for(let k in myData) {
            if (!myData.hasOwnProperty(k)) {
                continue;
            }
            
            tmp = myData[k];
            singleSensorData = Object.keys(tmp).map(function (k2) {
                return tmp[k2];
            });

            visData.push(singleSensorData);
        }

        super.setData(visData);
    }

    reset() {
        super.reset();

        this.setupDefaultHeatMapData();
    }

    render(visData) {

        if (!visData) {
            visData = this.data;
        }
        let self = this;
        let gridSizeX = self.options.gridSizeX;
        let gridSizeY = self.options.gridSizeY;
        let xKey = self.options.xKey;
        let yKey = self.options.yKey;
        let heatKey = self.options.heatKey;

        let colors = ['#FF0000', '#00FF00', '#0000FF', '#969696'];


        let sensorHeatmaps = self.svg.selectAll('.heat-map').data(visData).enter()
            .append('g')
            .attr('class', 'heat-map')
        ;

        let singleSensorMapHeight = gridSizeY * self.yLabels.length;

        sensorHeatmaps.each(function (singleSensorData, index) {
            d3.select(this).selectAll('.card').data(singleSensorData).enter()
                .append('rect')
                .attr("class", function (l) {
                    return "card heat-map-cell-id-" + l.id;
                })
                .attr("x", function(d) {
                    return d.x = (d[xKey]) * gridSizeX + self.options.offSetX;
                })
                .attr("y", function(d) {
                    return d.y = (d[yKey])* gridSizeY + self.options.offSetY + singleSensorMapHeight*index;
                })
                // .attr("rx", 4)
                // .attr("ry", 4)
                .attr("width", gridSizeX)
                .attr("height", gridSizeY)
                .style("fill", function (d) {

                    let color = colors[d.chemical];
                    return d.count > 0 ? d.color = color : '#000000';
                })
                .style("stroke", '#E6E6E6')
                .style("stroke-width", self.options.strokeWidth)
            ;
        });

        this.renderAxis();
    }
}