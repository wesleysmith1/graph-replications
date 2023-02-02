var margin = {top: 10, right: 30, bottom: 60, left: 60},
width = 960 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

let normalData = [], data = [], mean = 0, sd = 1, x = 0, xRange = null;

//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/blob/master/src/stats/distribution/gaussian.js
function gaussian_pdf(x, mean, sd) {
  var gaussianConstant = 1 / Math.sqrt(2 * Math.PI)
    x = (x - mean) / sd;
    return gaussianConstant * Math.exp(-.5 * x * x) / sd;
};

// ========https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function=======
function cdf(x, mean, variance) {
  return 0.5 * (1 + erf((x - mean) / (Math.sqrt(2 * variance))));
}

function erf(x) {
  // save the sign of x
  var sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // constants
  var a1 =  0.254829592;
  var a2 = -0.284496736;
  var a3 =  1.421413741;
  var a4 = -1.453152027;
  var a5 =  1.061405429;
  var p  =  0.3275911;

  // A&S formula 7.1.26
  var t = 1.0/(1.0 + p*x);
  var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y; // erf(-x) = -erf(x);
}
// =========================================================================================================

function calculateXRange() {
  // calculate a good range so that the entire curve is displayed.
  let output = 1
  let range = parseInt(mean)
  while (gaussian_pdf(mean+range, mean, sd) > .0001) {
    range += 1
  }
  console.log('range:', range)
  console.log('mean:', mean)
  console.log([ mean - range, mean + range ])
  return [ mean - range, mean + range ]
}

var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

xRange = calculateXRange()
var xScale = d3.scaleLinear()
  .domain(xRange)
  .range([0, width])

var yScale = d3.scaleLinear()
  .domain(d3.extent([0, .45]))
  .range([ height, 0 ]);

for (let i = xRange[0]; i <= xScale(x); i++) {
  q = xScale.invert(i)
  data.push({x: q, y: gaussian_pdf(q, mean, sd)})
}
  
// generate area of p value
var pvalGen = d3.area()
  .x((p) => xScale(p.x))
  .y0((p) => yScale(0))
  .y1((p) => yScale(p.y));

svg.append("path")
  .attr("d", pvalGen(data))
  .attr("fill", "green")
  .attr("stroke", "black")
  .attr("stroke-width", "0px")
  .attr("class", "area")

// generate data for normal curve
for (let i = 0; i <= width; i++) {
  q = xScale.invert(i)
  normalData.push({x: q, y: gaussian_pdf(q, mean, sd)})
}

// generate normal curve line
var normalLine = d3.line()
  .x(function(d) {
    return xScale(d.x);
  })
  .y(function(d) {
    return yScale(d.y);
  });

svg.append("path")
  .datum(normalData)
  .attr("class", "line normalPDF")
  .attr("d", normalLine);

// boundary line
var dashedGen = d3.line();
var points = [
  [xScale(x), yScale(x)],
  [xScale(x), yScale(gaussian_pdf(x, mean, sd))]
];

var pathOfLine = dashedGen(points);

svg.append("path")
  .attr('d', pathOfLine)
  .attr("class", "dashed")

// draw axis
let xAxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class", "xaxis")
  .call(d3.axisBottom(xScale).tickFormat(x => x));
  
svg.append("g")
  .call(d3.axisLeft(yScale));

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
  .attr("y", yScale(gaussian_pdf(x, mean, sd)) - 10)
  .attr("x", xScale(x))
  .text("50%");

function drawPVal(prob) {

  data = []

  for (let i = xScale(xRange[0]); i <= xScale(x); i++) {
    q = xScale.invert(i)
    data.push({x: q, y: gaussian_pdf(q, mean, sd)})
  }

  // draw area
  Gen = d3.area()
    .x((p) => xScale(p.x))
    .y0((p) => yScale(0))
    .y1((p) => yScale(p.y));

  svg.selectAll("path.area")
    .attr("d", Gen(data))
    .attr("fill", "green")
    .attr("stroke", "black")
    .attr("stroke-width", "0px")

  svg.selectAll("text.probability")
    .attr("y", yScale(gaussian_pdf(x, mean, sd)) - 10)
    .attr("x", xScale(x))
    .text((100 * prob).toFixed(2) + "%");

  // draw dashed boundary
  dashedGen = d3.line();
  points = [
    [xScale(x), yScale(0)],
    [xScale(x), yScale(gaussian_pdf(x, mean, sd))]
  ];

  pathOfLine = dashedGen(points);

  svg.selectAll("path.dashed")
    .attr('d', pathOfLine)
}

function drawCurve() {

  // Update X axis
  xRange = calculateXRange()
  xScale.domain(xRange)
  xAxis.transition().duration(1000).call(d3.axisBottom(xScale))

  let curveData = []
  // generate data for normal curve
  for (let i = 0; i <= width; i++) {
    q = xScale.invert(i)
    curveData.push({x: q, y: gaussian_pdf(q, mean, sd)})
  }

  // generate normal curve line
  normalLine = d3.line()
    .x(function(d) {
      return xScale(d.x);
    })
    .y(function(d) {
      return yScale(d.y);
    });

  svg.selectAll("path.normalPDF")
    .datum(curveData)
    // .attr("class", "line")
    .attr("d", normalLine);
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

// mean range
document.getElementById("meanRange").addEventListener("input", function() {
  mean = parseFloat(this.value)
  let prob = cdf(x, mean, sd)
  document.getElementById("mean").innerHTML = mean
  drawCurve()
  drawPVal(prob)
});

// standard deviation
document.getElementById("sdRange").addEventListener("input", function() {
  sd = this.value
  document.getElementById("standardDeviation").innerHTML = this.value
  // redraw curve
  drawCurve()
  let prob = cdf(x, mean, sd)
  drawPVal(prob)
});

// x value
document.getElementById("xRange").addEventListener("input", function() {
  x = this.value
  document.getElementById("x").innerHTML = this.value
  // redraw curve
  drawCurve()
  let prob = cdf(x, mean, sd)
  drawPVal(prob)
});