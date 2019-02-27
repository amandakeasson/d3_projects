d3.csv("Activities.csv", function(myrun) {

    var parseTime = d3.timeParse("%H:%M:%S");
    var parseTimeMS = d3.timeParse("%M:%S");
    var formatTime = d3.timeFormat("%H:%M:%S")
    var formatTimeMS = d3.timeFormat("%M:%S")
    var formatDecimal = d3.format(".2f")
    var timeMins = function (d) {
      var splitTime = parseTime(d);
      var f1 = d3.timeFormat("%H");
      var f2 = d3.timeFormat("%M");
      var f3 = d3.timeFormat("%S")
      return formatDecimal(60*f1(splitTime) + +f2(splitTime) + (1/60)*(+f3(splitTime)))
    }
    var timeMinsMS = function (d) {
      var splitTime = parseTimeMS(d);
      var f2 = d3.timeFormat("%M");
      var f3 = d3.timeFormat("%S")
      return formatDecimal(+f2(splitTime) + (1/60)*(+f3(splitTime)))
    }

  myrun.forEach(function(d) {
    d.Distance = +d.Distance;
    d.Calories = +d.Calories.toString().split(",").join("");
    d.Time_Full = formatTime(parseTime(d.Time));
    d.Time = +timeMins(d.Time_Full);
    d.Avg_HR = +d['Avg HR']
    d.Max_HR = +d['Max HR']
    d.Avg_Run_Cadence = +d['Avg Run Cadence']
    d.Max_Run_Cadence = +d['Max Run Cadence']
    d.Avg_Pace_Full = formatTimeMS(parseTimeMS(d['Avg Pace']));
    d.Avg_Pace = +timeMinsMS(d.Avg_Pace_Full)
    d.Best_Pace_Full = formatTimeMS(parseTimeMS(d['Best Pace']));
    d.Best_Pace = +timeMinsMS(d.Best_Pace_Full)
    d.Elev_Gain = +d['Elev Gain']
    d.Elev_Loss = +d['Elev Loss']
    d.Avg_Stride_Length = +d['Avg Stride Length']
  });

  var datavars = [];
  datavars[0] = 'Distance'; datavars[1] = 'Calories'; datavars[2] = 'Time';
  datavars[3] = 'Avg_HR'; datavars[4] = 'Max_HR'; datavars[5] = 'Avg_Run_Cadence';
  datavars[6] = 'Max_Run_Cadence'; datavars[7] = 'Avg_Pace'; datavars[8] = 'Best_Pace';
  datavars[9] = 'Elev_Gain'; datavars[10] = 'Elev_Loss'; datavars[11] = 'Avg_Stride_Length';

var margin = {left: 45, top: 20, right: 20, bottom: 60}
var width = 600 - margin.left - margin.right
var height = width*3/4;

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// initial functions
function x(myrun) { return myrun.Distance; }
function y(myrun) { return myrun.Distance; }
function radius(myrun) { return myrun.Distance; }
function color(myrun) { return myrun.Distance; }
var xrange = d3.extent(myrun, function(d) {return +d.Distance;}),
    yrange = d3.extent(myrun, function(d) {return +d.Distance;}),
    rrange = d3.extent(myrun, function(d) {return +d.Distance;});
    crange = d3.extent(myrun, function(d) {return +d.Distance;});
    rstep = (rrange[1] - rrange[0])/5
    rrangeVals = [rrange[0], rrange[0] + rstep, rrange[0] + 2*rstep, rrange[0] + 3*rstep, rrange[0]+4*rstep,  rrange[1]]
var xScale = d3.scaleLinear().domain([xrange[0], xrange[1]+0.05*(xrange[1]-xrange[0])]).range([0, width]),
    yScale = d3.scaleLinear().domain([yrange[0], yrange[1]+0.05*(yrange[1]-yrange[0])]).range([height, 0]),
    radiusScale = d3.scaleLinear().domain([rrange[0], rrange[1]]).range([5, 20]);
    colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([crange[0], crange[1]]); // magma, inferno, plasma, viridis
var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);

// axes
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// axis labels
var xlbl = svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height + 40)
    .text("Distance");
var ylbl = svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", 0 - margin.left- 5)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .text("Distance");

function order(a, b) { return radius(b) - radius(a); }

var div = d3.select('#chart').append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function splitText(d) {
  var parseDate = d3.timeParse("%Y-%m-%d %H:%M");
  var formatDate = d3.timeFormat("%b %d, %Y")
  return formatDate(parseDate(d.Date));
  };

function mouseover(d) {
  div.transition()
     .duration(0)
     .attr("id","mouse-text")
     .style("opacity", .95)
     .text(splitText(d))
     .style("left", (d3.event.pageX - 50) + "px")
     .style("top", (d3.event.pageY - 120) + "px")
}

function mouseout(d) {
  div.transition()
   .duration(200)
   .style("opacity", 0);
}


var dot = svg.append("g")
		.attr("class", "dots")
    .selectAll(".dot")
		.data(myrun)
    .enter().append("circle")
		.attr("class", "dot")
    .attr("cx", function(d) { return xScale(x(d)); })
    .attr("cy", function(d) { return yScale(y(d)); })
    .attr("r", function(d) { return radiusScale(radius(d)); })
  	.style("fill", function(d) { return colorScale(color(d)); })
    .sort(order)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

var updateGraph = function(dot,newData,changeFunction) {

    dot.call(eval(changeFunction), 300)
  	.sort(order)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  	function changeX(selection, durationTime) {
      function x(myrun) { return +eval('myrun' + '.' + newData); }
      var xrange = d3.extent(myrun, function(d) {return +eval('d' + '.' + newData);});
      var xScale = d3.scaleLinear().domain([xrange[0], xrange[1]+0.05*(xrange[1]-xrange[0])]).range([0, width]);
      var xAxis = d3.axisBottom().scale(xScale).ticks(8);
      selection.transition().duration(+durationTime).ease(d3.easeLinear)
      	.attr("cx", function(d) { return xScale(x(d)); })
      svg.selectAll("g .x.axis").call(xAxis);
      xlbl.transition().duration(0).text(newData.split("_").join(" "));
    		}

    function changeY(selection, durationTime) {
      function y(myrun) { return +eval('myrun' + '.' + newData); }
      var yrange = d3.extent(myrun, function(d) {return +eval('d' + '.' + newData);});
      var yScale = d3.scaleLinear().domain([yrange[0], yrange[1]+0.05*(yrange[1]-yrange[0])]).range([height, 0]);
      var yAxis = d3.axisLeft().scale(yScale);
      selection.transition().duration(durationTime).ease(d3.easeLinear)
        .attr("cy", function(d) { return yScale(y(d)); })
      svg.selectAll("g .y.axis").call(yAxis);
      ylbl.transition().duration(0).text(newData.split("_").join(" "));
    		}

    function changeRadius(selection, durationTime) {
      function radius(myrun) { return +eval('myrun' + '.' + newData); }
      var rrange = d3.extent(myrun, function(d) {return +eval('d' + '.' + newData);});
          rstep = (rrange[1] - rrange[0])/5
          rrangeVals = [rrange[0], rrange[0] + rstep, rrange[0] + 2*rstep, rrange[0] + 3*rstep, rrange[0]+4*rstep,  rrange[1]]
      var radiusScale = d3.scaleLinear().domain([rrange[0], rrange[1]]).range([5, 20]);
        selection.transition().duration(durationTime).ease(d3.easeLinear)
        .attr("r", function(d) { return radiusScale(radius(d)); });
        legLabels.transition().duration(0).each(function(d,i) {
          var g = d3.select(this);
          g.selectAll("text").remove()
          g.append("text")
          .attr("x", 55)
          .attr("y", i*45+30)
          .style("font-size","10px")
          .text(rrangeFormat(rrangeVals[i]));
        });
    	}

    function changeColor(selection, durationTime) {
      function color(myrun) { return +eval('myrun' + '.' + newData); }
      var crange = d3.extent(myrun, function(d) {return +eval('d' + '.' + newData);});
      var colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([crange[0], crange[1]]); // magma, inferno, plasma, viridis
      var legScale = d3.scaleLinear().domain([crange[0], crange[1]]).range([legHeight, 0]);
      var legAxis = d3.axisRight().scale(legScale).ticks(8);
        selection.transition().duration(durationTime).ease(d3.easeLinear)
        .style("fill", function(d) { return colorScale(color(d)); });
        barlabels.transition().duration(0)
            .attr("class", "legend axis")
            .attr("transform", "translate(" + legWidth + "," + 5 + ")")
            .call(legAxis)
    		}
}

var dropdownChange1 = function() {
    var newData = d3.select(this).property('value');
    updateGraph(dot, newData,'changeX');
};

var dropdownChange2 = function() {
    var newData = d3.select(this).property('value');
    updateGraph(dot, newData,'changeY');
};

var dropdownChange3 = function() {
    var newData = d3.select(this).property('value');
    updateGraph(dot, newData,'changeRadius');
};

var dropdownChange4 = function() {
    var newData = d3.select(this).property('value');
    updateGraph(dot, newData,'changeColor');
};

var text1 = d3.select("#chart")
  .insert("text","svg")
  .attr("id", "ddmenu")
  .text("x-axis")
  .style("margin-top","30px")
  .style("font-weight","bold")
  .style("width","200px")

var dropdown1 = d3.select("#chart")
  .insert("select","svg")
  .attr("id","ddmenu")
  .style("margin-top","55px")
  .on("change", dropdownChange1);

var text2 = d3.select("#chart")
  .insert("text","svg")
  .attr("id", "ddmenu")
  .text("y-axis")
  .style("margin-top","30px")
  .style("margin-left","830px")
  .style("font-weight","bold")
  .style("width","200px")

var dropdown2 = d3.select("#chart")
  .insert("select","svg")
  .attr("id","ddmenu")
  .style("margin-top","55px")
  .style("margin-left","830px")
  .on("change", dropdownChange2);

var text3 = d3.select("#chart")
  .insert("text","svg")
  .attr("id", "ddmenu")
  .text("radius")
  .style("margin-top","105px")
  .style("font-weight","bold")
  .style("width","200px")

var dropdown3 = d3.select("#chart")
  .insert("select","svg")
  .attr("id","ddmenu")
  .style("margin-top","130px")
  .on("change", dropdownChange3);

var text4 = d3.select("#chart")
  .insert("text","svg")
  .attr("id", "ddmenu")
  .text("color")
  .style("margin-top","105px")
  .style("margin-left","830px")
  .style("font-weight","bold")
  .style("width","200px")

var dropdown4 = d3.select("#chart")
  .insert("select","svg")
  .attr("id","ddmenu")
  .style("margin-top","130px")
  .style("margin-left","830px")
  .on("change", dropdownChange4);

var legSvg = d3.select("#chart")
    .insert("svg","svg")
    .attr("id","legend")
    .attr('width', 100)
    .attr('height', 300)
    .style("margin-top","160px")

dataset = [5, 8, 11, 14, 17, 20]
rrangeFormat = d3.format('.2f')

var legLabels = legSvg.selectAll("g").data(dataset)
    .enter().append("g")
    .each(function(d,i) {
      var g = d3.select(this);
      g.append('circle')
    .attr("cx", 25)
    .attr("cy", i*45+25)
    .attr('r', dataset[i])
    .style('fill', '#AAAAAA')
    .style("stroke","#000")
    .style("stroke-width","1px")
    g.append("text")
    .attr("x", 55)
    .attr("y", i*45+30)
    .style("font-size","10px")
    .text(rrangeFormat(rrangeVals[i]));
  });

var fullHeight = 300;
var fullWidth = 80;

var legMargin = { top: 10, bottom: 20, left: 5, right: 60 };
var legWidth = fullWidth - legMargin.right;
var legHeight = fullHeight - legMargin.top - legMargin.bottom;

var barsvg = d3.select("#chart")
    .insert("svg","svg")
    .attr("id","legend")
    .attr('width', 80)
    .attr('height', 300)
    .style("margin-top","170px")
    .style("margin-left","830px")

var gradient = barsvg.append("defs")
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
      .attr('stop-color', colorScale(pct[i]/100*legrange+crange[0]))
      .attr('stop-opacity', 1);
    };

barsvg.append('rect')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('width', legWidth)
    .attr('height', legHeight)
    .style('fill', 'url(#gradient)')
    .attr("transform", "translate(" + 0 + "," + 5 + ")");

var legScale = d3.scaleLinear().domain([crange[0], crange[1]]).range([legHeight, 0]);
var legAxis = d3.axisRight().scale(legScale);
var barlabels = barsvg.append("g")
    .attr("class", "legend axis")
    .attr("transform", "translate(" + legWidth + "," + 5 + ")")
    .call(legAxis)

ddlists = ['dropdown1', 'dropdown2', 'dropdown3', 'dropdown4']
ddlists.forEach(function(d) {
  eval(d).selectAll("option")
      .data(datavars)
    .enter().append("option")
      .attr("value", function (d) { return d; })
      .text(function (d) {
        var d = d.split("_").join(" ");
        return d;
      });
  });
});
