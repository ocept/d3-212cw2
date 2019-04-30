d3.select(window)
    .on("scroll.ageScroll", checkScrollPosition)
    
let ageMargin = {top: 22, bottom:10, left:60, right:60}
let ageWidth = 900
let ageHeight = 700;
var ageScrollHeight = 1000
function checkScrollPosition(){
    var ageTop = document.getElementById("ageVis").getBoundingClientRect().top
    var ageEnd = document.getElementById("ageEnd").getBoundingClientRect().top
    // console.log(ageTop, ageEnd)
	if(ageTop < 1) {
		drawAgeVis(ageScrollHeight - ageEnd)
	}
}
var ageSvg = d3.select("#ageVis")
.append("svg")
    .attr("height", ageHeight)
    .attr("width", ageWidth)
    .append('g')
    .attr('transform', 'translate(' + ageMargin.left + ',' + ageMargin.top+')')
ageSvg.append("g").attr("id","bars")
ageSvg.append("g").attr("id","lines")
ageSvg.append("g").attr("id","centreLabels")
ageRightText = ageSvg.append("g").attr("id","rightText")
ageRightText.append("text").attr("class", "ageAliveLabel")
ageRightText.append("text").attr("class", "ageLabelLabel").text("still alive")
ageLeftText = ageSvg.append("g").attr("id","leftText")
ageLeftText.append("text").attr("class", "ageAliveLabel")
ageLeftText.append("text").attr("class", "ageLabelLabel").text("still alive")
ageSvg.append("g").attr("id","mouseBoxes")

ageWidth = ageWidth - ageMargin.left - ageMargin.right;
ageHeight = ageHeight - ageMargin.top - ageMargin.bottom;

//Top labels
ageSvg.append("text")
    .attr("x", ageWidth/4)
    .attr("y", -8)
    .attr("class", "ageTopLabel")
    .text("Low Income")
ageSvg.append("text")
    .attr("x", ageWidth/2)
    .attr("y", -8)
    .attr("class", "ageTopLabel")
    .text("Age")
ageSvg.append("text")
    .attr("x", 3/4 * ageWidth)
    .attr("y", -8)
    .attr("class", "ageTopLabel")
    .text("High Income")

function drawAgeVis(scrollPos){
    let centreWidth = 60


	let ageCategories = 22
    let scrollPoint = Math.floor((scrollPos) / (ageScrollHeight / ageCategories))

    let t = d3.transition()
        .duration(300)
    
    d3.csv("/finalData/ageData.csv").then(function(data){
        data.forEach(function(d){
            d.percent_alive = +d.percent_alive
            d.percent_dying = +d.percent_dying
        })
        // console.log(Math.max(scrollPoint,1))
        
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

        data = data.filter(d => (d.ageCat < scrollPoint))
        if(data.length > 2)
        {
            //RIGHT BARS
            rightData = data.filter(d => d.location_name == "World Bank High Income")
            rightBars = ageSvg.select("#bars").selectAll(".rightBar")
                .data(rightData.slice(0,rightData.length - 1))

            newRightBars = rightBars.enter()
                .append("g")
                    .attr("transform",function(d,i){
                        return "translate(" + (ageWidth/2 + centreWidth/2) + "," + ageScale(i) +")"
                    })
                .attr("class","rightBar")
            newRightBars.append("rect")
                .attr("height", ageScale.bandwidth())
                .transition(t)
                .attr("width", d => dieScale(d.percent_dying))
                .attr("fill", wbAreaColours["World Bank High Income"])
                .attr("opacity","0.8")
            newRightBars.append("text")
                .text(d => ((d.percent_dying)*100).toPrecision(2)+"%")
                .attr("class", function(d){
                    return ("barText"+d.ageCat)
                })
                .attr("y",20)
                .attr("x", d => dieScale(d.percent_dying) + 10)
                .attr("opacity",0)
                .attr("style", "fill:" + wbAreaColours["World Bank High Income"] + ";font:18px sans-serif;")

            rightBars.exit()
                .remove()

            //LEFT BARS
            leftData = data.filter(d => d.location_name == "World Bank Low Income")
            leftBars = ageSvg.select("#bars").selectAll(".leftBar")
                .data(leftData.slice(0,leftData.length-1))
                
            newLeftBars = leftBars.enter()
                .append("g")
                    .attr("transform",function(d,i){
                        return "translate(" + 
                        (ageWidth/2 - centreWidth/2 - dieScale(d.percent_dying)) + 
                        "," + ageScale(i) +")"
                    })
                .attr("class","leftBar")
            newLeftBars.append("rect")
                .attr("x",d => dieScale(d.percent_dying))
                .attr("height", ageScale.bandwidth())
                .transition(t)
                .attr("x",0)
                .attr("width", d => dieScale(d.percent_dying))
                .attr("fill", wbAreaColours["World Bank Low Income"])
                .attr("opacity","0.8")
            newLeftBars.append("text")
                .text(d => ((d.percent_dying)*100).toPrecision(2)+"%")
                .attr("class", function(d){
                    return ("barText"+d.ageCat)
                })
                .attr("y",20)
                .attr("x",-5)
                .attr("opacity",0)
                // .attr("fill", wbAreaColours["World Bank Low Income"])
                .attr("style", "fill:" + wbAreaColours["World Bank Low Income"] + ";font:18px sans-serif; text-anchor: end")
            
            leftBars.exit()
                .remove()
            
            //CENTRE LABELS
            centreLabels = ageSvg.select("#centreLabels").selectAll(".ageLabel")
                .data(leftData.slice(0,leftData.length-1))
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
                .curve(d3.curveMonotoneX)
            var leftLinePath = d3.line()
                .x(d => ageWidth/2 - centreWidth/2 - aliveScale(d[1]))
                .y(d => ageScale(d[0]))
                .curve(d3.curveMonotoneX)


            var rightLineData = rightData.map(function(d,i){
                    return [i, d.percent_alive]
                })
            var rightLine = ageSvg.select("#lines").selectAll(".rightLine")
                .data(rightLineData)
            var newRightLine = rightLine.enter()
                .append("path")
                    .attr("class","rightLine")
                    .attr("fill", "none")
                    .attr("stroke-width", "2px")
                    .attr("stroke", "black")
            newRightLine.merge(rightLine)
                .attr("d", rightLinePath(rightLineData))
            rightLine.exit().remove()
            var rightPointData = rightLineData[rightLineData.length - 1]
            var rightPoint = ageSvg.select("#lines").selectAll("#rightPoint")
                .data([rightPointData])
            rightPoint.enter()
                .append("circle")
                    .attr("r",4)
                    .attr("id","rightPoint")
                    .attr("fill","#000000")
            rightPoint.attr("cx", d => aliveScale(d[1]) + ageWidth/2 + centreWidth/2)
                .attr("cy",d=>ageScale(d[0]))
                

            var leftLineData = leftData.map(function(d,i){
                return [i, d.percent_alive]
            })
            var leftLine = ageSvg.select("#lines").selectAll(".leftLine")
                .data(leftLineData)

            var newLeftLine = leftLine.enter()
                .append("path")
                    .attr("class","leftLine")
                    .attr("fill", "none")
                    .attr("stroke-width", "2px")
                    .attr("stroke", "black")
            newLeftLine.merge(leftLine)
                .attr("d", leftLinePath(leftLineData))
            leftLine.exit().remove()
            
            var leftPointData = leftLineData[leftLineData.length - 1]
            var leftPoint = ageSvg.select("#lines").selectAll("#leftPoint")
                .data([leftLineData[leftLineData.length - 1]])
            leftPoint.enter()
                .append("circle")
                    .attr("r",4)
                    .attr("id","leftPoint")
                    .attr("fill","#000000")
            leftPoint.attr("cx", d => ageWidth/2 - centreWidth/2 - aliveScale(d[1]))
                .attr("cy",d=>ageScale(d[0]))

            //TEXT
            ageSvg.select("#rightText").selectAll(".ageAliveLabel")
                .attr("x", ageWidth)
                .attr("y",d=>ageScale(rightPointData[0]))
                .text(d => (rightPointData[1]*100).toPrecision(2)+"%")
            ageSvg.select("#rightText").selectAll(".ageLabelLabel")
                .attr("x", ageWidth)
                .attr("y",d=>ageScale(rightPointData[0])+12)
            ageSvg.select("#leftText").selectAll(".ageAliveLabel")
                .attr("x", 0)
                .attr("y",d=>ageScale(leftPointData[0]))
                .text(d => (leftPointData[1]*100).toPrecision(2)+"%")
            ageSvg.select("#leftText").selectAll(".ageLabelLabel")
                .attr("x", 0)
                .attr("y",d=>ageScale(leftPointData[0])+12)

            //BOXES FOR MOUSE OVER
            ageSvg.select("#mouseBoxes").selectAll(".mouseOverBox")
                .data(leftData)
                .enter()
                .append("rect")
                    .attr("class","mouseOverBox")
                    .attr("opacity",0)
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
            }
    })

}