var width = 900;
var height = 700;
var margin = {top: 20, bottom:35, left:35, right:60}
var svg = d3.select("#scatterVis")
    .append("svg")
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top+')')
        .attr('id', 'plotArea')
var plotArea= d3.select("#plotArea")
plotArea.append('g')
    .attr('id', 'legendArea')
plotArea.append('g')
    .attr('id', 'yearDisplayArea')
    .attr('transform','translate(550,640)')
    .append("text")
    .attr('id', 'yearDisplayText')

width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

let ttip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
var t = d3.transition()
    .duration(100)
    
let csvData = d3.csv('finalData/LE_Scatter.csv');
function scatterUpdate(){
    
    csvData.then(function(data){

        //add legend
        var offset = 15
        var legend1 = svg.selectAll('.legend')
        .data(Object.keys(areaColours))
        .enter().append('g')
        .attr("class", "legend")
        .attr("transform", function(d,i){
            return "translate(10," + i*offset+")"
        })
        .on("mouseover", function(d){
            svg.selectAll(".dot").filter(function(d2){
                return d === d2.Region
            })
                .attr('r', function(){
                    return (Number(d3.select(this).attr('r')) + 2)
                })
            svg.selectAll(".dot").filter(dd => d != dd.Region)
                .style('opacity','0.2')
            svg.selectAll('.legend').filter(dd => d != dd)
                .style('opacity','0.2')
            })
        .on("mouseout", function(d){
            svg.selectAll(".dot")
                .attr("r", d => popscale(d.pop_value))
                .style('opacity','0.6')
            legend1.style('opacity', 1)
        })
            
        legend1.append('rect')
            .attr("width", 14)
            .attr("height",14)
            .style("fill", function(d,i){
                return areaColours[d]
            })

        legend1.append('text')
            .attr("x",20)
            .attr("y",13)
            .text(function(d){return d})

        //Add year display
        var yearSlider = document.getElementById("yearSlider")
        var yearDisplay = svg.select("#yearDisplayText")
            .text((yearSlider.value == 2015 ? 2017 : yearSlider.value))

        var dots = svg.selectAll(".dot")
            .data(data.filter(function(d){
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

        new_dots.merge(dots)
            .on('mouseover', function(d){
                //show tooltip
                ttip.html(d.Location + "<BR>Life expectancy: "+ d.LE_value + "<BR>GDP: "+d3.format(".3~s")(d.GDP_value))
                    .style("opacity",1)
                    .style("left",d3.event.pageX + 10 + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("background", areaColours[d.Region])


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
        svg.append("g")
            .attr('class', 'y_axis')
        
        svg.select('.y_axis').call(y_axis)


        });
}

//add axis labels
svg.append("text")
    .attr("transform", "translate("+ width/2 + "," + (height + margin.bottom - 5) + ")")
    .text("GDP Per Capita (USD)")
    .attr("class", "axisLabel")
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2)
    .attr("y", -25)
    .attr("class", "axisLabel")
    .text("Life expectancy (years)")

var scTimer
var scPlaying = false
function scatterPlay()
{
    var playScatter = document.getElementById("playScatter")
    if(scPlaying){
        scPlaying = false
        playScatter.innerHTML = "Play"
        clearInterval(scTimer)
    }
    else{
        var yearSlider = document.getElementById("yearSlider")
        if(yearSlider.valueAsNumber === 2015) //wrap around when playing from end
        {
            yearSlider.valueAsNumber = 1960
            yearDisplay.innerHTML = 1960
            svg.select("#yearDisplayText")
                .text(1960)
        }
        scPlaying = true
        playScatter.innerHTML = "Pause"
        scTimer = setInterval(scatterStep, 600)
    }
}
function scatterStep()
{
    var yearSlider = document.getElementById("yearSlider")
    yearSlider.valueAsNumber += 5
    if(yearSlider.valueAsNumber === 2015)
    {
        scPlaying = false
        playScatter.innerHTML = "Play"
        clearInterval(scTimer)
    }
    yearDisplay.innerHTML= yearSlider.value == 2015 ? 2017 : yearSlider.value
    scatterUpdate()
}
scatterUpdate()