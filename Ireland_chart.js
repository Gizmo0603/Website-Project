// ireland_pie_chart.js

function drawIrelandPieChart(csvFile, divId) {
    const width = 450,
          height = 450,
          margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(`#${divId}`)
      .append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    const tooltip = d3.select("body")
      .append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("padding", "6px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    d3.csv(csvFile).then(function(data) {
        let aggregated = {};

        data.forEach(d => {
            const text = d["Quoted-Art"];
            if (!text) return;

            const cleanText = text.replace(/"/g,'').trim();
            const matches = cleanText.match(/Art\. \d+/gi);

            if(matches && matches.length > 0){
                const uniqueArticles = Array.from(new Set(matches));
                uniqueArticles.forEach(art => {
                    aggregated[art] = (aggregated[art] || 0) + 1;
                });
            }
        });

        const pie = d3.pie().value(d => d[1]);
        const data_ready = pie(Object.entries(aggregated));

        const color = d3.scaleOrdinal()
          .domain(Object.keys(aggregated))
          .range(d3.schemeSet2);

        const arcGenerator = d3.arc()
          .innerRadius(0)
          .outerRadius(radius);

        svg.selectAll('slices')
          .data(data_ready)
          .join('path')
            .attr('d', arcGenerator)
            .attr('fill', d => color(d.data[0]))
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`${d.data[0]}: ${d.data[1]}`)
                       .style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 25) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 25) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(200).style("opacity", 0);
            });
    });
}