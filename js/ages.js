function drawVis(){
    let width = 700
    let height = 700;
    let margin = {top: 20, bottom:20, left:20, right:20}
    let centreWidth = 60
    let svg = d3.select("#ageVis")
        .append("svg")
            .attr("height", height)
            .attr("width", width)
    
    d3.csv("/finalData/ageData.csv").then(function(data){
        data.forEach(function(d){
            d.percent_alive = +d.percent_alive
            d.percent_dying = +d.percent_dying
        })
        dieScale = d3.scaleLinear()
            .range([0, width/2 - centreWidth])
            .domain([0, d3.max(data, d=>d.percent_dying)])
        aliveScale = d3.scaleLinear()
            .range([0, width/2 - centreWidth])
            .domain([0, d3.max(data, d=> d.percent_alive)])
        ageScale = d3.scaleBand()
            .range([0,height])
            .domain(d3.range(23)) //23 age categories
            .padding(0.05)

        rightData = data.filter(d => d.location_name == "World Bank High Income")
        rightBars = svg.selectAll(".rightBar")
            .data(rightData)
            .enter()
            .append("rect")
                .attr("class","rightBar")
                .attr("x",width/2 + centreWidth/2)
                .attr("width", d => dieScale(d.percent_dying))
                .attr("y", function(d,i){ 
                    return ageScale(i)})
                .attr("height", ageScale.bandwidth())
                .attr("fill", wbAreaColours["World Bank High Income"])
                .attr("opacity","0.8")

        leftData = data.filter(d => d.location_name == "World Bank Low Income")
        leftBars = svg.selectAll(".leftBar")
            .data(leftData)
            .enter()
            .append("rect")
                .attr("class","leftBar")
                .attr("x", function(d){
                    return width/2 - centreWidth/2 - dieScale(d.percent_dying)
                })
                .attr("width", d => dieScale(d.percent_dying))
                .attr("y", function(d,i){ 
                    return ageScale(i)})
                .attr("height", ageScale.bandwidth())
                .attr("fill", wbAreaColours["World Bank Low Income"])
                .attr("opacity","0.8")

        centreLabels = svg.selectAll(".ageLabel")
            .data(leftData)
            .enter()
            .append("text")
            .attr("class","ageLabel")
            .attr("x",width/2)
            .attr("y", function(d,i){return ageScale(i) + 18})
            .text(d => d.age_group_name)
    })

}drawVis()