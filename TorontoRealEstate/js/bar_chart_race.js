// modified from Joel Zief's Block:
// https://bl.ocks.org/jrzief/70f1f8a5d066a286da3a1e699823470f

var tickDuration = 500;
var top_n = 10;
var height = 600;
var width = 1200;

var svg = d3.select("#main-svg").append("svg")
  .attr("width", width)
  .attr("height", height);

const margin = {
  top: 90,
  right: 50,
  bottom: 5,
  left: 10
};

let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);

let subTitle = svg.append("text")
 .attr("class", "subTitle")
 .attr("y", 65)
 .attr("x", 10)
 .html("Property value, $");

 let year = 1;

d3.csv('toronto_real_estate_d3_formatted.csv').then(function(data) {

  var map2 = data.map(d => d.name)

  var objArr=[{label:"overall_ask"},{label:"overall_sold"},
              {label:"condos_ask"},{label:"condos_sold"},
              {label:"condoTown_ask"},{label:"condoTown_sold"},
              {label:"freeTown_ask"},{label:"freeTown_sold"},
              {label:"detached_ask"},{label:"detached_sold"}];
  map1 = objArr.map(d => d.label)


  var colScale = d3.scaleOrdinal() //(d3.schemeTableau10)
    .range(["#ff0000","#ff5599","#005500","#00bb00","#0000ff","#33aaff",
          "#7700aa","#c8a2ff","#cc5500","#ffa500"])
    .domain(map1)

   data.forEach(d => {
    d.value = +d.value,
    d.lastValue = +d.lastValue,
    d.value = isNaN(d.value) ? 0 : d.value,
    d.year = +d.year;
  });

 let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
  .sort((a,b) => b.value - a.value)
  .slice(0, top_n);

  yearSlice.forEach((d,i) => d.rank = i);

 let x = d3.scaleLinear()
    .domain([0, d3.max(yearSlice, d => d.value)])
    .range([margin.left, width-margin.right-65]);

 let y = d3.scaleLinear()
    .domain([top_n, 0])
    .range([height-margin.bottom, margin.top]);

 let xAxis = d3.axisTop()
    .scale(x)
    .ticks(width > 500 ? 5:2)
    .tickSize(-(height-margin.top-margin.bottom))
    .tickFormat(d => d3.format(',')(d));

 svg.append('g')
   .attr('class', 'axis xAxis')
   .attr('transform', `translate(0, ${margin.top})`)
   .call(xAxis)
   .selectAll('.tick line')
   .classed('origin', d => d == 0);

 svg.selectAll('rect.bar')
    .data(yearSlice, d => d.name)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', x(0)+1)
    .attr('width', d => x(d.value)-x(0)-1)
    .attr('y', d => y(d.rank)+5)
    .attr('height', y(1)-y(0)-barPadding)
    .style('fill', d => colScale(d.name));

 svg.selectAll('text.label')
    .data(yearSlice, d => d.name)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.value)-8)
    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
    .style('text-anchor', 'end')
    .html(d => d.name);

svg.selectAll('text.valueLabel')
  .data(yearSlice, d => d.name)
  .enter()
  .append('text')
  .attr('class', 'valueLabel')
  .attr('x', d => x(d.value)+5)
  .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
  .text(d => d3.format(',.0f')(d.lastValue));

  //var date = yearSlice[0]['date']

let yearText = svg.append('text')
  .attr('class', 'yearText')
  .attr('y', 25)
  .attr('x', 10)
  //.style('text-anchor', 'end')
  .style('font-size',26)
  .text(yearSlice[0]['date'])

let ticker = d3.interval(e => {

  yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
    .sort((a,b) => b.value - a.value)
    .slice(0,top_n);

  yearSlice.forEach((d,i) => d.rank = i);

  x.domain([0, d3.max(yearSlice, d => d.value)]);

  svg.select('.xAxis')
    .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .call(xAxis);

   let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);

   bars
    .enter()
    .append('rect')
    .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
    .attr('x', x(0)+1)
    .attr( 'width', d => x(d.value)-x(0)-1)
    .attr('y', d => y(top_n+1)+5)
    .attr('height', y(1)-y(0)-barPadding)
    .style('fill', d => colScale(d.name))
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => y(d.rank)+5);

   bars
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('width', d => x(d.value)-x(0)-1)
      .attr('y', d => y(d.rank)+5);

   bars
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('width', d => x(d.value)-x(0)-1)
      .attr('y', d => y(top_n+1)+5)
      .remove();

   let labels = svg.selectAll('.label')
      .data(yearSlice, d => d.name);

   labels
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.value)-8)
    .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
    .style('text-anchor', 'end')
    .html(d => d.name)
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);


	   labels
      .transition()
      .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)-8)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

   labels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)-8)
        .attr('y', d => y(top_n+1)+5)
        .remove();

   let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);

   valueLabels
      .enter()
      .append('text')
      .attr('class', 'valueLabel')
      .attr('x', d => x(d.value)+5)
      .attr('y', d => y(top_n+1)+5)
      .text(d => d3.format(',.0f')(d.lastValue))
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

   valueLabels
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)+5)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
        .tween("text", function(d) {
           let i = d3.interpolateRound(d.lastValue, d.value);
           return function(t) {
             this.textContent = d3.format(',')(i(t));
          };
        });

  valueLabels
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.value)+5)
      .attr('y', d => y(top_n+1)+5)
      .remove();

  //yearText.html(~~date);
  yearText.text(yearSlice[0]['date'])

 if(year == 131) ticker.stop();
 year = d3.format('.0f')((+year) + 1);
},tickDuration);
});
