import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation, Inject } from "@angular/core";
import { COLORS } from "../../../constants";
import { DOCUMENT } from "@angular/common";

declare let d3: any;

@Component({
  selector: "app-piechart",
  templateUrl: "./piechart.component.html",
  styleUrls: ["./piechart.component.css"]
})
export class PiechartComponent implements OnInit {
  @Input() private data: Array<any>;
  @Input() private xAxisName?: String;
  @Input() private yAxisName?: String;
  @Input() private element: any;
  private margin: any = { top: 20, bottom: 40, left: 60, right: 20 };
  private chart: any;

  constructor(@Inject(DOCUMENT) document) { }

  ngOnInit() {
    const self = this;
    if (this.data && this.data.length > 0) {
      setTimeout(() => {
        self.createChart();
      });
    }
  }

  createChart() {
    let isEmpty = false;
    const element: any = this.element;
    // const element = chartContainer.nativeElement;
    let width = element.offsetWidth - this.margin.left - this.margin.right;
    let height = element.offsetHeight - this.margin.top - this.margin.bottom;
    let xAxisName = this.xAxisName || "X-Axis";
    let yAxisName = this.yAxisName || "Y-Axis";
    let data = this.data || [];
    let lineData = [];  // To remove the no data text label and polylines

    if (data.length > 0 && data[0].value === 0 && data[1].value === 0 && data[2].value === 0) {
      isEmpty = true;
      data[0].value = 1;
      data[1].value = 1;
      data[2].value = 1;
    }
    for (let i = 0; i < data.length; i++) {
      if (data[i].value !== 0) {
        lineData.push(data[i]);
      }
    }

    let svg = d3.select(element)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("g")
      .attr("class", "slices");
    svg.append("g")
      .attr("class", "labels");
    svg.append("g")
      .attr("class", "lines");

    let radius = Math.min(width, height) / 2;

    let pie = d3.pie()
      .sort(null)
      .value(function (d) {
        return d.value;
      });

    let arc = d3.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    let outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Define the div for the tooltip
    let div = d3.select("body").append("div")
      .attr("class", "tooltipBox")
      .style("opacity", 0);

    let key = function (d) { return d.data.key; };

    let colors = d3.scaleOrdinal()
      .range(COLORS);

    /* ------- PIE SLICES -------*/
    svg.select(".slices").selectAll("path.slice")
      .data(pie(data), key)
      .enter()
      .insert("path")
      .style("fill", (d, i) => colors(i))
      .attr("class", "slice")
      .on("mouseover", function (d) {
        let v;
        isEmpty ? v = 0 : v = d.data.value;
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html((`<strong>${yAxisName}:</strong> ${d.data.key}`) + "<br/>" + `<strong>${xAxisName}:</strong> ${v}`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mousemove", function (d) {
        let v;
        isEmpty ? v = 0 : v = d.data.value;
        div.transition()
          .duration(100)
          .style("opacity", .9);
        div.html((`<strong>${yAxisName}:</strong> ${d.data.key}`) + "<br/>" + `<strong>${xAxisName}:</strong> ${v}`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .transition().duration(1000)
      .attrTween("d", function (d) {
        console.log(d);
        this._current = this._current || d;
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          return arc(interpolate(t));
        };
      });
    /* ------- TEXT LABELS -------*/

    svg.select(".labels").selectAll("text")
      .data(pie(lineData), key)
      .enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function (d) {
        let v;
        isEmpty ? v = 0 : v = d.data.value;
        return `${d.data.key}: ${v}`;
      })
      .transition().duration(1000)
      .attrTween("transform", function (d) {
        this._current = this._current || d;
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          let d2 = interpolate(t);
          let pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate(" + pos + ")";
        };
      })
      .styleTween("text-anchor", function (d) {
        this._current = this._current || d;
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          let d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start" : "end";
        };
      });

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    /* ------- SLICE TO TEXT POLYLINES -------*/

    svg.select(".lines")
      .selectAll("polyline")
      .data(pie(lineData), key)
      .enter()
      .append("polyline")
      .style("opacity", ".3")
      .style("stroke", "black")
      .style("stroke - width", "2px")
      .style("fill", "none")
      .transition().duration(1000)
      .attrTween("points", function (d) {
        this._current = this._current || d;
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          let d2 = interpolate(t);
          let pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };
      });
  }

}
