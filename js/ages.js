function drawAgeVis(){
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

        //RIGHT
        rightData = data.filter(d => d.location_name == "World Bank High Income")
        rightBars = svg.selectAll(".rightBar")
            .data(rightData)
            .enter()
            .append("g")
                .attr("transform",function(d,i){
                    return "translate(" + (width/2 + centreWidth/2) + "," + ageScale(i) +")"
                })
        rightBars.append("rect")
            .attr("class","rightBar")
            .attr("width", d => dieScale(d.percent_dying))
            .attr("height", ageScale.bandwidth())
            .attr("fill", wbAreaColours["World Bank High Income"])
            .attr("opacity","0.8")
        rightBars.append("text")
            .text(d => ((d.percent_dying)*100).toPrecision(2))
            .attr("class", function(d){
                return ("barText"+d.age_group_name.replace(" ","_").replace(" ","_"))
            })
            .attr("y",18)
            .attr("x", d => dieScale(d.percent_dying) + 10)
            .attr("opacity",0)

        //LEFT
        leftData = data.filter(d => d.location_name == "World Bank Low Income")
        leftBars = svg.selectAll(".leftBar")
            .data(leftData)
            .enter()
            .append("g")
                .attr("transform",function(d,i){
                    return "translate(" + 
                    (width/2 - centreWidth/2 - dieScale(d.percent_dying)) + 
                    "," + ageScale(i) +")"
                })
        leftBars.append("rect")
            .attr("class","leftBar")
            .attr("width", d => dieScale(d.percent_dying))
            .attr("height", ageScale.bandwidth())
            .attr("fill", wbAreaColours["World Bank Low Income"])
            .attr("opacity","0.8")
        leftBars.append("text")
            .text(d => ((d.percent_dying)*100).toPrecision(2))
            .attr("class", function(d){
                return ("barText"+d.age_group_name.replace(" ","_").replace(" ","_"))
            })
            .attr("y",18)
            .attr("x",-5)
            .attr("style","text-anchor: end")
            .attr("opacity",0)

        centreLabels = svg.selectAll(".ageLabel")
            .data(leftData)
            .enter()
            .append("text")
            .attr("class","ageLabel")
            .attr("x",width/2)
            .attr("y", function(d,i){return ageScale(i) + 18})
            .text(d => d.age_group_name)

        var rightLine = d3.line()
            .x(d => aliveScale(d[1]) + width/2 + centreWidth/2)
            .y(d => ageScale(d[0]))
        var leftLine = d3.line()
            .x(d => width/2 - centreWidth/2 - aliveScale(d[1]))
            .y(d => ageScale(d[0]))

        rightLineData = rightData.map(function(d,i){
                return [i, d.percent_alive]
            })
        svg.append("path")
                .attr("class","rightLine")
                .attr("fill", "none")
                .attr("stroke-width", "2px")
                .attr("stroke", "black")
                .attr("d", rightLine(rightLineData))

        leftLineData = leftData.map(function(d,i){
            return [i, d.percent_alive]
        })
        svg.append("path")
                .attr("class","leftLine")
                .attr("fill", "none")
                .attr("stroke-width", "2px")
                .attr("stroke", "black")
                .attr("d", leftLine(leftLineData))

        svg.selectAll(".mouseOverBox")
            .data(leftData)
            .enter()
            .append("rect")
                .attr("class","mouseOverBox")
                .attr("opacity",0)
                .attr("width",width)
                .attr("height",ageScale.bandwidth())
                .attr("y", function(d,i){ return ageScale(i)})
                .on("mouseover", function(d){
                    // console.log(d.age_group_name)
                    svg.selectAll((".barText"+d.age_group_name.replace(" ","_").replace(" ","_")))
                        .attr("opacity",1)
                })
                .on("mouseout", function(d){
                    // console.log(d.age_group_name)
                    svg.selectAll((".barText"+d.age_group_name.replace(" ","_").replace(" ","_")))
                        .attr("opacity",0)
                })
    })

}drawAgeVis()