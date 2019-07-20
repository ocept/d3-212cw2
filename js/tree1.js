function drawTree(){
    var width = 250
    let height = 250
    let margin = {top: 20, bottom:20, left:20, right:20}
    let svg = d3.select("#scatterVis")
    var colourKey = {"Injuries": "#66c2a5",
        "Non-communicable diseases": "#fc8d62",
        "Communicable, maternal, neonatal, and nutritional diseases":"#8da0cb"}

    var rawData = d3.csv('finalData/tree1.csv')
    rawData.then(function(data){
        data.forEach(function(d) {
            d.GBD_val = +d.GBD_val
        });
        treeData = d3.nest()
            .key(function(d){ return d.location_name})
            .key(function(d) { return d.Lvl1_category})
            .key(function(d) { return d.cause_name})
            .rollup(function(d){ return d3.sum(d, function(d) { return d.GBD_val})})
            .entries(data)

        //draw all the treemaps
        for(i = 0; i <7; i++){
            var hroot = d3.hierarchy(treeData[i], function(d) { return d.values})
                .sum(function(d){return d.value})

            var treeLayout = d3.treemap()
                .size([width, height])
                .padding(1)
            treeLayout(hroot)

            //console.log(hroot.descendants())
            var tree = d3.select("#treeVis")
                .append("g")
            
            console.log(hroot)
            tree.append("div")    
                .text(hroot.data.key)
            tree.append("svg")
                    .attr("width", width)
                    .attr("height", height)
                .selectAll("tree")
                    .data(hroot.leaves())
                    //.append("text")
                    //.attr("text", d => d.data.key)
                    .enter()
                .append("rect")
                    .attr("x", function(d) { return d.x0})
                    .attr("y", function(d) { return d.y0})
                    .attr("width", function(d){ return d.x1 - d.x0})
                    .attr("height", function(d) {return d.y1 - d.y0})
                    .attr("text", function(d){ return d.data.key})
                    .attr("fill", function(d){ return colourKey[d.parent.data.key]})
                 

        }
    })





}
drawTree();