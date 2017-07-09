'use strict';

class ChemicalChart2D extends Chart2D {
    constructor(divId, width, height, options) {
        super(divId, width, height, options);

    }

    handleOption(options) {
        options = super.handleOption(options);
        options.margin.left = 60;
        options.margin.bottom = 50;

        return options;
    }

    setData(chemicalName, chemicalData) {

        let self = this;

        let sensorLines = {};
        let sensor;
        let sensorLine;

        chemicalData.forEach(function (sensorData) {
            sensor = sensorData.getSensor();
            if (!sensorLines.hasOwnProperty(sensor)) {
                sensorLines[sensor] = [];
            }

            sensorLine = sensorLines[sensor];
            sensorLine.push(sensorData);
        });


        Object.keys(sensorLines).forEach(function (sensor) {
            sensorLine = sensorLines[sensor];
            self.addData({id: sensor, sensor: sensor, chemical: chemicalName}, sensorLine, 'time', 'reading');

        });
    }

    render(events) {
        super.render(events);

        super.renderAxis("Time", "Reading", '%m/%d %H %S');
    }
}