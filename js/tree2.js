var t2Width = 500
let t2Height = 500
var rawData = d3.csv('/finalData/tree2.csv')
var tree = d3.select("#treeVis")
    .append("g")
tree.append("div")
    .attr("id", "treeLabel")
var t2Svg = tree.append("svg")
    .attr("width", t2Width)
    .attr("height", t2Height)
var t2TTip = tree.append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

function tree2Update(){
    
    var colourKey = {"Injuries": "#66c2a5",
        "Non-communicable diseases": "#fc8d62",
        "Communicable, maternal, neonatal, and nutritional diseases":"#8da0cb"}
    var t = d3.transition()
        .duration(800)


    rawData.then(function(data){
        data.forEach(function(d) {
            d.GBD_val = +d.GBD_val
        })
        treeData = d3.nest()
            .key(function(d){ return d.location_name})
            .key(function(d) { return d.Lvl1_category})
            .key(function(d) { return d.cause_name})
            .rollup(function(d){ return d3.sum(d, function(d) { return d.GBD_val})})
            .entries(data)

        selectedTree = document.getElementById("incomeSlider").value
        var hroot = d3.hierarchy(treeData[selectedTree], function(d) { return d.values})
            .sum(function(d){return d.value})

        var treeLayout = d3.treemap()
            .size([t2Width, t2Height])
            .padding(1)
        treeLayout(hroot)
        
        console.log(hroot)
        tree.select("#treeLabel")
           .text(hroot.data.key)

        var nodes = t2Svg.selectAll(".treeNode")
                .data(hroot.leaves())

        console.log(nodes)
        var new_nodes = nodes.enter()
                .append("rect")
                .attr("class", "treeNode")
        
        // new_nodes.append("text")
            // .html(d => d.data.key)

        nodes.exit()
            .remove()
                
        new_nodes.merge(nodes)
            .on("mouseover", function(d){
                t2TTip.html(d.data.key)
                    .style("opacity", 1)
                    .style("left", d3.event.pageX + 10 +"px")
                    .style("top", d3.event.pageY + "px")
            })
            .on("mouseout", function(d){
                t2TTip.style("opacity", 0)
            })
            .transition(t)
            .attr("x", function(d) { return d.x0})
            .attr("y", function(d) { return d.y0})
            .attr("width", function(d){ return d.x1 - d.x0})
            .attr("height", function(d) {return d.y1 - d.y0})
            .attr("text", function(d){ return d.data.key})
            .attr("fill", function(d){ return colourKey[d.parent.data.key]})
            
                 

        
    })
}
tree2Update();