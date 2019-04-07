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
        var regionSortOrder = ["World Bank Low Income", "World Bank Lower Middle Income" , "World Bank Upper Middle Income" , "World Bank High Income"]
        treeData = d3.nest()
            .key(function(d){ return d.location_name})
                .sortKeys(function(d, i ){ 
                    console.log(d + "," + i)
                    return regionSortOrder.indexOf(d) - regionSortOrder.indexOf(i)
                })
            .key(function(d) { return d.Lvl1_category})
            .key(function(d) { return d.cause_name})
            .rollup(function(d){ return d3.sum(d, function(d) { return d.GBD_val})})
            .entries(data)

        selectedTree = document.getElementById("incomeSlider").value
        var hroot = d3.hierarchy(treeData[selectedTree], function(d) { return d.values})
            .sum(function(d){return d.value})

        tree.select("#treeLabel")
            .text(hroot.data.key)

        var treeLayout = d3.pack()
            .size([t2Width, t2Height])
            // .padding(1)
        treeLayout(hroot)

        var nodes = t2Svg.selectAll(".treeNode")
                .data(hroot.descendants())

        console.log(nodes)
        var new_nodes = nodes.enter()
                .append("g")
                .attr("class", "treeNode")
        new_nodes.append("circle")

        nodes.exit()
            .remove()
        
        new_nodes.merge(nodes)
            .select("circle")
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
            .style("opacity", 0.6)
            .attr("r", d => d.r)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", function(d){ 
                console.log(d);
                if(d.depth === 0) {return "#ffffff"}
                else if(d.depth === 2){ return colourKey[d.parent.data.key]}
                else {return colourKey[d.data.key]}
            })
            // .attr("class", d => d.parent.data.key)
                 

        
    })
}
tree2Update();