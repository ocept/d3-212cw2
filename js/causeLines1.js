var l1width = 500;
var l1height = 500;
var l1svg = d3.select("#linesVis")
    .append("svg")
        .attr('width', l1width)
        .attr('height', l1height)

var selectedCause = "Enteric infections" //TEMP
var line = d3.line()
    .x(d => xscale(d[0]))
    .y(d => yscale(d[1]))

var fourColourPallet = ['#e66101','#fdb863','#b2abd2','#5e3c99']
var wbAreaColours = {
    "World Bank High Income" : fourColourPallet[0],
    "World Bank Upper Middle Income" : fourColourPallet[1],
    "World Bank Lower Middle Income" : fourColourPallet[2],
    "World Bank Low Income" : fourColourPallet[3]
}


var xscale = d3.scaleLinear()
    .range([0, l1width])
var yscale = d3.scaleLinear()
    .range([l1height, 0])
    
var l1data = d3.csv("/finalData/causeLines1.csv")
l1data.then(function(data) {
    causeData = data.filter(d => d.cause_name == selectedCause)
    causeData.forEach(function(d){
        d.year = +d.year
        d.GBD_val = +d.GBD_val
    })
    xscale.domain(d3.extent(causeData, d => d.year))
    yscale.domain(d3.extent(causeData, d => d.GBD_val))

    causeData = d3.nest()
        .key(d => d.location_name)
        .entries(causeData)
        
    console.log(causeData)
    plot = l1svg.selectAll(".plot")
        .data(causeData)
        .enter()
        .append("g")
        .attr("class", "plot")
    
    plot.append("path")
        .attr("class","line")
        .attr("d", function(d,i){
            linepath = []
            for(i = 0; i < d.values.length; i++)
            {
                linepath.push([d.values[i].year, d.values[i].GBD_val])
            }
            return line(linepath)
        })
        .attr("fill", "none")
        .attr("stroke", d => wbAreaColours[d.key])
        .attr("stroke-width", "2px")


})