var l1width = 500;
var l1height = 500;
var l1margin = {top: 20, bottom:20, left:40, right:20}
var allCauses = ['Cardiovascular diseases', 'Chronic respiratory diseases',
'Diabetes and kidney diseases', 'Digestive diseases',
'Enteric infections',
'HIV/AIDS and sexually transmitted infections',
'Maternal and neonatal disorders', 'Mental disorders',
'Musculoskeletal disorders',
'Neglected tropical diseases and malaria', 'Neoplasms',
'Neurological disorders', 'Nutritional deficiencies',
'Other infectious diseases', 'Other non-communicable diseases',
'Respiratory infections and tuberculosis',
'Self-harm and interpersonal violence',
'Skin and subcutaneous diseases', 'Substance use disorders',
'Transport injuries', 'Unintentional injuries']

// var selectCause = d3.select("#linesVis")
//     .append("select")
//     .attr("onchange", "line1Update()")
selectCause = d3.select("#selectCause")
selectCause.selectAll("option")
    .data(allCauses)
    .enter()
    .append("option")
        .text(d => d)

var l1svg = d3.select("#linesVis")
    .append("svg")
        .attr('width', l1width)
        .attr('height', l1height)
    .append("g")
        .attr('transform', 'translate(' + l1margin.left + ',' + l1margin.top+')')

var l2svg = d3.select("#linesVis")
    .append("svg")
        .attr('width', l1width)
        .attr('height', l1height)
    .append("g")
        .attr('transform', 'translate(' + l1margin.left + ',' + l1margin.top+')')

l1width = l1width - l1margin.left - l1margin.right;
l1height = l1height - l1margin.top - l1margin.bottom;
var fourColourPallet = ['#d7191c','#fdae61','#a6d96a','#1a9641']
var wbAreaColours = {
    "World Bank High Income" : fourColourPallet[3],
    "World Bank Upper Middle Income" : fourColourPallet[2],
    "World Bank Lower Middle Income" : fourColourPallet[1],
    "World Bank Low Income" : fourColourPallet[0]
}

function linesUpdate(){
    var t = d3.transition()
        .duration(200)
    var line = d3.line()
        .x(d => xscale(d[0]))
        .y(d => yscale(d[1]))
    var xscale = d3.scaleLinear()
        .range([0, l1width])
    var yscale = d3.scaleLinear()
        .range([l1height, 0])

    console.log(selectCause.property("value"))
    var selectedCause = selectCause.property("value")
    Promise.all([
        d3.csv("/finalData/causeLines1.csv"),
        d3.csv("/finalData/causeLines2.csv")
    ])
    .then(function(data) {
        causeData = data[0].filter(d => d.cause_name == selectedCause)
        causeData.forEach(function(d){
            d.year = +d.year
            d.GBD_val = +d.GBD_val
        })
        l2causeData = data[1].filter(d => d.cause_name == selectedCause)
        l2causeData.forEach(function(d){
            d.year = +d.year
            d.GBD_val = +d.GBD_val
        })
        xscale.domain(d3.extent(causeData, d => d.year))
        l1Max = d3.max(causeData, d => d.GBD_val)
        l2Max = d3.max(l2causeData, d => d.GBD_val)
        yscale.domain([0 , d3.max([l1Max, l2Max])])

        //group data by location
        causeData = d3.nest()
            .key(d => d.location_name)
            .entries(causeData)
            
        plot = l1svg.selectAll(".plot")
            .data(causeData)
            .enter()
            .append("g")
            .attr("class", "plot")
            .append("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", d => wbAreaColours[d.key])
            .attr("stroke-width", "3px")
            
        l1svg.selectAll(".line")
            .data(causeData)
            .transition(t)
            .attr("d", function(d,i){
                linepath = []
                for(i = 0; i < d.values.length; i++)
                {
                    linepath.push([d.values[i].year, d.values[i].GBD_val])
                }
                return line(linepath)
            })
        
        x_axis = d3.axisBottom()
            .scale(xscale)
            .ticks(4,".4r")
            // .tickFormat(d3.format(".4r"))
        l1svg.append("g")
            .attr("transform", "translate(0,"+l1height+")")
            .attr('class','x_axis')
        l1svg.select('.x_axis').call(x_axis)

        y_axis = d3.axisLeft().scale(yscale)
        l1svg.append("g")
            .attr('class', 'y_axis')
        
        l1svg.select('.y_axis')
            .transition(t)
            .call(y_axis)


        //draw right chart
        l2causeData = d3.nest()
            .key(d => d.location_name)
            .entries(l2causeData)
        
        l2plot = l2svg.selectAll("plot")
            .data(l2causeData)
            .enter()
            .append("g")
            .attr("class", "plot")
            .append("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", d => areaColours[d.key])
            .attr("stroke-width", "3px")

        l2svg.selectAll(".line")
            .data(l2causeData)
            .transition(t)
            .attr("d", function(d,i){
                linepath = []
                for(i =0; i < d.values.length; i++){
                    linepath.push([d.values[i].year, d.values[i].GBD_val])
                }
                return line(linepath)
            })
        
        l2svg.append("g")
            .attr("transform", "translate(0," + l1height + ")")
            .attr("class", "x_axis")
        l2svg.select(".x_axis").call(x_axis)

        l2svg.append("g")
            .attr("class", "y_axis")
        l2svg.select(".y_axis")
            .transition(t)
            .call(y_axis)
    })
}linesUpdate()

function line2Update(){

}line2Update()
