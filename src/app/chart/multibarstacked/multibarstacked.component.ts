import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from "@angular/core";
import { COLORS } from "../../../constants";

declare let d3: any;

@Component({
  selector: 'app-multibarstacked',
  templateUrl: './multibarstacked.component.html',
  styleUrls: ['./multibarstacked.component.css']
})
export class MultibarstackedComponent implements OnInit {
  @Input() private data: any = {};
  @Input() private xAxisName?: String;
  @Input() private yAxisName?: String;
  @Input() private element: any;
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
    if (Object.keys(this.data).length > 0) {
      this.createChart();
    }
  }

  createChart() {
    const data = this.data.data;
    this.element = Array.prototype.slice.call(this.element)[0];
    const element: any = this.element;

    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    const xAxisName = this.xAxisName || "X-Axis";
    const yAxisName = this.yAxisName || "Y-Axis";

    let margin = this.margin,
      width = this.width,
      height = this.height;
    let svg = d3.select(element).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom),
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x0 = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05);

    let x1 = d3.scaleBand()
      .padding(0.05);

    let y = d3.scaleLinear()
      .rangeRound([height, 0]);

    let z = d3.scaleOrdinal()
      .range(COLORS);

    // Nest stock values by symbol.

    var dataByYear = d3.nest()
      .key(d => d.name)
      .key(d => d.type)
      .rollup(v => {
        return d3.sum(v, d => d.value);
      })
      .entries(data);

    dataByYear.forEach(y => {

      y.name = y.key;
      delete y.key;

      y.values.forEach(d => {
        d.type = d.key;
        d.sum_value = +d.value;
        delete d.key;
        delete d.value;
      });

      y.values.sort((a, b) => {
        return b.sum_value - a.sum_value;
      });

    });

    let symbolList = dataByYear[0].values.map(d => d.type);
    let yearList = dataByYear.map(d => d.name);

    x0.domain(yearList);
    x1.domain(symbolList).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(dataByYear, d => d3.max(d.values, el => el.sum_value))]).nice();
    z.domain(symbolList);

    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let year = g.append("g")
      .selectAll("g")
      .data(dataByYear)
      .enter().append("g")
      .attr("transform", d => "translate(" + x0(d.name) + ",0)");

    let rect = year.selectAll("rect")
      .data(d => d.values)
      .enter().append("rect")
      .attr("y", height)
      .attr("width", x0.bandwidth())
      .attr("height", 0);

    let drawGroupedBars = () => {
      rect.attr("x", d => x1(d.type))
        .attr("y", d => y(d.sum_value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.sum_value))
        .attr("fill", d => z(d.type))
        .on("mouseover", function (d) {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html((`<strong>${yAxisName}:</strong> ${d.type}`) + "<br/>" + `<strong>${xAxisName}:</strong> ${d.sum_value}`)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mousemove", function (d) {
          div.transition()
            .duration(100)
            .style("opacity", .9);
          div.html((`<strong>${yAxisName}:</strong> ${d.type}`) + "<br/>" + `<strong>${xAxisName}:</strong> ${d.sum_value}`)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        })
        .transition()
        .duration(500)
        .delay((d, i) => i * 10);
    };

    let drawAxis = () => {
      g.append("g")
        .attr("class", "axis")
        .style("font", "12px times")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

      g.append("g")
        .attr("class", "axis")
        .style("font", "12px times")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("x", 1)
        .attr("y", y(y.ticks().pop()) + 0)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Count");
    };

    let drawLegend = (data) => {
      let legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", (d, i) => "translate(20, " + i * 20 + ")");

      legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);
    };

    drawGroupedBars();
    drawAxis();
    drawLegend(symbolList);

    d3.selectAll("input").on("change", change);

    let timeout = setTimeout(() => {
      d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
    }, 2000);

    function change() {
      clearTimeout(timeout);
      if (this.value === "grouped") transitionGrouped();
      else transitionStacked();
    }

    function transitionGrouped() {

      rect.transition()
        .duration(500)
        .delay((d, i) => i * 10)
        .attr("x", d => x1(d.type))
        .attr("width", x1.bandwidth())
        .transition()
        .attr("y", d => y(d.sum_value))
        .attr("height", d => height - y(d.sum_value));
    }

    function transitionStacked() {

      rect.transition()
        .duration(500)
        .delay((d, i) => i * 10)
        .attr("y", d => y(d.sum_value))
        .attr("height", d => height - y(d.sum_value))
        .transition()
        .attr("x", d => x0(d.type))
        .attr("width", x0.bandwidth());
    }
  }

}
