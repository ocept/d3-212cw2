var t2Width = 500
let t2Height = 500
var t2margin = {top: 30, bottom:5, left:5, right:5}
var rawData = d3.csv('finalData/tree3.csv')
var tree = d3.select("#treeVis")
    .append("g")
tree.append("div")
    .attr("id", "treeLabel")
var t2Svg = tree.append("svg")
        .attr("width", t2Width)
        .attr("height", t2Height)
t2Svg.append("g").attr("id","legend")
t2Svg.append('g')
        .attr('transform', 'translate(' + t2margin.left + ',' + t2margin.top+')')
        .attr("id","pack")
t2Width = t2Width - t2margin.left - t2margin.right;
t2Height = t2Height - t2margin.top - t2margin.bottom;

var t2TTip = tree.append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

function tree2Update(){
    var colourKey = {"Injuries": "#66c2a5",
        "Non-communicable diseases": "#fc8d62",
        "Communicable, maternal, neonatal, and nutritional diseases":"#8da0cb"}
    var t = d3.transition()
        .duration(800)

    //add legend
    var legendEntries = ["Injuries",
    "Non-communicable diseases",
    "Communicable, maternal, neonatal, and nutritional diseases"]
    var offset = 15;
    var legend = t2Svg.select("#legend").selectAll(".legend")
        .data(legendEntries)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i){
            return "translate(10," + i*offset+")"
        })

    legend.append('rect')
        .attr('width','14')
        .attr('height','14')
        .style('fill', d => colourKey[d])

    legend.append('text')
        .attr("x",20)
        .attr("y",13)
        .text(function(d){return d})

    rawData.then(function(data){
        data.forEach(function(d) {
            d.GBD_val = +d.GBD_val
        })
        var regionSortOrder = ["World Bank Low Income", "World Bank Lower Middle Income" , "World Bank Upper Middle Income" , "World Bank High Income"]
        treeData = d3.nest()
            .key(function(d){ return d.location_name})
                .sortKeys(function(d, i ){ 
                    return regionSortOrder.indexOf(d) - regionSortOrder.indexOf(i)
                })
            .key(function(d) { return d.Lvl1_category})
            .key(function(d) { return d.cause_name})
            .rollup(function(d){ return d3.sum(d, function(d) { return d.GBD_val})})
            .entries(data)

        selectedTree = document.getElementById("incomeSlider").value
        var hroot = d3.hierarchy(treeData[selectedTree], function(d) { return d.values})
            .sum(function(d){return d.value})
        selectedTree.attr
        tree.select("#treeLabel")
            .text(hroot.data.key)
            // .attr("style","background-color:"+wbAreaColours[hroot.data.key])

        var scaleFactor = Math.sqrt(hroot.value / 38331)
        var treeLayout = d3.pack()
            .size([t2Width*scaleFactor, t2Height*scaleFactor])
        treeLayout(hroot)

        var nodes = t2Svg.select("#pack").selectAll(".treeNode")
                .data(hroot.descendants())

        var new_nodes = nodes.enter()
                .append("g")
                .attr("class", "treeNode")
        new_nodes.append("circle")

        nodes.exit()
            .remove()
        
        new_nodes.merge(nodes)
            .select("circle")
            .on("mouseover", function(d){
                if(d.depth > 0){
                    t2TTip.html(d.data.key + "<BR>" + Math.round(d.value))
                        .style("opacity", 1)
                        .style("left", d3.event.pageX + 10 +"px")
                        .style("top", d3.event.pageY + "px")
                }
            })
            .on("mouseout", function(d){
                t2TTip.style("opacity", 0)
            })
            .style("opacity", d => d.depth*0.5)
            .transition(t)
            .attr("r", d => d.r)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", function(d){ 
                if(d.depth === 2){ return colourKey[d.parent.data.key]}
                else {return colourKey[d.data.key]}
            })
        // nodes.each(d => console.log(document.getElementById("treeLabel").innerHTML,",",d.value,",", d.r))
    })
}
tree2Update();