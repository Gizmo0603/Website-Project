function getChartSize(divId, margin) {
  const el = document.getElementById(divId);
  const fullWidth = el.clientWidth || 600;
  const fullHeight = el.clientHeight || 400;

  return {
    fullWidth,
    fullHeight,
    width: fullWidth - margin.left - margin.right,
    height: fullHeight - margin.top - margin.bottom
  };
}

/* ================= Chart 1 ================= */

function drawChart1(divId, csvFile) {
  const margin = { top: 40, right: 20, bottom: 150, left: 80 };
  const size = getChartSize(divId, margin);

  const svg = d3.select(`#${divId}`)
    .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${size.fullWidth} ${size.fullHeight}`)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv(csvFile).then(data => {

    data.forEach(d => {
      d.FineAmount = +(d["Fine-Amount"] || "0").toString().replace(/,/g, "");
    });

    const result = d3.rollups(
      data,
      v => d3.sum(v, d => d.FineAmount),
      d => d.Country
    ).map(([Country, TotalFine]) => ({ Country, TotalFine }))
     .sort((a,b) => b.TotalFine - a.TotalFine);

    const x = d3.scaleBand()
      .domain(result.map(d => d.Country))
      .range([0, size.width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(result, d => d.TotalFine)]).nice()
      .range([size.height, 0]);

    svg.selectAll("rect")
      .data(result)
      .enter()
      .append("rect")
        .attr("x", d => x(d.Country))
        .attr("y", d => y(d.TotalFine))
        .attr("width", x.bandwidth())
        .attr("height", d => size.height - y(d.TotalFine))
        .attr("fill", "#69b3a2");

    svg.append("g")
      .attr("transform", `translate(0,${size.height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "rotate(-65)")
        .attr("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(",")));
  });

  // X axis label
svg.append("text")
  .attr("x", size.width / 2)
  .attr("y", size.height + margin.bottom - 40)
  .attr("text-anchor", "middle")
  .text("Country");

// Y axis label
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -size.height / 2)
  .attr("y", -margin.left - 10)   // move further left
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("font-weight", "bold")
  .text("Total Fine Amount (€)");

}

/* ================= Chart 2 ================= */

function drawChart2(divId, csvFile) {
  const margin = { top: 40, right: 20, bottom: 40, left: 140 };
  const size = getChartSize(divId, margin);

  const svg = d3.select(`#${divId}`)
    .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${size.fullWidth} ${size.fullHeight}`)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv(csvFile).then(data => {

    data.forEach(d => {
      d.FineAmount = +(d["Fine-Amount"] || "0").toString().replace(/,/g, "");
    });

    const result = d3.rollups(
      data,
      v => d3.sum(v, d => d.FineAmount),
      d => d.Country
    ).map(([Country, TotalFine]) => ({ Country, TotalFine }))
     .sort((a,b) => b.TotalFine - a.TotalFine);

    const y = d3.scaleBand()
      .domain(result.map(d => d.Country))
      .range([0, size.height])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(result, d => d.TotalFine)]).nice()
      .range([0, size.width]);

    svg.selectAll("rect")
      .data(result)
      .enter()
      .append("rect")
        .attr("y", d => y(d.Country))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.TotalFine))
        .attr("fill", "#69b3a2");

    svg.append("g")
      .call(d3.axisLeft(y));

svg.append("g")
  .attr("transform", `translate(0,${size.height})`)
  .call(d3.axisBottom(x).tickFormat(d3.format(",")))
  .selectAll("text")
    .style("font-size", "6px");   // ← adjust as needed
  });

  // X axis label
  svg.append("text")
    .attr("x", size.width / 2)
    .attr("y", size.height + margin.bottom - 5)
    .attr("text-anchor", "middle")
    .text("Total Fine Amount (€)");

  // Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -size.height / 2)
    .attr("y", -margin.left + 40)
    .attr("text-anchor", "middle")
    .text("Country");

}

/* ================= Chart 3 ================= */

function drawChart3(divId, csvFile) {
  const margin = { top: 40, right: 30, bottom: 60, left: 100 };
  const size = getChartSize(divId, margin);

  const svg = d3.select(`#${divId}`)
    .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${size.fullWidth} ${size.fullHeight}`)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const parseDate = d3.timeParse("%Y-%m-%d");

  d3.csv(csvFile).then(data => {

    data.forEach(d => {
      d.date = parseDate(d["Date-of-Decision"]);
      d.fine = +(d["Fine-Amount"] || "0").toString().replace(/[€,]/g,"");
    });

    data = data.filter(d => d.date && !isNaN(d.fine));

    const grouped = d3.rollups(
      data,
      v => d3.sum(v, d => d.fine),
      d => d3.timeDay(d.date)
    ).map(([date,total]) => ({date,total}))
     .sort((a,b)=>a.date-b.date);

    let run = 0;
    grouped.forEach(d => d.cumulative = run += d.total);

    const x = d3.scaleTime()
      .domain(d3.extent(grouped, d => d.date))
      .range([0, size.width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d.cumulative)]).nice()
      .range([size.height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${size.height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(",")));

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.cumulative));

    svg.append("path")
      .datum(grouped)
      .attr("fill","none")
      .attr("stroke","#3366cc")
      .attr("stroke-width",2)
      .attr("d", line);
  });

  // X axis label
svg.append("text")
  .attr("x", size.width / 2)
  .attr("y", size.height + margin.bottom - 10)
  .attr("text-anchor", "middle")
  .text("Decision Date");

// Y axis label
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -size.height / 2)
  .attr("y", -margin.left - 10)
  .attr("text-anchor", "middle")
  .text("Cumulative Fine Amount (€)");
}
