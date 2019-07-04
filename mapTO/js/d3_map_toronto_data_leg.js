// references:
// toronto map: https://github.com/jasonicarter/toronto-geojson
// merging with csv data: http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922
// also help from http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
// linspace function: https://gist.github.com/davebiagioni/1ac21feb1c2db04be4e6
// legend help: https://bl.ocks.org/starcalibre/6cccfa843ed254aa0a0d

d3.csv("toronto_compiled_short.csv", function(data) {

  updateGraph('Businesses');

  var datacols = d3.values(data)[0];
  var datavars = Object.keys(datacols)
  datavars.splice(0,1);
  datavars.splice(0,1);
  datavars.sort();

  var dropdownChange = function() {
                      var data_selected = d3.select(this).property('value');
                         updateGraph(data_selected);
                  };

  var dropdown = d3.select("#main-svg")
      .append("select")
      .style("margin-left", "10px")
      .style("margin-top", "0px")
      .style("font-family", "Quicksand")
      .style("font-size", "14px")
      .style("color", "white")
      .style("background","#000")
      .on("change", dropdownChange)
      .selectAll("option")
      .data(datavars)
      .enter().append("option")
      .attr("value", function (d) { return d; })
      .text(function (d) {
        var d = d.split("_").join(" ");
        return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
      });

  function updateGraph(data_selected) {

    d3.json("toronto_topo.json", function(topology) {

      d3.selectAll("svg").remove()

      var neighbourhoods = topojson.feature(topology, topology.objects.toronto); // topojson.feature works for v1, not v0

      for (var i = 0; i < data.length; i++) {
        dataValue = eval('data[' + i.toString() + '].' + data_selected) // convert data point from str to int
        dataValue = +dataValue
        var dataID = data[i].id;
        for (var j = 0; j < neighbourhoods.features.length; j++)  {
          var jsonID = neighbourhoods.features[j].properties.id;
          if (dataID == jsonID) {
            neighbourhoods.features[j].properties.valtoplot = dataValue;
          break;
          }
        }
      }

      var crange = d3.extent(data, function(d) {
        return +eval('d.' + data_selected)
      })

      // colorschemes: https://bl.ocks.org/pstuffa/d5934843ee3a7d2cc8406de64e6e4ea5
      var color = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain(crange)
        //.scaleLinear()
        //.domain(crange)
        //.interpolate(d3.interpolateHcl)
        //.range(["blue", "pink"]); // [d3.rgb('#007AFF'), d3.rgb('#FFF500')]

      var width = 700, height = 400;

      var projection = d3.geoAlbers()
          .scale(1)
          .translate([0,0]);

      var path = d3.geoPath() // geographic path generator;  used to spcify a projection type
          .projection(projection);

      var div = d3.select('#main-svg').append("div")
      		.attr("class", "tooltip")
      		.style("opacity", 0);

      var b = path.bounds(neighbourhoods),
          s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
          t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

      projection
        .scale(s)
        .translate(t);

      var canvas = d3.select("#main-svg")
          .append("svg")
          .attr("width", width)
          .attr("height", height)

      var mapLabel = canvas.append("text")
          .attr("y", 40)
          .attr("x", 30)
          .attr("class", "map_neighbourhood_name")

      var mapData = canvas.append("text")
          .attr("y", 60)
          .attr("x", 30)
          .attr("class", "map_neighbourhood_name")

      plot = canvas.selectAll("path")
        .data(neighbourhoods.features)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#808080")
        .call(updateFill, data_selected, color)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)

      var fullHeight = .7*height;
      var fullWidth = 80;

      var legMargin = { top: 10, bottom: 20, left: 5, right: 60 };
      var legWidth = fullWidth - legMargin.right;
      var legHeight = fullHeight - legMargin.top - legMargin.bottom;

      var legSvg = d3.select("#main-svg")
          .append("svg")
          .attr('width', fullWidth)
          .attr('height', fullHeight)

      var gradient = legSvg.append("defs")
            .append('svg:linearGradient')
            .attr('id', 'gradient')
            .attr('x1', '0%') // bottom
            .attr('y1', '100%')
            .attr('x2', '0%') // to top
            .attr('y2', '0%')
            .attr('spreadMethod', 'pad');

      var linspace = function(start, stop, nsteps){
        delta = (stop-start)/(nsteps-1)
        return d3.range(start, stop+delta, delta).slice(0, nsteps)
      }

      var pct = linspace(0, 100, 11).map(function(d) {
          return Math.round(d);
      });

      var legrange = crange[1] - crange[0] + 1

      for (var i = 0; i < pct.length; i++) {
        gradient.append('stop')
            .attr('offset', pct[i] + '%')
            .attr('stop-color', color(pct[i]/100*legrange+crange[0]))
            .attr('stop-opacity', 1);
          };

      legSvg.append('rect')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('width', legWidth)
          .attr('height', legHeight)
          .style('fill', 'url(#gradient)');

      var legScale = d3.scaleLinear()
          .domain([crange[0], crange[1]])
          .range([legHeight, 0]);

      var legAxis = d3.axisRight()
          .scale(legScale);

      legSvg.append("g")
          .attr("class", "legend axis")
          .attr("transform", "translate(" + legWidth + ", 0)")
          .call(legAxis)
          .attr("class","legformat")

      function updateFill(selection, data_selected, color) {
        selection.transition().duration(0)
          .attr("fill",  function(d) {
            var value = d.properties.valtoplot
            return color(value)
          });
          };

      function mouseover(d) {
        mapLabel.text(d.properties.name.slice(0,-5))
          .style("fill","#ffffff")
        div.transition()
           .duration(0)
           .style("opacity", .9)
           .text(d.properties.valtoplot)
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 28) + "px")
           .style("position", "absolute")
           .style("text-align", "center")
           .style("width", "50px")
           .style("height", "12px")
           .style("padding","2px")
           .style("font-family","Quicksand")
           .style("font-size", "12px")
           .style("background", "white")
           .style("border", "0px")
           .style("border-radius", "8px")
           .style("pointer-events", "none");
      }

      function mouseout(d) {
        mapLabel.text("")
        div.transition()
         .duration(200)
         .style("opacity", 0);
      }

    });
  };
});
