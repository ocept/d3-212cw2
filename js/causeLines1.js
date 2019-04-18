var l1width = 500;
var l1height = 500;
var margin = {top: 20, bottom:20, left:20, right:20}
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

var selectCause = d3.select("#linesVis")
    .append("select")
    .attr("onchange", "line1Update()")
selectCause.selectAll("option")
    .data(allCauses)
    .enter()
    .append("option")
        .text(d => d)

var l1svg = d3.select("#linesVis")
    .append("div")    
    .append("svg")
        .attr('width', l1width)
        .attr('height', l1height)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top+')')

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


function line1Update(){   
    console.log(selectCause.property("value"))
    var selectedCause = selectCause.property("value")
    var l1data = d3.csv("/finalData/causeLines1.csv")
    l1data.then(function(data) {
        causeData = data.filter(d => d.cause_name == selectedCause)
        causeData.forEach(function(d){
            d.year = +d.year
            d.GBD_val = +d.GBD_val
        })
        xscale.domain(d3.extent(causeData, d => d.year))
        yscale.domain(d3.extent(causeData, d => d.GBD_val))
        console.log(yscale.domain())
        var line = d3.line()
            .x(d => xscale(d[0]))
            .y(d => yscale(d[1]))
        // console.log(yscale.domain())
        //group data by location
        causeData = d3.nest()
            .key(d => d.location_name)
            .entries(causeData)
            
        // console.log(causeData)
        plot = l1svg.selectAll(".plot")
            .data(causeData)
            .enter()
            .append("g")
            .attr("class", "plot")
            .append("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", d => wbAreaColours[d.key])
            .attr("stroke-width", "2px")
            
        l1svg.selectAll(".line")
            .data(causeData)
            .attr("d", function(d,i){
                linepath = []
                for(i = 0; i < d.values.length; i++)
                {
                    linepath.push([d.values[i].year, d.values[i].GBD_val])
                }
                return line(linepath)
            })

    })
}line1Update()
