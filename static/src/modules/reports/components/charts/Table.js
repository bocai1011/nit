import React from 'react';
import $ from 'jquery';
import util from 'common/utils/util';
import QGrid from 'qgridjs';
import _ from 'lodash';
import numeral from 'numeral';
import Query from 'reports/utils/query';
import ChartMixin from 'reports/components/charts/ChartMixin';
import q from 'common/utils/queryFactory';

var formatters = {
    'Float': function (row, cell, value, columnDef, dataContext) {
        if (_.isNumber(value)) {
            if (Math.abs(value) > 0.01) {
                return numeral(value).format('0,0.00');
            } else if (Math.abs(value) < 0.00000000001) {
                return '0.00';
            } else {
                return value;
            }
        } else {
            return value
        }
    },

    'Integer': function (row, cell, value, columnDef, dataContext) {
        return numeral(value).format('0,0');
    },
};

var defaultCssClasses = {
    'Float': 'right-align',
    'Integer': 'right-align'
};

var formatHeaderInfo = function (total, shown) {
    return (
        <span>
            Displaying <b>{ shown }</b> of <b>{ total }</b> records.
        </span>
    );
};

/**
 * Adds a unique `id` property to an array of grid row objects. SlickGrid
 * appears to have some sort of caching mechanism whereby it will not
 * refresh its rows if the new incoming rows have identical `id` properties
 * to existing rows in the grid. QGrid initializes the SlickGrid's rows
 * with `id`s [ 'row0', 'row1', 'row2', ... ].
 *
 * This method ensures that the incoming rows
 * will have unique `id`s, so that SlickGrid will refresh the grid.
 *
 * @arg {array} rows - The array of grid row objects.
 *
 * @return {array} - The row objects with unique `id` properties.
 */
var uniqifyRows = function (rows) {

    // Generate random bases for each row's `id` property. Each will
    // have the format <Random 8-Character Hex String><Index>.
    let seed = Math.floor((1 + Math.random()) * 0x10000000).toString(16);
    rows.forEach((row, i) => {
        row.id = seed + i;
    });

    return rows;
}

let rowCountCB;

/**
 * Function used by QGrid Filter objects to retrieve bounds for their data
 * from the server.
 * @arg {string} field - The column/field name for which to get bounds.
 * @arg {string} filterType - The type of filter: TextFilter, SliderFilter,
 *                            DateFilter. Used to determine what kind of
 *                            bounds to retrieve.
 * @arg {function} callback - Function to call, passing the gotten bounds.
 */
var getColumnBounds = function (field, filterType, callback) {

    let boundsQuery = new Query('jsutil.table_bounds', {
        data: this.props.query,
        col: field,
        coltype: filterType == 'TextFilter' ? 'enumeration' : 'numeric',
    });

    let oidMap = this.mapping[field];

    boundsQuery.useData()
    .then(results => {

        if (filterType == 'TextFilter' && oidMap) {
            results = results.map(oid => {
                return {
                    oid: oid,
                    code: oidMap[oid],
                };
            });
        } else if (filterType == 'DateFilter') {

            // Set the minimum and maximum dates to the beginning and end of
            // day, respectively. Important for equality comparisons.
            results = [
                util.toBeginningOfDay(results[0]).getTime(),
                util.toEndOfDay(results[1]).getTime()
            ];
        }

        callback(null, results);
    })
    .catch(err => {
        callback(err);
    });

}

/**
 * Check to see that a value is not null or undefined.
 * @arg {*} val - The value to check.
 * @return {Boolean} - Whether the value is not null or undefined.
 */
function notNullOrUndef(val) {
    return !( _.isNull(val) || _.isUndefined(val) );
}

/**
 * Callback passed to QGrid to be called when a filter is modified.
 * @arg changedFilter - The filter that was changed, passed so the Table
 *                      can access its changed properties.
 */
var handleFilterChanged = function (changedFilter) {

    this.wquery.promise = null;

    let {
        field,            // The field (column) of the changed filter.
        minValue,         // The lower bound for that field's data.
        maxValue,         // The upper bound for that field's data.
        loFilterValue,    // The lower bound set on the filter.
        hiFilterValue     // The upper bound set on the filter.
    } = changedFilter;

    // Extract the values for the filtering from the QGrid filter object.
    if (changedFilter.type == 'TextFilter') {

        let whitelist = _.keys(changedFilter.filterList);

        // If this field/column has OIDs, the key strings must be parsed
        // into integers.
        if (_.has(this.mapping, field)) {
            whitelist = whitelist.map(val => parseInt(val));
        }

        if (_.isEmpty(whitelist)) {
            this.props.query.removeFilter(field, 'in');
        } else {
            this.props.query.addFilter(field, 'in', whitelist);
        }

    } else {

        let min = minValue;
        let max = maxValue;
        let lo  = loFilterValue;
        let hi  = hiFilterValue;

        // Round the values from the filters to avoid floating point math
        // errors. Also checks for existence because _.round(null, 5) === 0.
        // Only for SliderFilters because DateFilters will never be floats.
        if (changedFilter.type == 'SliderFilter') {
            min = min && _.round(min, 5);
            max = max && _.round(max, 5);
            lo  = lo  && _.round(lo,  5);
            hi  = hi  && _.round(hi,  5);

        // If it's a DateFilter, convert the values from ms to Date objects
        // so that they can be correctly parsed by Python.
        } else if (changedFilter.type == 'DateFilter') {

            if (notNullOrUndef(lo)) {
                loFilterValue = new Date(loFilterValue);
            }

            if (notNullOrUndef(hi)) {
                hiFilterValue = new Date(hiFilterValue);
            }

        }

        // If the filter has a lower bound set and it's not the same as the
        // lower bound on the data, create a filter for it. Otherwise, there
        // should not be a filter for the '>' operation.
        if (notNullOrUndef(lo) && lo !== min) {
            this.props.query.addFilter(field, '>', loFilterValue);
        } else {
            this.props.query.removeFilter(field, '>');
        }

        if (notNullOrUndef(hi) && hi !== max) {
            this.props.query.addFilter(field, '<', hiFilterValue);
        } else {
            this.props.query.removeFilter(field, '<');
        }

    }

    this.wquery.useData(true).then(result => {

        let { values } = result.pandas;
        values = uniqifyRows(values);

        this.grid.dataView.setItems(values);

        // Necessary cleanup for number (sliding) filters.
        this.grid.filterList.forEach(filter => {
            if (filter.type == 'SliderFilter') {
                filter.handleFilteringDone();
            }
        });

    });

};

/**
 * Callback for when a QGrid's sorting is modified. Reruns the Table's
 * widgetQuery with updated arguments specifying on which columns to sort
 * the data.
 *
 * @arg {array} sortFields - An array of array-pairs that specifies how to
 * sort the data. Has form [['col1', true], ['col2', false], ...]. First
 * value is the field, second value is asc (true) or desc (false).
 *
 * @return {Promise} - Promise that resolves when the sorted data has been
 * received and the grid updated.
 */
var handleSortChanged = function (sortFields) {
    this.wquery.promise = null;

    // Set the widgetQuery's sort_cols option in its arguments.
    _.set(this.wquery, 'args.options.sort_cols', sortFields);

    // Also update the dataQuery, so if the user downloads a Table as a
    // CSV or Excel file, it will match the Table's current sort state.
    _.set(this.dataQuery, 'args.options.sort_cols', sortFields);

    return this.wquery.useData().then(result => {
        let { values } = result.pandas;
        values = uniqifyRows(values);
        this.grid.dataView.setItems(values);
    });
};

var createTable = function (dom, raw) {

    // Fire off a query to compute the total (on-disk)
    // length of the table's underlying data set.
    let rangeQuery = q.jsutil.table_range({
        data: this.props.query,
    }).useData().catch(err => console.error(err));

    if (this.isMounted()) {
        let
            filterCallback,
            sortCallback,
            data = raw.pandas,
            records = data.values,
            columns = data.axes.columns.values,
            dtypes = data.dtypes.kind,
            classes = this.props.columnCssClasses,
            editors = this.props.editors,

            // If the server sent fewer rows than the specified limit
            // to the client when the chart was created,
            // then the chart has all the data.
            hasFullDataSet = (records.length < this.props.dataLimit),

            $dom = $(dom)
        ;

        var columnData = _.zip(columns, dtypes).map(item => {
            let
                field = item[0],
                niceName = util.formatName(field),
                type = item[1],
                widths = {
                    Errors: 350,
                    Warnings: 350,
                }
            ;

            var colWidth = (widths[field]) ? widths[field] : 150;
            var result = {
                field: field,
                name: niceName,
                toolTip: niceName,
                type: type,
                width: colWidth,
            };

            if (type && formatters[type] && type !== 'Date' && type !== 'Time' && type != 'Datetime') {
                result.formatter = formatters[type];
            }

            return result;
        });

        // Only do server-side filtering if the grid
        // doesn't already have the full data set.
        if (!hasFullDataSet) {
            filterCallback = handleFilterChanged.bind(this);
            sortCallback = handleSortChanged.bind(this);
        }

        // Necessary CSS class additions for proper table styling.
        $dom.parent().addClass('q-grid-container');
        $dom.addClass('q-grid');

        this.grid = new QGrid(
            dom,
            records,
            columnData,
            this.props.options,
            filterCallback,
            sortCallback
        );

        // Only need to compute bounds on the server (with all data)
        // if the chart isn't given the whole data set.
        if (!hasFullDataSet) {
            this.grid.filterList.forEach(filter => {
                filter.getBounds = getColumnBounds.bind(this);
            });
        }

        this.grid.initializeSlickGrid();

        // Callback to execute once the table range
        // has been computed and sent to the browser.
        rangeQuery.then(totalRowCount => {

            // Update the header info (text on the right side of the Table
            // widget's Panel header) with the displayed and total count.
            this.setState({
                headerInfo: formatHeaderInfo(totalRowCount, records.length),
            });

            rowCountCB = _.bind(function (e, { previous, current }) {
                this.setState({
                    headerInfo: formatHeaderInfo(
                        totalRowCount,
                        current
                    ),
                });
            }, this);

            // Listen for when the row count changes, so the header info
            // may be updated with the new value.
            this.grid.dataView.onRowCountChanged.subscribe(rowCountCB);

        });
    }
};

var jsutilOptions = {
    map_oids: true,
    reorder_columns: true,
};

var checkHasData = function(data) {
    data = data.wquery.pandas.values;

    return (data.length > 0);
};

var defaultProps = function() {
    var props = {
        query: undefined,
        viewProps: {},
        options: {
            enableCellNavigation: true,
            enableColumnReorder: false,
            forceFitColumns: false,
            gridHeight: null,
            editable: true,
        },
        style: {
            width: "100%",
        },
        columnCssClasses: {},
        editors: {},
        table: true,
        dataLimit: 1000,
        checkHasData: checkHasData,
        noDataMsg: 'No rows in this table.',
    };

    return _.merge(props, jsutilOptions);
};

/**
 * Component for a basic table.
 * @component
 * @exports lib\Components\Table
 */
const Table = React.createClass({
    propTypes: {
        options: React.PropTypes.object,
        style: React.PropTypes.object,
        columnCssClasses: React.PropTypes.objectOf(React.PropTypes.string),
        editors: React.PropTypes.object,
        table: React.PropTypes.bool,
    },
    displayName: 'Table',
    mixins: [_.omit(ChartMixin, ['_createChart', 'getDefaultProps', 'downloadToPng'])],

    componentWillMount: function () {
        q.jsutil.mappings({}).useData().then(mapping => {
            this.mapping = mapping;
        });
    },

    componentWillUnmount: function () {
        if (this.grid && this.grid.dataView) {
            this.grid.dataView.onRowCountChanged.unsubscribe(rowCountCB);
        }
    },

    spec: {
        exports: ['csv', 'xlsx']
    },
    _createChart: createTable,
    getDefaultProps: defaultProps,

    // Can't download a Table as a PNG, as it's not a Highcharts chart.
    downloadToPng: () => { throw new Error('Not Implemented.'); },

    dataQuery: function (query) {
        let options = _.pick(this.props, _.keys(jsutilOptions));
        options['max_rows'] = false;
        return q.jsutil.TableWidget({
            data: query,
            options,
        });
    },

    widgetQuery: function(query) {
        var options = _.pick(this.props, _.keys(jsutilOptions));
        options['max_rows'] = 1000;
        return q.jsutil.TableWidget({
            data: query,
            options,
        });
    },

    truncate: (state) => state.data,

});

export default Table;
