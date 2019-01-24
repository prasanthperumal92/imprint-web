import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from "@angular/core";
import { COLORS } from "../../../constants";

declare let d3: any;

@Component({
  selector: "app-barchart",
  templateUrl: "./barchart.component.html",
  styleUrls: ["./barchart.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class BarchartComponent implements OnInit, OnChanges {
  @ViewChild("chart") private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  @Input() private xAxisName?: String = undefined;
  @Input() private yAxisName?: String = undefined;
  private margin: any = { top: 20, bottom: 40, left: 60, right: 20 };
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;

  constructor() { }

  ngOnInit() {
    this.createChart();
    if (this.data) {
      // this.updateChart();
    }
  }

  ngOnChanges() {
    /*if (this.chart) {
      this.updateChart();
    }*/
  }

  createChart() {
    // set the dimensions and margins of the graph
    let data = this.data;
    let xAxisName = this.xAxisName || "X-Axis";
    let yAxisName = this.yAxisName || "Y-Axis";
    const element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

    // set the ranges
    let y = d3.scaleBand()
      .range([this.height, 0])
      .padding(0.1);

    let x = d3.scaleLinear()
      .range([0, this.width]);

    // append the svg object to the body of the page
    // append a "group" element to "svg"
    // moves the "group" element to the top left margin
    let svg = d3.select("#chart").append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")");

    // format the data
    data.forEach(function (d) {
      d.value = +d.value;
    });

    // Define the div for the tooltip
    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // bar colors
    let colors = d3.scaleLinear().domain([0, data.length]).range(<any[]>COLORS);

    // Scale the range of the data in the domains
    x.domain([0, d3.max(data, function (d) { return d.value; })]);
    y.domain(data.map(function (d) { return d.key; }));
    colors.domain([0, data.length]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      // .attr("x", function(d) { return x(d.value); })
      .attr("width", function (d) { return x(d.value); })
      .attr("y", function (d) { return y(d.key); })
      .attr("height", y.bandwidth())
      .style("fill", (d, i) => colors(i))
      .on("mouseover", function (d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html((`<strong>${yAxisName}:</strong> ${d.key}`) + "<br/>" + `<strong>${xAxisName}:</strong> ${d.value}`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mousemove", function (d) {
        div.transition()
          .duration(100)
          .style("opacity", .9);
        div.html((`<strong>${yAxisName}:</strong> ${d.key}`) + "<br/>" + `<strong>${xAxisName}:</strong> ${d.value}`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // add the x Axis
    svg.append("g")
      .style("font", "12px times")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x));

    if (this.xAxisName) {
      svg.append("text")
        .attr("transform",
          "translate(" + (this.width / 2) + " ," +
          (this.height + this.margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text(this.xAxisName);
    }

    // add the y Axis
    svg.append("g")
      .style("font", "12px times")
      .call(d3.axisLeft(y));

    if (this.yAxisName) {
      // text label for the y axis
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - this.margin.left)
        .attr("x", 0 - (this.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(this.yAxisName);
    }
  }
}
