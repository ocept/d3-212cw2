d3.select(window)
    .on("scroll", checkScrollPosition)
    
function checkScrollPosition(){
	var pagePos = window.pageYOffset
    var agePos = document.getElementById("ageVis").getBoundingClientRect().top
	if(agePos < pagePos) {
		drawAgeVis(pagePos - agePos)
	}
}
let ageWidth = 700
let ageHeight = 700;

var ageSvg = d3.select("#ageVis")
.append("svg")
    .attr("height", ageHeight)
    .attr("width", ageWidth)
ageSvg.append("g").attr("id","bars")
ageSvg.append("g").attr("id","lines")
ageSvg.append("g").attr("id","centreLabels")
ageSvg.append("g").attr("id","mouseBoxes")

function drawAgeVis(scrollPos){

    let margin = {top: 20, bottom:20, left:20, right:20}
    let centreWidth = 60

    let scrollHeight = 1300
	let ageCategories = 22
    let scrollPoint = Math.floor((scrollPos) / (scrollHeight / ageCategories))
    
    d3.csv("/finalData/ageData.csv").then(function(data){
        data.forEach(function(d){
            d.percent_alive = +d.percent_alive
            d.percent_dying = +d.percent_dying
        })
        console.log(Math.max(scrollPoint,1))
        
        dieScale = d3.scaleLinear()
            .range([0, ageWidth/2 - centreWidth])
            .domain([0, d3.max(data, d=>d.percent_dying)])
        aliveScale = d3.scaleLinear()
            .range([0, ageWidth/2 - centreWidth])
            .domain([0, d3.max(data, d=> d.percent_alive)])
        ageScale = d3.scaleBand()
            .range([0,ageHeight])
            .domain(d3.range(ageCategories))
            .padding(0.05)

        // data = data.slice(0,Math.max(scrollPoint,1))
        data = data.filter(d => (d.ageCat < scrollPoint))

        //RIGHT BARS
        rightData = data.filter(d => d.location_name == "World Bank High Income")
        rightBars = ageSvg.select("#bars").selectAll(".rightBar")
            .data(rightData)

        newRightBars = rightBars.enter()
            .append("g")
                .attr("transform",function(d,i){
                    return "translate(" + (ageWidth/2 + centreWidth/2) + "," + ageScale(i) +")"
                })
            .attr("class","rightBar")
        newRightBars.append("rect")
            .attr("width", d => dieScale(d.percent_dying))
            .attr("height", ageScale.bandwidth())
            .attr("fill", wbAreaColours["World Bank High Income"])
            .attr("opacity","0.8")
        newRightBars.append("text")
            .text(d => ((d.percent_dying)*100).toPrecision(2)+"%")
            .attr("class", function(d){
                return ("barText"+d.ageCat)
            })
            .attr("y",18)
            .attr("x", d => dieScale(d.percent_dying) + 10)
            .attr("opacity",0)
            .attr("stroke", wbAreaColours["World Bank High Income"])

        rightBars.exit()
            .remove()

        //LEFT BARS
        leftData = data.filter(d => d.location_name == "World Bank Low Income")
        leftBars = ageSvg.select("#bars").selectAll(".leftBar")
            .data(leftData)
            
        newLeftBars = leftBars.enter()
            .append("g")
                .attr("transform",function(d,i){
                    return "translate(" + 
                    (ageWidth/2 - centreWidth/2 - dieScale(d.percent_dying)) + 
                    "," + ageScale(i) +")"
                })
            .attr("class","leftBar")
        newLeftBars.append("rect")
            .attr("width", d => dieScale(d.percent_dying))
            .attr("height", ageScale.bandwidth())
            .attr("fill", wbAreaColours["World Bank Low Income"])
            .attr("opacity","0.8")
        newLeftBars.append("text")
            .text(d => ((d.percent_dying)*100).toPrecision(2)+"%")
            .attr("class", function(d){
                return ("barText"+d.ageCat)
            })
            .attr("y",18)
            .attr("x",-5)
            .attr("style","text-anchor: end")
            .attr("opacity",0)
            .attr("stroke", wbAreaColours["World Bank Low Income"])
        
        leftBars.exit()
            .remove()
        
        centreLabels = ageSvg.select("#centreLabels").selectAll(".ageLabel")
            .data(leftData)
        centreLabels.enter()
            .append("text")
            .attr("class","ageLabel")
            .attr("x",ageWidth/2)
            .attr("y", function(d,i){return ageScale(i) + 18})
            .text(d => d.age_group_name)

        centreLabels.exit().remove()
            
        //LINES
        var rightLinePath = d3.line()
            .x(d => aliveScale(d[1]) + ageWidth/2 + centreWidth/2)
            .y(d => ageScale(d[0]))
        var leftLinePath = d3.line()
            .x(d => ageWidth/2 - centreWidth/2 - aliveScale(d[1]))
            .y(d => ageScale(d[0]))

        rightLineData = rightData.map(function(d,i){
                return [i, d.percent_alive]
            })
        rightLine = ageSvg.select("#lines").selectAll(".rightLine")
            .data(rightLineData)
        newRightLine = rightLine.enter()
            .append("path")
                .attr("class","rightLine")
                .attr("fill", "none")
                .attr("stroke-width", "2px")
                .attr("stroke", "black")
        newRightLine.merge(rightLine)
            .attr("d", rightLinePath(rightLineData))

        rightLine.exit().remove()
        
        leftLineData = leftData.map(function(d,i){
            return [i, d.percent_alive]
        })
        leftLine = ageSvg.select("#lines").selectAll(".leftLine")
            .data(leftLineData)
        newLeftLine = leftLine.enter()
            .append("path")
                .attr("class","leftLine")
                .attr("fill", "none")
                .attr("stroke-width", "2px")
                .attr("stroke", "black")
        newLeftLine.merge(leftLine)
            .attr("d", leftLinePath(leftLineData))
        leftLine.exit().remove()

        //BOXES FOR MOUSE OVER
        ageSvg.select("#mouseBoxes").selectAll(".mouseOverBox")
            .data(leftData)
            .enter()
            .append("rect")
                .attr("class","mouseOverBox")
                .attr("opacity",0)
                .style("z-index",99)
                .attr("width",ageWidth)
                .attr("height",ageScale.bandwidth())
                .attr("y", function(d,i){ return ageScale(i)})
                .on("mouseover", function(d){
                    // console.log(d.age_group_name)
                    ageSvg.selectAll((".barText"+d.ageCat))
                        .attr("opacity",1)
                })
                .on("mouseout", function(d){
                    // console.log(d.age_group_name)
                    ageSvg.selectAll((".barText"+d.ageCat))
                        .attr("opacity",0)
                })
    })

}