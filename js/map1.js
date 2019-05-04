
var mapHeight = 500
var mapWidth = 600

var mapSvg = d3.select("#treeVis")
    .append("svg")
        .attr("height", mapHeight)
        .attr("width", mapWidth)

function mapUpdate(){
    d3.json("/finalData/ne_10m_admin_0_sovereignty2EDIT.json").then(function(mapData){
        var projection = d3.geoNaturalEarth1()
            .scale(120)
            .translate([mapWidth*0.45, mapHeight/2])
        var path = d3.geoPath().projection(projection)

        map = mapSvg.selectAll("path")
            .data(mapData.features)

        new_map = map
            .enter()
            .append("path")
            .attr("d",path)
            .attr("stroke", "#444444")
        
        var regionSortOrder = ["World Bank Low Income", "World Bank Lower Middle Income" , "World Bank Upper Middle Income" , "World Bank High Income"]
        var selectedTree = document.getElementById("incomeSlider").value

        let t = d3.transition()
            .duration(300)
        new_map.merge(map)
            .transition(t)
            .attr("fill", function(d){
                if("World Bank " + d.properties["WB_INCOME_GRP"] === regionSortOrder[selectedTree]){
                    return wbAreaColours["World Bank " + d.properties["WB_INCOME_GRP"]]
                }
                else {
                    return "#ffffff"
                }
            })
    })
}
mapUpdate()
