d3.csv("data/sensorData.csv", function(error, data) {
  if (error) throw error;

    let parser = new SensorReadingParser(data);


});

