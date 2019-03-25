var width = 900;
var height = 700;
var margin = {top: 20, bottom:20, left:20, right:60}
var svg = d3.select("#scatterVis")
    .append("svg")
        .attr('width', width)
        .attr('height', height)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top+')');

var colourPalette = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494']
var areaColours = {
    "Europe & Central Asia" : colourPalette[0],
    "East Asia & Pacific" : colourPalette[1],
    "North America": colourPalette[2],
    "Latin America & Caribbean": colourPalette[3],
    "Middle East & North Africa": colourPalette[4],
    "Sub-Saharan Africa": colourPalette[5],
    "South Asia": colourPalette[6]
}
width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

var ttip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
var t = d3.transition()
    .duration(100)

function update(){
    d3.csv('/finalData/LE_Scatter.csv', function(error, data){
        if(error){
            console.log(error)
        }

        //add legend
        var offset = 15
        var legend1 = svg.selectAll('.legend1')
            .data(Object.keys(areaColours))
            .enter().append('g')
            .attr("class", "legend1")
            .attr("transform", function(d,i){
                return "translate(5," + i*offset+")"
            })
            .on("mouseover", function(d){
                svg.selectAll(".dot").filter(function(d2){
                    return d === d2.Region
                })
                    .style('r', function(){
                        return (Number(d3.select(this).attr('r')) + 2)
                    })
                svg.selectAll(".dot").filter(function(d2){
                    return d != d2.Region
                })
                    .style('opacity','0.2')
            })
            .on("mouseout", function(d){
                svg.selectAll(".dot")
                    .style("r", function(dd){ 
                        return popscale(dd.pop_value
                            );})
                    .style('opacity','0.6')
            })
            
        legend1.append('rect')
            .attr("width", 10)
            .attr("height",10)
            .style("fill", function(d,i){
                return areaColours[d]
            })
            .style("stroke","#bbbbbb")

        legend1.append('text')
            .attr("x",20)
            .attr("y",10)
            .text(function(d){return d})

        var dots = svg.selectAll(".dot")
            .data(data.filter(function(d){
                var yearSlider = document.getElementById("yearSlider")
                return d.Year == (yearSlider.value == 2015 ? 2017 : yearSlider.value)  && d.GDP_value > 0 && d.pop_value > 0
                
            }))

        dots
            .exit()
            .attr('cy', height)
            .attr('cx', 0)
            .style('opacity',0)
            .remove();

        var new_dots = dots
            .enter()
            .append('circle')
            .attr('r', 3)
            .attr('opacity',0.6)
            .attr('fill', 'red')
            .attr('stroke', 'black')
            .attr('class','dot')
            

        var xscale = d3.scaleLog()
            .domain([100,100000])
            .range([0,width])
        var yscale = d3.scaleLinear()
            .domain([20,85])
            .range([height,0])
        var popscale = d3.scaleSqrt()
            .domain([100000, 1386395000])
            .range([3,20])
        
        //console.log(popscale(100000))
        //console.log(popscale(10000000))

        new_dots.merge(dots)
            .on('mouseover', function(d){
                ttip.html(d.Location)
                .style("opacity",1)
                .style("left",d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px")
            })
            .on("mouseout", function(d){
                ttip.style("opacity",0)
            })
            //.transition(t)
            .attr("cy", function(d){ return yscale(d.LE_value); })
            .attr("cx", function(d){ return xscale(d.GDP_value); })
            .attr("fill", function(d){ return areaColours[d.Region]})
            .attr("r", function(d){ return popscale(d.pop_value);})

        x_axis = d3.axisBottom()
            .scale(xscale)
            .ticks(4, "$.3s")
        svg.append("g")
            .attr("transform", "translate(0,"+height+")")
            .attr('class','x_axis');

        svg.select('.x_axis').call(x_axis);

        y_axis = d3.axisLeft().scale(yscale)
        svg.append("g").call(y_axis)

    });
}
update()