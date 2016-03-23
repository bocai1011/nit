import _ from 'lodash';
import React from 'react';
import cloneWithProps from 'react/lib/cloneWithProps';
import { Link } from 'react-router';
import { Table } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import Query from 'reports/utils/query';
import Transform from 'reports/utils/transform';
import q from 'common/utils/queryFactory';
import ChartMixin from 'reports/components/charts/ChartMixin';

export default React.createClass({
    displayName: 'WidgetList',
    mixins: [_.omit(ChartMixin, ["getInitialState", "createChart"])],

    mapping: function(query, column) {
        return new Query('jsutil.mapping', {
            data: query.ix([column], [], true),
            column: column
        });
    },

    getInitialState: function (props) {
        var self = this;
        var how = [];
        var field = [];
        var names = [];

        if (_.isString(self.props.grouper)) {
            self.props.grouper = q.jsutil.pass_value({value: self.props.grouper});
        }

        self.props.children.forEach( function(child, i) {
            if (child.props.query != undefined) {
                self.props['child' + i] = child.props.query;
            } else if (child.type.displayName == "Timeseries") {
                self.props['child' + i] = q.jsutil.Timeseries({
                    data: q.core.get_groupby_and_reduce({
                        data: self.props.query,
                        grouper: self.props.grouper.prepend(['date']),
                        how: [child.props.how],
                        field: [child.props.field]
                    })
                });
            } else if (child.type.displayName == "Histogram") {
                self.props['child' + i] = q.jsutil.Histogram({
                    data: self.props.query,
                    field: child.props.field,
                    grouper: self.props.grouper,
                    log: child.props.log,
                });
            } else if (child.type.displayName == "Link") {
                // Need to deal with this still
            } else {
                how.push(child.props.how);
                field.push(child.props.field);
                names.push('col' + i);
            }

            _.forOwn(child.props, function(value, key) {
                self.props['child' + i + '|' + key] = value;
            });
        });

        if ((how.length == field.length) && (how.length > 0)) {
            self.props.wquery = q.jsutil.WidgetList({
                grouper: self.props.grouper,
                data: self.props.query,
                field: field,
                how: how,
                names: names
            });
        }

        self.props.rows = q.jsutil.unique_items({
            data: self.props.query,
            col: self.props.grouper.i(0)
        });

        self.props.mapping = self.page ? self.page.mappings : q.jsutil.mappings({});

        self.transform = new Transform(self.props);
        self.transform.subscribe(self);
        self.transform.useData().then((results) => {
            var data = results.data;
            var errs = results.errs;

            if (errs.wquery) {
                self.setState({loading: false, error: true, args: data, errorMsg: errs.wquery, errs: errs}, function() {});
            } else {
                self.setState({loading: false, args: data, errs: errs}, function() {});
            }
        });
        return {
            loading: true,
            data: [],
            view_limit: 10,
            view_offset: 0,
        };
    },

    customDiv: function (props) {
        var self = this;

        // Warning! There is no checks here about queries erroring or whether data is of the right type.
        var rows = _.slice(self.state.args.rows.pandas.values, self.state.view_offset, self.state.view_offset + self.state.view_limit).map(function (row, r) {
            // Maybe we need to do something with a mapping here
            var columns = self.props.children.map(function(child, i) {
                var temp = cloneWithProps(child, {
                    title: 'col',
                    spoof: true,
                    frameLess: true,
                    sparkline: true,
                    rowID: r,
                    mapping: self.state.args.mapping,
                    row: row,
                    key: 'key' + i + r,
                    spoofargs: {},
                    spooferrs: {},
                    page: self.props.page
                });
                _.forOwn(temp.props, function(value, key) {
                    temp.props.spoofargs[key] = self.state.args['child' + i + '|' + key];
                    temp.props.spooferrs[key] = self.state.errs['child' + i + '|' + key];
                });
                // This is if a column had it's own query
                if (_.has(self, 'props.child' + i)) {
                    temp.props.spoofdata = self.state.args['child' + i];
                    return (
                        <th>
                            {temp}
                        </th>
                    );
                } else { // This is if a column was a normal field/how
                    temp.props.spoofdata = self.state.args.wquery.pandas.values[r]['col' + i];
                    return (
                        <th>
                            {temp}
                        </th>
                    );
                }
            });

            return (
                <tr>
                    {columns}
                </tr>
            );
        });

        var header = self.props.children.map(function (child, i) {
            if (_.has(child, 'props.name')) {
                return <th key={i}>{child.props.name}</th>;
            } else if (_.has(self, 'state.args.child' + i + '|title')) {
                return <th key={i}>{self.state.args['child' + i + '|title']}</th>;
            } else if (_.has(child, 'props.field') && _.has(child, 'props.hold')) {
                return <th key={i}>{child.how + child.field}</th>;
            }
        });

        return (
            <Table>
                <thead>
                    <tr>
                        {header}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        );
    }

});
