d3.csv("data/sensorData.csv", function(error, data) {
  if (error) throw error;

    let parser = new SensorReadingParser(data);

    let sensorHeatMap = new SensorHeatMap("sensorHeatMap", 720, 480);
    sensorHeatMap.setData(parser.getSensorReadings());

    sensorHeatMap.render();

});

