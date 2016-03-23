import React from 'react';
import { Navigation } from 'react-router';
import { Panel } from 'react-bootstrap';
import d3 from 'd3';
import _ from 'lodash';
import ReportNavigation from 'reports/components/ReportNavigation';
import Query from 'reports/utils/query';
import ChartMixin from 'reports/components/charts/ChartMixin';
import { widgetLink } from 'reports/utils/ReportHelper';

var createCrossCorr = function (dom, raw){//, transitionTo) {
    var self = this;
    var selectId = self.props.wquery.ref.replace(':', '');
    var key = self.state.args.mapping;
    var args = self.state.args;
    var data = raw.data;
    // If there are too many columns/rows we hush the text
    var labelCountCutoff = 25;

    var nameClass = data.nodes.length > labelCountCutoff ? 'hush' : 'normal';

    var margin = {
            top: 80,
            right: 0,
            bottom: 10,
            left: 80
        },
        width = 720,
        height = 720;

    var x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, 4]).clamp(true),
        c = d3.scale.category10().domain(d3.range(10));

    var svg = d3.select(dom).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var matrix = [],
        nodes = data.nodes,
        n = nodes.length;

    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) {
            return {
                x: j,
                y: i,
                z: 0
            };
        });
    });

    // Convert links to matrix; count character occurrences.
    data.links.forEach(function(link) {
        matrix[link.source][link.target].link = link;
        matrix[link.target][link.source].link = link;

        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;
        matrix[link.source][link.source].z += link.value;
        matrix[link.target][link.target].z += link.value;
        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });

    // Precompute the orders.
    var orders = {
        name: d3.range(n).sort(function(a, b) {
            return d3.ascending(nodes[a].name, nodes[b].name);
        }),
        count: d3.range(n).sort(function(a, b) {
            return nodes[b].count - nodes[a].count;
        }),
        group: d3.range(n).sort(function(a, b) {
            return nodes[b].group - nodes[a].group;
        })
    };

    // The default sort order.
    x.domain(orders.name);

    svg.append("rect")
        .attr("class", "crosscorr-background")
        .attr("width", width)
        .attr("height", height);

    var row = svg.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) {
            return "translate(0," + x(i) + ")";
        })
        .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", x.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .attr("class", nameClass)
        .text(function(d, i) {
            return key[data['grouper']][nodes[i].name];
        })
        .style("cursor", "pointer")
        .on("mouseover", rowMouseover)
        .on("mouseout", nameMouseout)
        .on("click", nameClick);

    var column = svg.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) {
            return "translate(" + x(i) + ")rotate(-90)";
        })
        .style("cursor", "pointer")
        .on("mouseover", colMouseover)
        .on("mouseout", nameMouseout)
        .on("click", nameClick);

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .attr("class", nameClass)
        .text(function(d, i) {
            return key[data['grouper']][nodes[i].name];
        });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) {
                return d.z;
            }))
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) {
                return x(d.x);
            })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) {
                return d.x != d.y ? z(Math.abs(d.z)) : 0;
            })
            .style("fill", function(d) {
                return d.z > 0 ? c(0) : c(3);
                // return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null;
            })
            .style("cursor", "pointer")
            .on("mouseover", cellMouseover)
            .on("mouseout", cellMouseout)
            .on("click", cellClick);
    }

    function cellMouseover(p) {
        d3.selectAll(".row text")
            .classed(nameClass, function(d, i) { return i != p.y; })
            .classed("active", function(d, i) { return i == p.y; });

        d3.selectAll(".column text")
            .classed(nameClass, function(d, i) { return i != p.x; })
            .classed("active", function(d, i) { return i == p.x; });
    }

    function cellMouseout() {
        d3.selectAll("text")
            .classed("active", false)
            .classed(nameClass, true);
    }

    function cellClick(d, e) {
        if (args.cell_linking_to) {
            var temp = {};
            temp[args.cell_link_value[0][0]] = data.nodes[d.y].name;
            var temp2 = {};
            temp2[args.cell_link_value[1][0]] = data.nodes[d.x].name;
            var foo = {};
            foo[args.cell_link_ref[0]] = temp;
            foo[args.cell_link_ref[1]] = temp2;
            widgetLink(args.cell_linking_to, foo)
        }
    }

    function colMouseover(p, q) {
        d3.selectAll(".column text")
            .classed(nameClass, function(d, i) { return i != q; })
            .classed("active", function(d, i) { return i == q; });
    }

    function rowMouseover(p, q) {
        d3.selectAll(".row text")
            .classed(nameClass, function(d, i) { return i != q; })
            .classed("active", function(d, i) { return i == q; });
    }

    function nameMouseout() {
        d3.selectAll("text")
            .classed(nameClass, true)
            .classed("active", false);
    }

    function nameClick(p, e) {
        var node = data.nodes[e];
        if (args.linking_to) {
            var temp = {};
            temp[args.link_value[0][0]] = node['name'];
            var foo = {};
            foo[args.link_ref[0]] = temp;
            widgetLink(args.linking_to, foo)
        }
    }

    d3.select("#" + selectId).on("change", function() {
        clearTimeout(timeout);
        order(this.value);
    });

    function order(value) {
        x.domain(orders[value]);

        var t = svg.transition().duration(2500);

        t.selectAll(".row")
            .delay(function(d, i) {
                return x(i) * 4;
            })
            .attr("transform", function(d, i) {
                return "translate(0," + x(i) + ")";
            })
            .selectAll(".cell")
            .delay(function(d) {
                return x(d.x) * 4;
            })
            .attr("x", function(d) {
                return x(d.x);
            });

        t.selectAll(".column")
            .delay(function(d, i) {
                return x(i) * 4;
            })
            .attr("transform", function(d, i) {
                return "translate(" + x(i) + ")rotate(-90)";
            });
    }

    var timeout = setTimeout(function() {
        order("group");
        d3.select("#" + selectId).property("selectedIndex", 2).node().focus();
    }, 1);
};

/**
 * Component for rendering a cross-correlation widget.
 * @component
 * @exports lib\Components\Charts\CrossCorr
 */
const CrossCorr = React.createClass({
    mixins: [ReportNavigation, _.omit(ChartMixin, 'getDefaulProps')],

    displayName: 'CrossCorr',
    _createChart: createCrossCorr,

    getDefaulProps: function() {
        return {
            query: undefined,
            hover: null,
            labels: null,
        };
    },

    customDiv: function (props) {
        return (
            <div className='crosscorr'>
                <p className='crosscorr'>
                    Order:{' '}
                    <select id={props.wquery.ref.replace(':', '')}>
                        <option value="name">by Name</option>
                        <option value="count">by Frequency</option>
                        <option selected="selected" value="group">by Cluster</option>
                    </select>
                </p>
            </div>
        )
    },

    truncate: function(state) { return state.data; },

    widgetQuery: function(query) {
        return new Query('jsutil.CrossCorr', {data: query});
    },

    mapping: function(query) {
        return new Query('jsutil.multi_mapping', {
            data: query
        });
    },
});

export default CrossCorr;
