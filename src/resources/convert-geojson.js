var convertToGeojson = json => {
  var resultData = [];
  json.forEach(airport => {
    resultData.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [airport["longitude"], airport["latitude"]]
      },
      properties: {
        label: airport["icao"]
      }
    });
  });
  console.log({
    type: "FeatureCollection",
    features: resultData
  });
};
