function drawCountryBarChart(csvFile, divId) {

  console.log("Function started");
  const width = 500;
  const height = 350;
  const margin = { top: 30, right: 20, bottom: 50, left: 60 };

  d3.csv(csvFile).then(data => {

    // ---- COUNT ----
    let spain = 0;
    let ireland = 0;

    data.forEach(row => {
      const c = row.Country.trim().toUpperCase();
      if (c === "SPAIN") spain++;
      if (c === "IRELAND") ireland++;
    });

    const dataset = [
      { country: "Spain", count: spain },
      { country: "Ireland", count: ireland }
    ];

    // ---- SVG ----
    const svg = d3.select("#" + divId)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // ---- SCALES ----
    const x = d3.scaleBand()
      .domain(dataset.map(d => d.country))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // ---- AXES ----
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // ---- BARS ----
    svg.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("x", d => x(d.country))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.count));

    // ---- VALUE LABELS ----
    svg.selectAll("text.bar")
      .data(dataset)
      .enter()
      .append("text")
      .attr("class", "bar")
      .attr("x", d => x(d.country) + x.bandwidth() / 2)
      .attr("y", d => y(d.count) - 5)
      .attr("text-anchor", "middle")
      .text(d => d.count);

  });

}
