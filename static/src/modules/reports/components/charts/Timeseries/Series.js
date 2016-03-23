import _ from 'lodash';
import util from 'common/utils/util';
import Default from 'reports/components/charts/Timeseries/Default';

/**
 * Parses an array of JSON snippets
 */
export function _parseColumnNames(columnNames, mapping) {
    return _.map(columnNames, function (colNm) {
        var columns = JSON.parse(colNm);

        var name = _.map(columns, function(x) {
            if (!_.has(x, 'variable')) {
                return _.map(x, function(val, key) {
                    return _.get(mapping, [key, val], val);
                });
            }
        }).join(' ');

        var variable = _.filter(_.map(columns, 'variable')).join('');

        return {
            column_name: colNm,
            name: name,
            variable: variable
        };
    });
}

/**
 * Iterates through the `subitems` field on the seriesConfig and creates
 * a subitem configuration object (containing name, variable, and id fields)
 * grabbing those fields from passed in data parameter.
 *
 * e.g. turns this:
 *   seriesConfig = [{id: 'foo', subitems: ['foo']}]
 * into this:
 *    seriesConfig = [{
 *      id: 'foo',
 *      subitems: [{id:'foo_column', variable:'foo', name:'Foo Name'}]
 *    }]
 */
export function _processSeriesConfigHelper(seriesConfig, data) {
    if (!seriesConfig) {
        seriesConfig = [];
    } else {
        seriesConfig = _.cloneDeep(seriesConfig);
    }

    var dataByVariable = _.keyBy(data, 'variable');
    var allVariables = _.keys(dataByVariable);
    var configsProvided = _.flatMap(seriesConfig, 'subitems');
    var configsNeeded = _.difference(allVariables, configsProvided)

    // fill in missing series configs
    _.forEach(configsNeeded, function(variable) {
        var dataitem = dataByVariable[variable];
        seriesConfig.push({
            type: 'line',
            id: dataitem.variable,
            subitems: [dataitem.variable]
        });
    });

    // fill in the IDs
    _.forEach(seriesConfig, function(item) {
        item.subitems =  _.map(item.subitems, function(subitem) {
            var dataitem = dataByVariable[subitem];
            return {
                name: dataitem.name,
                id: dataitem.column_name,
                variable: subitem
            };
        });
    });

    return seriesConfig;
}

/**
 * Splits calls to helper function above by name. Since several records can
 * have the same variable but different names. Then sorts the series config
 * by id.
 */
export function _processSeriesConfig(seriesConfig, data) {
    var names = _.uniq(_.map(data, 'name'));
    var seriesConfig = _.flatten(_.map(names, function(name) {
        var dataItemsWithName = _.filter(data, { name: name });
        return _processSeriesConfigHelper(seriesConfig, dataItemsWithName);
    }));
    return _.sortBy(seriesConfig, 'id');
}

export function buildSeries(values, columns, xdata, mapping, props) {
    var columnNames = _.slice(columns, 1, props.view_limit+1);
    var data = _parseColumnNames(columnNames, mapping);

    var seriesConfig = _processSeriesConfig(props.seriesConfig, data);

    data = _.map(seriesConfig, function(seriesItem) {
        var { id, subitems, seriesOptions } = seriesItem;

        var name = '';
        var variable = id;
        if (subitems.length === 1) {
            var _sub = subitems[0];
            variable = _sub.variable;
            name = _sub.name;
        }

        // Build up series data by starting with the time data and
        // adding additional series to corresponding
        let seriesData = _.map(subitems, function(item) {
            return _.map(values, item.id);
        });
        seriesData.unshift(xdata);
        let zippedSeriesData = _.zip(...seriesData);

        // Only take data points where all components are finite numbers
        // data = _.filter(data, _.partialRight(_.all, _.isFinite));

        var result = {
            name: name,
            id: id, // id is for events
            variable: variable,
            data: zippedSeriesData,
            tooltip: { valueDecimals: 2 },
            yAxis: 0
        };

        result = Default.buildOptions(result, seriesOptions, 'seriesOptions');
        return result;
    });

    // If all names are the same, make it blank
    if (_.uniq(_.map(data, 'name')).length === 1) {
        _.forEach(data, function(arg) {
            arg.name = '';
        });
    }

    // If we have more than 1 variable, prepend name with variable
    if (_.uniq(_.map(data, 'variable')).length > 1) {
        _.forEach(data, function(arg) {
            var prefix = '';
            if (arg.name.length) {
                prefix += arg.name + ': ';
            }
            arg.name = prefix + util.formatName(arg.variable);
        });
    }

    return data;
}
