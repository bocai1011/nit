import React from 'react';
import d3 from 'd3';
import ReportNavigation from 'reports/components/ReportNavigation';

var createBrushPlot = function (dom, dict) {
    var margin = {
            size: 150,
            padding: 19.5
        },
        width = 720,
        height = 720;

    var x = d3.scale.linear()
        .range([margin.padding / 2, margin.size - margin.padding / 2]);

    var y = d3.scale.linear()
        .range([margin.size - margin.padding / 2, margin.padding / 2]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);

    var color = d3.scale.category10();

    var domainByAtrb = {},
        columns = dict.data[0].columns,
        n = columns.length;

      console.log(columns);
    columns.map(function(col, i) {
        domainByAtrb[col] = d3.extent(dict.data, function(d) { return d[i]; });

      console.log(domainByAtrb);
      xAxis.tickSize(margin.size * n);
      yAxis.tickSize(-margin.size * n);

      var brush = d3.svg.brush()
          .x(x)
          .y(y)
          .on("brushstart", brushstart)
          .on("brush", brushmove)
          .on("brushend", brushend);

      var svg = d3.select("body").append("svg")
          .attr("width", margin.size * n + margin.padding)
          .attr("height", margin.size * n + margin.padding)
        .append("g")
          .attr("transform", "translate(" + margin.padding + "," + margin.padding / 2 + ")");

      svg.selectAll(".x.axis")
          .data(columns)
        .enter().append("g")
          .attr("class", "x axis")
          .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * margin.size + ",0)"; })
          .each(function(d) { x.domain(domainByAtrb[d]); d3.select(this).call(xAxis); });

      svg.selectAll(".y.axis")
          .data(columns)
        .enter().append("g")
          .attr("class", "y axis")
          .attr("transform", function(d, i) { return "translate(0," + i * margin.size + ")"; })
          .each(function(d) { y.domain(domainByAtrb[d]); d3.select(this).call(yAxis); });

      var cell = svg.selectAll(".cell")
          .data(cross(columns, columns))
        .enter().append("g")
          .attr("class", "cell")
          .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * margin.size + "," + d.j * margin.size + ")"; })
          .each(plot);

      // Titles for the diagonal.
      cell.filter(function(d) { return d.i === d.j; }).append("text")
          .attr("x", margin.padding)
          .attr("y", margin.padding)
          .attr("dy", ".71em")
          .text(function(d) { return d.x; });

      cell.call(brush);

      function plot(p) {
        var cell = d3.select(this);

        x.domain(domainByAtrb[p.x]);
        y.domain(domainByAtrb[p.y]);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", margin.padding / 2)
            .attr("y", margin.padding / 2)
            .attr("width", margin.size - margin.padding)
            .attr("height", margin.size - margin.padding);

        cell.selectAll("circle")
            .data(data)
          .enter().append("circle")
            .attr("cx", function(d) { return x(d[p.x]); })
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 3)
            .style("fill", function(d) { return color(d.group); });
      }

      var brushCell;

      // Clear the previously-active brush, if any.
      function brushstart(p) {
        if (brushCell !== this) {
          d3.select(brushCell).call(brush.clear());
          x.domain(domainByAtrb[p.x]);
          y.domain(domainByAtrb[p.y]);
          brushCell = this;
        }
      }

      // Highlight the selected circles.
      function brushmove(p) {
        var e = brush.extent();
        svg.selectAll("circle").classed("hidden", function(d) {
          return e[0][0] > d[p.x] || d[p.x] > e[1][0]
              || e[0][1] > d[p.y] || d[p.y] > e[1][1];
        });
      }

      // If the brush is empty, select all circles.
      function brushend() {
        if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
      }

      function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
      }

      d3.select(self.frameElement).style("height", margin.size * n + margin.padding + 20 + "px");
    });
};

export default React.createClass({
    mixins: [ReportNavigation],
    displayName: 'BrushPlot',

    render: function() {
        return (
            <div className='brushplot'>
            </div>
        );
        return <div />;
    },


    componentDidMount: function() {
        var dom = this.getDOMNode();
        createBrushPlot(dom, this.props.data);
    },

    shouldComponentUpdate: function() {
        var dom = this.getDOMNode();
        createBrushPlot(dom, this.props.data);
    }

});
