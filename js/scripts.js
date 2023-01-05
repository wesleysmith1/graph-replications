var margin = {top: 10, right: 30, bottom: 35, left: 60},
width = 960 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

let normalData = [], mean = 0, sigma = 1

//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/blob/master/src/stats/distribution/gaussian.js
function gaussian_pdf(x, mean, sigma) {
  var gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
    x = (x - mean) / sigma;
    return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
};

let data = []

var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
  .domain([-10,10])
  .range([0, width])

var y = d3.scaleLinear()
  .domain(d3.extent([0, .45]))
  .range([ height, 0 ]);

for (let i = x(0); i < x(10); i++) {
  q = x.invert(i)
  data.push({x: q, y: gaussian_pdf(q, mean, sigma)})
}
  
// generate area of p value
var Gen = d3.area()
  .x((p) => x(p.x))
  .y0((p) => y(0))
  .y1((p) => y(p.y));

svg.append("path")
  .attr("d", Gen(data))
  .attr("fill", "green")
  .attr("stroke", "black")
  .attr("stroke-dasharray", "5,5")

// generate data for normal curve
for (let i = 0; i < width; i++) {
  q = x.invert(i)
  normalData.push({x: q, y: gaussian_pdf(q, mean, sigma)})
}

// generate line
var line = d3.line()
  .x(function(d) {
    return x(d.x);
  })
  .y(function(d) {
    return y(d.y);
  });

svg.append("path")
  .datum(normalData)
  .attr("class", "line")
  .attr("d", line);

svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class", "xaxis")
  .call(d3.axisBottom(x).tickFormat(x => x));
  
svg.append("g")
  .call(d3.axisLeft(y));

document.getElementById("myRange").addEventListener("input", function() {
  console.log(this.value)
});