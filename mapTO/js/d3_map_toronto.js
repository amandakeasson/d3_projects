// based off of https://github.com/jasonicarter/toronto-geojson

var width = 550;
var height = 400;

var projection = d3.geo.albers()
    .scale(1)
    .translate([0,0]);

var svg = d3.select(".wrapper").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geo.path() // geographic path generator;  used to spcify a projection type
    .projection(projection);

var mapLabel = svg.append("text")
    .attr("y", 40)
    .attr("x", 30)
    .attr("class", "map_neighbourhood_name")

var g = svg.append("g"); // group element (a container)

d3.json("https://raw.githubusercontent.com/jasonicarter/toronto-geojson/master/toronto_topo.json", function(error, topology) {

    var neighbourhoods = topojson.feature(topology, topology.objects.toronto); // topojson.feature works for v1, not v0

    var b = path.bounds(neighbourhoods),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
      .scale(s)
      .translate(t);

    g.selectAll("path")
      .data(neighbourhoods.features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", "map_neighbourhood")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      //.on("click", clicked)
});

function mouseover(d) {
  mapLabel.text(d.properties.name.slice(0,-5)) // remove suffix id from name
}
function mouseout(d) {
  mapLabel.text("")  // remove out name
}
