import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from "@angular/core";
import { COLORS } from "../../../constants";

declare let d3: any;

@Component({
  selector: 'app-multibarstacked',
  templateUrl: './multibarstacked.component.html',
  styleUrls: ['./multibarstacked.component.css']
})
export class MultibarstackedComponent implements OnInit {
  @ViewChild("multibarchart") private chartContainer: ElementRef;
  @Input() private data: any = {};
  @Input() private xAxisName?: String;
  @Input() private yAxisName?: String;
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
    const element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    const xAxisName = this.xAxisName || "X-Axis";
    const yAxisName = this.yAxisName || "Y-Axis";

    let svg = d3.select("#multibarchart").append("svg"),
      margin = this.margin,
      width = this.width,
      height = this.height,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x0 = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05);

    let x1 = d3.scaleBand()
      .padding(0.05);

    let y = d3.scaleLinear()
      .rangeRound([height, 0]);

    let z = d3.scaleOrdinal()
      .range(["#98abc5", "#a05d56", "#d0743c", "#ff8c00"]);

    // Nest stock values by symbol.
    // let dataByYear = [{ "values": [{ "symbol": "IBM", "sum_price": 1162.97 }, { "symbol": "AMZN", "sum_price": 527.17 }, { "symbol": "MSFT", "sum_price": 356.07999999999987 }, { "symbol": "AAPL", "sum_price": 260.98 }], "year": "2000" }, { "values": [{ "symbol": "IBM", "sum_price": 1163.6200000000001 }, { "symbol": "MSFT", "sum_price": 304.17 }, { "symbol": "AMZN", "sum_price": 140.87 }, { "symbol": "AAPL", "sum_price": 122.11000000000003 }], "year": "2001" }, { "values": [{ "symbol": "IBM", "sum_price": 901.4999999999999 }, { "symbol": "MSFT", "sum_price": 261.92 }, { "symbol": "AMZN", "sum_price": 200.68 }, { "symbol": "AAPL", "sum_price": 112.89999999999998 }], "year": "2002" }, { "values": [{ "symbol": "IBM", "sum_price": 927.69 }, { "symbol": "AMZN", "sum_price": 468.20000000000005 }, { "symbol": "MSFT", "sum_price": 251.21 }, { "symbol": "AAPL", "sum_price": 112.16999999999999 }], "year": "2003" }, { "values": [{ "symbol": "IBM", "sum_price": 1006.6299999999999 }, { "symbol": "AMZN", "sum_price": 519.21 }, { "symbol": "MSFT", "sum_price": 272.09 }, { "symbol": "AAPL", "sum_price": 224.68 }], "year": "2004" }, { "values": [{ "symbol": "IBM", "sum_price": 929.97 }, { "symbol": "AAPL", "sum_price": 578.0600000000001 }, { "symbol": "AMZN", "sum_price": 482.25 }, { "symbol": "MSFT", "sum_price": 286.15000000000003 }], "year": "2005" }, { "values": [{ "symbol": "IBM", "sum_price": 944.6100000000002 }, { "symbol": "AAPL", "sum_price": 864.52 }, { "symbol": "AMZN", "sum_price": 435.02000000000004 }, { "symbol": "MSFT", "sum_price": 297.1 }], "year": "2006" }, { "values": [{ "symbol": "AAPL", "sum_price": 1600.24 }, { "symbol": "IBM", "sum_price": 1215.3200000000002 }, { "symbol": "AMZN", "sum_price": 839.43 }, { "symbol": "MSFT", "sum_price": 351.40999999999997 }], "year": "2007" }, { "values": [{ "symbol": "AAPL", "sum_price": 1661.77 }, { "symbol": "IBM", "sum_price": 1286.7000000000003 }, { "symbol": "AMZN", "sum_price": 828.1800000000001 }, { "symbol": "MSFT", "sum_price": 302.50000000000006 }], "year": "2008" }, { "values": [{ "symbol": "AAPL", "sum_price": 1804.7200000000003 }, { "symbol": "IBM", "sum_price": 1311.56 }, { "symbol": "AMZN", "sum_price": 1088.7700000000002 }, { "symbol": "MSFT", "sum_price": 274.47 }], "year": "2009" }, { "values": [{ "symbol": "AAPL", "sum_price": 619.7 }, { "symbol": "IBM", "sum_price": 374.56 }, { "symbol": "AMZN", "sum_price": 372.63 }, { "symbol": "MSFT", "sum_price": 85.52 }], "year": "2010" }]

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
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

      g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Price");
    };

    let drawLegend = (data) => {
      let legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
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
