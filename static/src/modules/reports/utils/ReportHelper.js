import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router';
import util from 'common/utils/util';
import q from 'common/utils/queryFactory';
import Query from 'reports/utils/query';
import ReportMixin from 'reports/components/reports/ReportMixin';

function doc_wrapper(fn) {
    return function(obj) {
        let doc;
        if (obj.doc) {
            doc = obj.doc;
            delete obj.doc;
        }

        var query = fn(obj);
        query.doc = doc;

        return query;
    };
};

const make_unary_op = op_name =>
(column, new_column_name) =>
    unary_op(op_name, column, new_column_name);

const make_binary_op = op_name =>
(column_1, column_2, new_column_name) =>
    binary_op(op_name, column_1, column_2, new_column_name);

const make_unary_update = op_name =>
(data, column, new_column_name) =>
    unary_update(data, op_name, column, new_column_name);

const make_binary_update = op_name =>
(data, column_1, column_2, new_column_name) =>
    binary_update(data, op_name, column_1, column_2, new_column_name);

/**
* Standard helper functions and objects for making reports.
* @exports reports\utils\ReportHelper
*/
export let reportList = [];
export let tagSet = new Set();
export let urlLookup = {};

export function getReportByUrl(urlName) {
    return urlLookup[urlName];
}

export function makeUrl(reportName) {
    return reportName
        .replace(/[^\w]+/g, '-')
        .replace(/--+/g, '-')
        .replace(/-$/g, '');
}

export function makeReport(reportObject) {
    if (reportObject.mixins) {
        reportObject.mixins.push(ReportMixin);
    } else {
        reportObject.mixins = [ReportMixin];
    }

    var urlName = makeUrl(reportObject.displayName);

    reportObject.getDefaultProps = () => ({
        urlName: urlName,
        displayName: reportObject.displayName,
        summary: reportObject.summary,
        style: reportObject.style || 'wide',
        meta: reportObject.meta,
    })

    var reactClass = React.createClass(reportObject);
    reactClass.meta = reportObject.meta;
    reactClass.urlName = urlName;

    reportList.push(reactClass);
    reactClass.meta.forEach(tag => tagSet.add(tag));
    urlLookup[urlName] = reactClass;

    return reactClass;
}

export function widgetLink(reportName, passing) {
    // FIXME: use the react router functions to do this, rather than splitting on '/'.
    var url = _.slice(util.getPathname().split('/'), 0, -1);
    var urlArgs = {};
    _.forOwn(passing, function(args, recipient) {
        var temp = {};
        urlArgs[JSON.stringify('query:' + recipient)] = JSON.stringify(args);
    });

    var reportUrl = makeUrl(reportName);
    url.push(reportUrl);

    util.transitionTo(url.join('/'), {}, urlArgs);
}

export function get(tableName, qdeps) {
    return q.core.get_data({
        table: tableName,
        qargs: qdeps,
    });
}

export const filter = doc_wrapper(obj => {
    var filters = [];
    _.forIn(obj, (value, key) => {
        if (key == 'data') return;

        var op;

        if (value.getSelected) {
            if (value.length > 1) {
                op = 'in';
                value = value.getSelected();
            } else {
                op = '=';
                value = value.getSelectedValue();
            }
        } else if (value instanceof Query) {
            // FIXME: This should use the queries return type.
            op = 'in';
        } else {
            if (_.isArray(value)) {
                op = 'in';
            } else {
                op = '=';
            }
        }

        filters.push([op, key, value]);
    });

    return q.core.filter_by({data:obj.data, where:filters});
});

export const group_and_reduce = doc_wrapper(obj => {
    if (obj.reduction) {
        obj.reduce = obj.reduction;
        delete obj.reduction;
    }
    if (obj.reduce) {
        [obj.field, obj.how, obj.names] = _.unzip(obj.reduce);
        delete obj.reduce;

        var hasNames = _.some(obj.names, function(x) { return !_.isUndefined(x); })
        if (!hasNames) {
            delete obj.names;
        }
    }

    if (obj.groupby) {
        obj.grouper = obj.groupby;
        delete obj.groupby;
    }

    if (obj.field.length > obj.how.length && obj.how.length == 1) {
        obj.how = _.map(obj.field, field => obj.how[0]);
    }

    return q.core.get_groupby_and_reduce(obj);
});

export function group(data) {
    var obj = {
        data: data,
    };

    return {
        by: grouper => {
            obj.grouper = grouper;

            var reduce = reduce_obj => {
                obj = _.assign(obj, reduce_obj);
                return group_and_reduce(obj);
            };

            return {
                reduce: reduce,
                sum: field => reduce({how:'sum', field:field}),
            };
        },
    };
}

export const materialize = doc_wrapper(obj => {
    if (_.isString(obj)) {
        return q.core.materialize({ data:get(obj) });
    } else if (obj instanceof Query) {
        return q.core.materialize({ data:obj });
    } else if (_.isObject(obj)) {
        return q.core.materialize(obj);
    } else {
        return obj;
    }
});

export function cache(query) {
    return q.core.alloc_data({
        data: query,
    });
}

export function binary_update(data, op, column_1, column_2, new_column_name) {
    return q.core.binary_update({
        data: data,
        op: op,
        col1: column_1,
        col2: column_2,
        new_col: new_column_name,
    });
}

export function unary_update(data, op, column, new_column_name) {
    return q.core.unary_update({
        data: data,
        op: op,
        col: column,
        new_col: new_column_name,
    });
}

export function unary_op(op, column, new_column_name) {
    return q.core.unaryop({
        op: op,
        col: column,
        new_col: new_column_name,
    });
}

export function binary_op(op, column_1, column_2, new_column_name) {
    return q.core.binop({
        op: op,
        col1: column_1,
        col2: column_2,
        new_col: new_column_name,
    });
}

// Unary/binary update functions.
// These add the new column to an existing table.
export const abs = make_unary_update('abs');

export const add = make_binary_update('add');
export const sub = make_binary_update('minus');
export const divide = make_binary_update('div');
export const lt = make_binary_update('lt');
export const gt = make_binary_update('gt');
export const max = make_binary_update('max');
export const min = make_binary_update('min');

// Unary/binary op functions.
// These return a single column.
export const _abs = make_unary_op('abs');

export const _add = make_binary_op('add');
export const _sub = make_binary_op('minus');
export const _divide = make_binary_op('div');
export const _lt = make_binary_op('lt');
export const _gt = make_binary_op('gt');
export const _max = make_binary_op('max');
export const _min = make_binary_op('min');

export function concat(...args) {
    var objects = util.ensureArray(...args);

    return q.jsutil.pandas({
        fx: 'concat',
        args: {
            objs: objects,
            axis: 1
        }
    });
}

/**
 * Pick a single value from a table by column name.
 * If there is more than one value in the column,
 * we simply take the first value.
 * @param {query} data - The source table.
 * @param {string} col - The column name.
 * @return {float/int/date} - The first value in the column.
 */
export function pick(data, col) {
    return q.core.reduction({
        data: data,
        op: 'first',
        col: col,
    });
}

export function count(data) {
    return q.core.reduction({data: data, op: "count", col: "i"});
}

export function nunique(data, col) {
    return q.core.reduction({data: data, op: "nunique", col: col});
}

export function sum(args) {
    args.how = ['sum'];
    return group_and_reduce(args);
}

export const join = doc_wrapper(obj => {
    if (!obj.op) {
        obj.op = 'lj';
    }

    if (obj.left) {
        obj.left_table = obj.left;
        delete obj.left;
    }

    if (obj.right) {
        obj.right_table = obj.right;
        delete obj.right;
    }

    return q.core.join(obj);
});

export function dropdown(...args) {
    if (_.isPlainObject(args[0]) && args[0].data) {
        return makeDynamicDropdownQueries(...args);
    } else {
        return makeStaticDropdownQueries(...args);
    }
}

export function makeStaticDropdownQueries(itemList, defaultItem, ref) {
    // If a map is provided we pull at the keys as the dropdown list.
    var itemMap = null;
    if (_.isPlainObject(itemList)) {
        itemMap = itemList;
        itemList = _.keys(itemList);
    }

    var items = q.jsutil.pass_list({
        options: itemList,
    });

    var selected_item = q.jsutil.pass_value({
        value: defaultItem,
        ref: ref,
    });

    var selected_key = selected_item;
    if (itemMap) {
        selected_item = q.jsutil.dictionary({
            dic: itemMap,
            key: selected_key,
        });
    }

    return _.assign(selected_item, {
        length: 1,

        items: items,
        selected: selected_item,

        _getOptions: () => items,
        _getDefaultValue: () => selected_key,
        _getUpdate: () => selected_key,

        getSelected: () => selected_item,
        getSelectedKey: () => selected_key,

        getSelectedValue: () => {
            return q.jsutil.get_value({ array:selected_item, index:0, lift:false });
        },

        getValue: (index = 0) => {
            return selected_item.data[index];
        },

        format: 'name',
    });
}

export function makeDynamicDropdownQueries({ data, col, num = 1 } = {}) {
    var items = q.jsutil.unique_items({
        data: data,
        col: col,
    });

    var selected = [];
    _.forEach(_.range(num), i => {
        var suffix = num > 1 ? (i+1) : '';
        var ref = col + suffix;

        var selected_item = q.jsutil.pass_value({
            value: q.jsutil.get_value({
                lift: false,
                array: items,
                index: i,
            }),

            ref: ref,
        });

        selected.push(selected_item);
    });

    var getSelected = index => {
        if (_.isUndefined(index)) {
            var selectedItems = selected[0];
            for (var i = 1; i < num; i++) {
                selectedItems = selectedItems.append(selected[i]);
            }

            return selectedItems;
        } else {
            return selected[index];
        }
    };

    return _.assign(getSelected(), {
        length: num,

        items: items,
        selected: selected,

        _getOptions: index => items,
        _getDefaultValue: (index = 0) => selected[index],
        _getUpdate: (index = 0) => selected[index],

        getSelected: getSelected,

        getSelectedValue: (index = 0) => {
            return q.jsutil.get_value({ array:getSelected(), index:index, lift:false });
        },

        getValue: index => {
            if (!index && selected.length == 1) {
                index = 0;
            }

            if (index) {
                return selected[index].state.value[0];
            } else {
                var selectedItems = selected[0];
                for (var i = 1; i < num; i++) {
                    selectedItems = selectedItems.append(selected[i]);
                }

                return selectedItems;
            }
        },
    });
}

export function tradeCosts(qstr) {
    return add(qstr, 'comm', 'fee', 'trade_cost')
        .setDoc('The total trade costs, commissions plus fees.');
}
