/**
 * IMPORTANT NOTICE:
 * 
 * The data is provided by the data.js file.
 * Make sure the data.js file is loaded before the index.js file, so that you can access it here!
 * The data is provided in an array called: data
 * const data = [
    { id: 1001, state: "Alabama", county: "Autauga County", rate: 5.1 },
        ....
 ];**/

// Constants
const width = 700;
const height = 500;
const margin = { left: 50, right: 20, bottom: 50 };


// Defines the function preprocessData to filter and keep only valid data
function preprocessDataFilterOut(data) {
    // Filters data to include only entries with 'rate' values between 0 and 100 (inclusive)
    const filteredData = data.filter(d => d.rate >= 0 && d.rate <= 100);
    // Returns the filtered data
    return filteredData;
}

// Define the function to preprocess and clean data by replacing erroneous values with the state's mean rate
function preprocessDataCountyMean(data) {
    let stateAverages = {};

    // Use forEach to accumulate sums and counts for valid rates
    data.forEach(curr => {
        if (curr.rate >= 0 && curr.rate <= 100) {
            if (!stateAverages[curr.state]) {
                stateAverages[curr.state] = { sum: 0, count: 0 };
            }
            stateAverages[curr.state].sum += curr.rate;
            stateAverages[curr.state].count++;
        }
    });

    // Convert sums to averages
    Object.keys(stateAverages).forEach(state => {
        stateAverages[state] = stateAverages[state].sum / stateAverages[state].count;
    });
    // Map through the data to replace erroneous rates with the state's average rate
    return data.map(d => ({
        ...d,
        rate: (d.rate >= 0 && d.rate <= 100) ? d.rate : stateAverages[d.state] || null
    }));
}






// This code involves setting up the histogram visualization using the processed data.
function createHistogram(processedData, numbins) {

    // This subtask groups the data into a specified number of bins based on the unemployment rate.
    const bins = d3.bin()
        .value(d => d.rate)
        .thresholds(numbins)(processedData);

    // This scale maps unemployment rates to pixel values for the width of the histogram.
    const xScale = d3.scaleLinear()
        .domain(d3.extent(bins, d => d.x0)) // Using the bins' lower boundary for the domain
        .range([margin.left, width - margin.right])
        .nice();

    // This scale maps the count of entries in each bin to pixel values for the height of the bars.
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, b => b.length)])
        .range([height - margin.bottom, 0]);

    // This subtask manages the rectangles that represent the bars of the histogram.
    const svg = d3.select("#chart").attr("width", width).attr("height", height);
    const rects = svg.selectAll("rect").data(bins);

    // Rectangles are added or updated based on the data. This subtask also defines the bar dimensions.
    rects.enter().append("rect")
        .merge(rects)
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)) // ensure width is not negative
        .attr("height", d => height - margin.bottom - yScale(d.length));

    // This subtask adds horizontal and vertical axes to the chart, with appropriate labels and scaling.
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Removes any rectangles that are no longer needed.
    rects.exit().remove();
}

// Execute the preprocessing and create the histogram
const processedData = preprocessDataCountyMean(data);
createHistogram(processedData, 10);
