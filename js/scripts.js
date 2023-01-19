var margin = {top: 10, right: 30, bottom: 60, left: 60},
width = 960 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

let normalData = [], mean = 0, sigma = 1

let Z = 0

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
  .domain([-4,4])
  .range([0, width])

var y = d3.scaleLinear()
  .domain(d3.extent([0, .45]))
  .range([ height, 0 ]);

for (let i = x(Z); i < x(5); i++) {
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
  .attr("stroke-width", "0px")
  .attr("class", "area")

// generate data for normal curve
for (let i = 0; i <= width; i++) {
  q = x.invert(i)
  normalData.push({x: q, y: gaussian_pdf(q, mean, sigma)})
}

// generate normal curve line
var normalLine = d3.line()
  .x(function(d) {
    return x(d.x);
  })
  .y(function(d) {
    return y(d.y);
  });

svg.append("path")
  .datum(normalData)
  .attr("class", "line")
  .attr("d", normalLine);

// boundary line
var dashedGen = d3.line();
var points = [
  [x(Z), y(Z)],
  [x(Z), y(gaussian_pdf(Z, mean, sigma))]
];

var pathOfLine = dashedGen(points);

svg.append("path")
  .attr('d', pathOfLine)
  .attr("class", "dashed")

// draw axis
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class", "xaxis")
  .call(d3.axisBottom(x).tickFormat(x => x));

svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 365)
  .attr("x", 500)
  .text("Z-score");
  
svg.append("g")
  .call(d3.axisLeft(y));

svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", -40)
  .attr("x", -110 )
  .attr("transform", "rotate(-90)")
  .text("Probability Density");

// draw pvalue text label
svg.append("text")
  .attr("class", "probability")
  .attr("y", y(gaussian_pdf(Z, mean, sigma)) - 10)
  .attr("x", x(Z))
  .text("50%");

function drawPVal(prob) {

  data = []

  for (let i = x(Z); i < x(5); i++) {
    q = x.invert(i)
    data.push({x: q, y: gaussian_pdf(q, mean, sigma)})
  }

  // draw area
  Gen = d3.area()
    .x((p) => x(p.x))
    .y0((p) => y(0))
    .y1((p) => y(p.y));

  svg.selectAll("path.area")
    .attr("d", Gen(data))
    .attr("fill", "green")
    .attr("stroke", "black")
    .attr("stroke-width", "0px")

  svg.selectAll("text.probability")
    .attr("y", y(gaussian_pdf(Z, mean, sigma)) - 10)
    .attr("x", x(Z))
    .text((100 - prob).toFixed(2) + "%");

  // draw dashed boundary
  dashedGen = d3.line();
  points = [
    [x(Z), y(0)],
    [x(Z), y(gaussian_pdf(Z, mean, sigma))]
  ];

  console.log(points)

  pathOfLine = dashedGen(points);

  svg.selectAll("path.dashed")
    .attr('d', pathOfLine)
}

var probabilities = {
  "0.0": 50,
  "0.1": 53.98,
  "0.2": 57.93,
  "0.3": 61.79,
  "0.4": 65.54,
  "0.5": 69.15,
  "0.6": 72.57,
  "0.7": 75.8,
  "0.8": 78.81,
  "0.9": 81.59,
  "1.0": 84.13,
  "1.1": 86.43,
  "1.2": 88.49,
  "1.3": 90.32,
  "1.4": 91.92,
  "1.5": 93.32,
  "1.6": 94.52,
  "1.7": 95.54,
  "1.8": 96.41,
  "1.9": 97.13,
  "2.0": 97.72,
  "2.1": 98.21,
  "2.2": 98.61,
  "2.3": 98.93,
  "2.4": 99.18,
  "2.5": 99.38,
  "2.6": 99.53,
  "2.7": 99.65,
  "2.8": 99.74,
  "2.9": 99.81,
  "3.0": 99.87,
  "3.1": 99.9,
  "3.2": 99.93,
  "3.3": 99.95,
  "3.4": 99.97,
}

document.getElementById("myRange").addEventListener("input", function() {
  Z = this.value
  let prob = probabilities[String(parseFloat(Z).toFixed(1))]
  document.getElementById("zscore").innerHTML = this.value
  drawPVal(prob)
});