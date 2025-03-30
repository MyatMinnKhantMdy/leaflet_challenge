// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [36.7783, -119.4179],
  zoom: 5
});

// Create the  tile layer that will be the background of our map.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// get the data for the tetonic plates and draw on the map
// variable to hold the tectonic plates layer
let tectonicplates = new L.layerGroup();

// call the api to get the info for the tectonic plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
  // console log to make sure the data loaded
  // console.log(plateData);

  // load data using geoJson and add to the tectonic plates layer group
  L.geoJSON(plateData,{
    // add styling to make the lines visible
    color: "yellow",
    weight: 1
  }).addTo(tectonicplates);
}); 

// add the tectonic plates to the map
tectonicplates.addTo(map);

// variable to hold the earthquake data layer
let earthquakes = new L.layerGroup();

// get the data for the earthquakes and populate the layergroup
// call the USGS GeoJson API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
  function(earthquakeData){
    // console log to make sure the data loaded
    console.log(earthquakeData);
    // plot circles, whare the radius is dependent on the magnitude
    // and the color is dependent on the depth

    // make a function that chooses the color of the data point
    function dataColor(depth) {
      if (depth > 90)
        return "red";
      else if(depth > 70)
        return "#fc4903";
      else if(depth > 50)
        return "#fc8403";
      else if(depth > 30)
        return "#fcad03";
      else if(depth > 10)
        return "#cafc03";
      else
        return "green";
    }

    // make a function that determines the size of the radius
    function radiusSize(mag){
      if (mag == 0)
        return 1; // make sure that a 0 mag earthquake shows up
      else
        return mag * 5; // makes sure that the circle is pronounced in the map
    }

    // add on to the style for each data point
    function dataStyle(feature)
    {
      return {
        opacity: 0.5,
        fillOpacity: 0.5,
        fillColor: dataColor(feature.geometry.coordinates[2]), // use index 2 for the depth
        color: "#000000", // black outline
        radius: radiusSize(feature.properties.mag), // grabs the magnitude
        weight: 0.5,
        stroke: true
      }
    }

    // add the GeoJson Data to the earthquake layer group
    L.geoJSON(earthquakeData, {
        // make each feature a marker that is on the map, each marker is a circle
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
        },
        // set the style for each marker
        style: dataStyle, // calls the data style function and passes in the earthquake data
        // add popups
        onEachFeature: function(feature, layer){
          layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                          Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                          Location: <b>${feature.properties.place}<b/>`);
        }
    }).addTo(earthquakes);

  }

);

// add the earthquake layer to the map
earthquakes.addTo(map);

// add the overlay for the tectonic plates and for the earthquakes
let overlays = {
  "Tetonic Plates": tectonicplates,
  "Earthquake Data": earthquakes
};

// add the Layer control
L.control
  .layers(overlays)
  .addTo(map);

//  add the legend to the map.
let legend = L.control({
  position: "bottomright"  

});

// add to the properties for the legend
legend.onAdd = function() {
  // div for the legend to appear in the page
  let div = L.DomUtil.create("div", "info legend");

  // set up the intervals
  let intervals = [-10, 10, 30, 50, 70, 90];
  // set the colors for the intervals
  let colors = [
    "green",
    "#cafc03",
    "#fcad03",
    "#fc8403",
    "#fc4903",
    "red"
  ];

  // loop through the intervals and the colors and generate a label
  for (let i = 0; i < intervals.length; i++) {
    div.innerHTML +=
      `<div style="background: white; padding: 2px; display: inline-block; margin-bottom: 2px;">
        <i style="background: ${colors[i]}; width: 12px; height: 12px; display: inline-block; margin-right: 6px;"></i>
        ${intervals[i]}${intervals[i + 1] ? `km &ndash; ${intervals[i + 1]}km` : 'km+'}
      </div><br>`;
  }

  return div;
};


// add the legend to the map
legend.addTo(map);