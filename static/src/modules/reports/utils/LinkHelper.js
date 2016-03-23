import _ from 'lodash';
import { widgetLink } from 'reports/utils/ReportHelper';
import Query from 'reports/utils/query';

/**
 * This is creates an object which handles the creation of a report link
 * @report string - the name of the report to which we are linking
 * @refs [[Object, {string: Object}]] - an array or arrays with one entry per query on target page.
 *      each entry must have two parts: first is a string or Query which returns a string and is the reference of the target query
 *      the second entry must be an object of key value pairs for the traget query
 */
var LinkHelper = function (report, refs){
    var self = this;
    self.page = report;
    self.refs = refs;
};

/**
 * This method takes links to the target page
 * @data {string: Object} - an object of values to populate the queries on the target page. keys are matched against keys in self.refs.
 */
LinkHelper.prototype.followLink = function(data) {
    var self = this;
    var linkArguments = {};

    if (typeof self.refs === "string") {
        var argsForQuery = {};
        argsForQuery['value'] = data[self.refs];
        linkArguments[self.refs] = argsForQuery;
    } else if (self.refs instanceof Query) {
        var argsForQuery = {};
        if (self.refs.data instanceof Array) {
            argsForQuery['value'] = data[self.refs.data[0]];
            linkArguments[self.refs.data[0]] = argsForQuery;
        } else {
            argsForQuery['value'] = data[self.refs.data];
            linkArguments[self.refs.data] = argsForQuery;
        }
    } else {
        if (!(self.refs[0] instanceof Array)) {
            self.refs = [self.refs];
        }

        self.refs.forEach(function(ref, i) {
            var argsForQuery = {};

            var queryReference = ref[0];
            var seriesValues = ref[1];

            _.forOwn(seriesValues, function(value, key) {
                if (value instanceof Query) {
                    if (value.data instanceof Array) {
                        // Probably should check the length of the array here
                        argsForQuery[key] = data[value.data[0]];
                    } else {
                        argsForQuery[key] = data[value.data];
                    }
                } else {
                    argsForQuery[key] = data[value];
                }
            });

            if (ref.length == 3) {
                var reportValues = ref[2];
                _.forOwn(reportValues, function(value, key) {
                    if (value instanceof Query) {
                        if (value.data instanceof Array) {
                            // Probably should check the length of the array here
                            argsForQuery[key] = value.data[0];
                        } else {
                            argsForQuery[key] = value.data;
                        }
                    } else {
                        argsForQuery[key] = value;
                    }
                });
            }

            if (queryReference instanceof Query) {
                queryReference = queryReference.data;
                if (queryReference instanceof Array) {
                    // Probably should check the length of the array here
                    queryReference = queryReference[0];
                }
            } else {
                queryReference = queryReference;
            }

            linkArguments[queryReference] = argsForQuery;
        });
    }

    if (self.page instanceof Query) {
        self.page.useData().then((page) => {
            widgetLink(page, linkArguments);
        })
    } else {
        widgetLink(self.page, linkArguments);
    }
};

export default LinkHelper;
