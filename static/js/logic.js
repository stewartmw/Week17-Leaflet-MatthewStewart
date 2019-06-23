// Store our API endpoint as queryUrl
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

function makeCircle(radius) {
  var customCircle = {
    radius: radius * 3.5,
    color: "black",
    weight: 0.5,
    fillOpacity: 0.9
  };

  return customCircle;
}

// Perform a GET request to the query URL
d3.json(earthquakeUrl, function (earthquakeData) {

  d3.json(plateUrl, function (plateData) {

    // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map

    var earthquakes = L.geoJSON(earthquakeData.features, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, makeCircle(feature.properties.mag));
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3>
      <h4>${new Date(feature.properties.time)}</h4>
      <p>Magnitude: ${feature.properties.mag}</p>`)
      },
      style: function (feature) {
        var mag = feature.properties.mag;
        if (mag >= 5) {
          return { fillColor: "#da0b1f" };
        } else if (mag >= 4) {
          return { fillColor: "#dc4e08" };
        } else if (mag >= 3) {
          return { fillColor: "#dd7c07" }
        } else if (mag >= 2) {
          return { fillColor: "#dfda05" };
        } else if (mag >= 1) {
          return { fillColor: "#b6e004" }
        } else {
          return { fillColor: "#87e103" }
        };
      }
    });

    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {

      var div = L.DomUtil.create('div', 'info legend');

      var categories = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];
      var colorList = ['#87e103', '#b6e004', '#dfda05', '#dd7c07', '#dc4e08', '#da0b1f'];

      div.innerHTML = `
      <h3 style="margin: 0px; padding: 0px 0px 5px 0px; text-align: center">
        <strong>Magnitude</strong>
      </h3>
    `;

      categories.forEach((category, index) => {
        div.innerHTML += `
        <div style="height: 30px; width: 70px; margin: 0px; padding: 0px">
          <div style="background-color: ${colorList[index]}; height: 30px; width: 30px; display: inline-block; margin: 0px; padding: 0px"></div>
          <div style="height: 30px; width: 30px; float: right; line-height: 30px">${category}</div>
        </div>
        `;
      });

      return div;
    };

    var plates = L.geoJSON(plateData.features, {
      style: function (feature, layer) {
        return {
          fillColor: 'none',
          color: 'orange'
        };
      }
    });

    // Define streetmap and darkmap layers
    var grayMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });

    var outdoorMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    });

    var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      Satellite: satelliteMap,
      Grayscale: grayMap,
      Outdoors: outdoorMap
    };

    var overlayMaps = {
      Earthquakes: earthquakes,
      'Fault Lines': plates
    };

    // Create a new map
    var myMap = L.map("map", {
      center: [
        40.41, -91.43
      ],
      zoom: 3.5,
      layers: [satelliteMap, earthquakes, plates]
    });

    // Create a layer control containing our baseMaps
    // Be sure to add an overlay Layer containing the earthquake GeoJSON
    L.control.layers(baseMaps, overlayMaps, { collapsed: false })
      .addTo(myMap);

    legend.addTo(myMap);

  });

});