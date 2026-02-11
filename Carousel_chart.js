// carousel_charts.js

function drawChart1(divId, csvFile) {
  const margin = { top: 40, right: 20, bottom: 150, left: 80 };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select(`#${divId}`)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv(csvFile).then(data => {
    data.forEach(d => {
      let value = (d["Fine-Amount"] || "0").toString().replace(/,/g, "");
      d.FineAmount = +value;
    });

    const grouped = d3.rollups(
      data,
      v => d3.sum(v, d => d.FineAmount),
      d => d.Country
    );
    const result = grouped.map(([Country, TotalFine]) => ({ Country, TotalFine }));
    result.sort((a,b) => b.TotalFine - a.TotalFine);

    const x = d3.scaleBand()
      .domain(result.map(d => d.Country))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(result, d => d.TotalFine)]).nice()
      .range([height, 0]);

    svg.selectAll(".bar")
      .data(result)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Country))
        .attr("y", d => y(d.TotalFine))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.TotalFine))
        .attr("fill", "#69b3a2");

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "rotate(-65)")
        .attr("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format(",")));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 120)
      .attr("text-anchor", "middle")
      .text("Country");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .text("Total Fines (€)");
  });
}

// --------- Chart 2 (Horizontal Bars) ---------
function drawChart2(divId, csvFile) {
  const margin = { top: 40, right: 20, bottom: 150, left: 80 };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select(`#${divId}`)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv(csvFile).then(data => {
    // Clean Fine-Amount field
    data.forEach(d => {
      let value = (d["Fine-Amount"] || "0").toString().replace(/,/g, "");
      d.FineAmount = +value;
    });

    // Group by country and sum fines
    const grouped = d3.rollups(
      data,
      v => d3.sum(v, d => d.FineAmount),
      d => d.Country
    );

    const result = grouped.map(([Country, TotalFine]) => ({ Country, TotalFine }));
    result.sort((a, b) => b.TotalFine - a.TotalFine);

    // Scales
    const y = d3.scaleBand()
      .domain(result.map(d => d.Country))
      .range([0, height])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(result, d => d.TotalFine)]).nice()
      .range([0, width]);

    // Bars
    svg.selectAll(".bar")
      .data(result)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.Country))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.TotalFine))
        .attr("fill", "#69b3a2");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format(",")));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 55)
      .attr("text-anchor", "middle")
      .text("Total Fines (€)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .text("Country");
  });
}

function drawChart3(divId, csvFile) {
  const margin = { top: 40, right: 40, bottom: 80, left: 100 };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select(`#${divId}`)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const parseDate = d3.timeParse("%Y-%m-%d"); 
  // change format if your CSV date format differs

  d3.csv(csvFile).then(data => {

    // clean fields we need only
    data.forEach(d => {
      d.date = parseDate(d["Date-of-Decision"]);
      let value = (d["Fine-Amount"] || "0").toString().replace(/[€,]/g, "");
      d.fine = +value;
    });

    data = data.filter(d => d.date && !isNaN(d.fine));

    // group by day + sum
    const grouped = d3.rollups(
      data,
      v => d3.sum(v, d => d.fine),
      d => d3.timeDay(d.date)
    ).map(([date, total]) => ({ date, total }))
     .sort((a,b) => a.date - b.date);

    // cumulative sum
    let running = 0;
    grouped.forEach(d => {
      running += d.total;
      d.cumulative = running;
    });

    // scales
    const x = d3.scaleTime()
      .domain(d3.extent(grouped, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d.cumulative)]).nice()
      .range([height, 0]);

    // axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(",")));

    // line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.cumulative));

    // draw line
    svg.append("path")
      .datum(grouped)
      .attr("fill", "none")
      .attr("stroke", "#3366cc")
      .attr("stroke-width", 2)
      .attr("d", line);

    // draw dots
    svg.selectAll("circle")
      .data(grouped)
      .enter()
      .append("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.cumulative))
        .attr("r", 4)
        .attr("fill", "#3366cc");

    // labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 55)
      .attr("text-anchor", "middle")
      .text("Decision Date");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -70)
      .attr("text-anchor", "middle")
      .text("Cumulative Fines (€)");
  });
}

