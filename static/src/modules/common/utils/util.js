import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import sjcl from 'sjcl';
import numeral from 'numeral';

/**
 * Parse a date string into a date object.
 * @param {string} date - String representation of a date, in format yyyymmddhhmmss.
 * @return {Date} The equivalent Date object.
 */
var ParseDate = function(date) {
    var year = parseInt(date.slice(0, 4));

    // JavaScript uses zero-based indexing for months,
    // and one-based for everything else date related.
    var month = parseInt(date.slice(4, 6)) - 1;
    var day = parseInt(date.slice(6, 8));
    var hour = parseInt(date.slice(8, 10));
    var minute = parseInt(date.slice(10, 12));
    var second = parseInt(date.slice(12));
    return new Date(year, month, day, hour, minute, second, 0);
};


/**
 * Collection of utility functions.
 * @exports lib\util
 */
const util = {

    /**
     * Cumulative sum of values in an array
     * @param {array} arr - array of numbers
     * returns {number}
     */
    accumulate(arr) {
        return _.reduce(arr, function(result, value, i) {
            var sum = result[i]+value;
            result.push(sum);
            return result;
        }, [0]);
    },

    /**
     * Do nothing. Prevent an event from doing anything else.
     */
    noop: function (e) {
        e.preventDefault();
    },

    /**
     * Returns the input as an array, if not already.
     * If a single value the return is [argument].
     * If multiple values the return is [argument[0], ... ].
     * If there is only one argument and it is an array,
     * that argument is returned as is.
     * @return {array} - An array of the input.
     */
    ensureArray: (...args) => {
        if (args.length == 1) {
            var value = args[0];

            if (_.isUndefined(value)) {
                return undefined;
            } else {
                return _.isArray(value) ? value : [value];
            }
        } else {
            return args;
        }
    },

    /**
     * Return true if oid is valid.
     */
    isValidOid: function(oid) {
        return (_.isFinite(oid) && oid >= 0);
    },

    /**
     * Transition to a new page.
     * @param {string} transitionTo - Page to transition to.
     */
    setTransitionTo: function(transitionTo) {
        util.transitionTo = transitionTo;
    },

    /**
     * Go to a new page, without updating the URL history.
     * @param {string} replaceWith - Page to replace with.
     */
    setReplaceWith: function(replaceWith) {
        util.replaceWith = replaceWith;
    },

    /**
     * Set the route context object.
     * @param {object} context - The route context object.
     */
    setRouteContext: function(context) {
        util.context = context;
    },

    /**
     * Dummy getPath function to be wired up during runtime.
     */
    getPath: function() {},

    /**
     * Set the router GetPath function.
     * @param {object} context - The GetPath function.
     */
    setGetPath: function(getPath) {
        util.getPath = getPath;
    },

    /**
     * Dummy getParams function to be wired up during runtime.
     */
    getParams: function() {},

    /**
     * Set the router GetParams function.
     * @param {object} context - The GetParams function.
     */
    setGetParams: function(getParams) {
        util.getParams = getParams;
    },

    /**
     * Dummy getQuery function to be wired up during runtime.
     */
    getQuery: function() {},

    /**
     * Set the router GetQuery function.
     * @param {object} context - The GetQuery function.
     */
    setGetQuery: function(getQuery) {
        util.getQuery = getQuery;
    },

    /**
     * Dummy getRoutes function to be wired up during runtime.
     */
    getRoutes: function() {},

    /**
     * Set the router GetRoutes function.
     * @param {object} context - The GetRoutes function.
     */
    setGetRoutes: function(getRoutes) {
        util.getRoutes = getRoutes;
    },

    /**
     * Dummy getPathname function to be wired up during runtime.
     */
    getPathname: function() {},

    /**
     * Set the router GetPathname function.
     * @param {object} context - The GetPathname function.
     */
    setGetPathname: function(getPathname) {
        util.getPathname = getPathname;
    },

    /**
     * Set an error after an error has occurred.
     * This only stores the error, it does not present it to the user.
     * @param {string} description - The error's description.
     * @param {string} message - The error's message.
     */
    setError: function(description, message) {
        util.description = description;
        util.message = message;

        try {
            util.route = util.context.getCurrentPath();
        } catch (e) {
            util.route = '';
        }
    },

    /**
     * Get the last set error's description.
     * @return {string} description - The error's description.
     */
    getErrorDescription: function() {
        return util.description;
    },

    /**
     * Extracts an error out of many things which could
     * represent an error.
     * @param {unknown} error - Something representing an error.
     * @return {error} The normalized error.
     */
    extractError: function(error) {
        try {
            return error.args[0];
        } catch (e) {}

        try {
            return error.message || error;
        } catch (e) {}

        return error;
    },

    /**
     * Get the last set error's message.
     * @return {string} message - The error's message.
     */
    getErrorMessage: function() {
        return util.extractError(util.message);
    },

    /**
     * Get the route requested from the server when
     * the last error message occurred.
     * @return {string} The route requested before the error.
     */
    getErrorLocation: function() {
        return util.route || '';
    },

    /**
     * Get the name from an item, using a map if possible.
     * @param {object} map - The map to apply to the object.
     * @param {object} item- The option item object.
     * @param {bool} selected - Whether the item is selected.
     * @return {string} The mapped name of the item.
     */
    getName: function(map, item, selected) {
        if (_.isPlainObject(map)) {
            if (item in map) {
                return map[item];
            } else {
                return item;
            }
        } else if (_.isFunction(map)) {
            return map(item, selected);
        } else {
            return item;
        }
    },

    /**
     * Set an error that happened during a server request.
     * @param {string} action - The server action that was being taken,
     *                          eg POST, GET.
     * @param {string} url - The server url that was being requested.
     * @param {string} message - The error message.
     */
    setRequestError: function(action, url, message) {
        var description = 'Error during ' + action + ' ' + url;

        util.setError(description, message);
    },

    /**
     * Go to an error page to display the last error.
     */
    goToErrorPage: function() {
        util.replaceWith('error');
    },

    /**
     * Parse a server response, which may or may not be json.
     * @param {object} xhr - The server response.
     * @return {object or string} The server's json response as an object,
     *                            otherwise the server's string response.
     */
    parseResponse: function(xhr) {
        try {
            return JSON.parse(xhr.responseText).message;
        }
        catch (e) {
            return xhr.responseText;
        }
    },

    /**
     * Do a POST request to the server.
     * @param {string} url - The server url to POST to.
     * @param {object} data - The data to POST.
     * @param {function} resultCallback - Callback to call after the server responds successfully.
     * @param {function} errorCallback - Callback to call after the server fails to responds successfully.
                         This function should return true if it wants to prevent Neat from displaying
                         the resulting error message to the user on an error page.
     * @param {string} dataType - The data type of data. Defaults to 'json'.
     * @param {string} contentType - The content types of the request. Defaults to 'application/json; charset=utf-8'.
     * @returns {object} jQuery.Deferred object for the ajax request
     */
    post: function (
        url,
        data,
        resultCallback,
        errorCallback,
        dataType,
        contentType
    ) {
        if (typeof dataType === 'undefined') {
            dataType = 'json';
        }

        if (typeof contentType === 'undefined') {
            contentType = 'application/json; charset=utf-8';
        }

        var error = function (xhr, status, err) {
            var response = util.parseResponse(xhr);

            console.log('Error during POST! Error was:');
            console.log(err);

            util.setRequestError('POST to', url, response);
            if (!(errorCallback && errorCallback(xhr, status, err))) {
                util.goToErrorPage();
            }
        };

        var obj = {
            type: 'POST',
            url: url,
            dataType: dataType,
            contentType: contentType,
            data: JSON.stringify(data),
            success: resultCallback,
            error: error,
        };
        //$.ajax(obj);
        return $.ajax(obj);
    },

    /**
     * Do a query request to the server as a GET request.
     * @param {string} url - The server url to request.
     * @param {object} query - The query object that will be encoded in the request's query.
     * @param {function} callback - Callback to call after the server responds successfully.
     * @param {function} errorCallback - Callback to call after the server fails to responds successfully.
                         This function should return true if it wants to prevent Neat from displaying
                         the resulting error message to the user on an error page.
     * @param {string} contentType - The content types of the request. Defaults to 'application/json; charset=utf-8'.
     */
    query: function (url, query, callback, errorCallback, contentType) {
        return util.post(url, query, callback, errorCallback, 'json', contentType);
    },

    /**
     * Do a GET request to the server.
     * @param {string} url - The server url to GET to.
     * @param {function} resultCallback - Callback to call after the server responds successfully.
     * @param {function} errorCallback - Callback to call after the server fails to responds successfully.
                         This function should return true if it wants to prevent Neat from displaying
                         the resulting error message to the user on an error page.
     * @param {string} contentType - The content types of the request. Defaults to 'application/json; charset=utf-8'.
     * @param {object} query - The object that will be encoded in the request string's query.
     * @returns {object} jQuery.Deferred object for the ajax request
     */
    get: function (url, resultCallback, errorCallback, contentType, query) {
        if (typeof contentType === 'undefined') {
            contentType = 'application/json; charset=utf-8';
        }

        var error = function (xhr, status, err) {
            try {
                var response = JSON.parse(xhr.responseText);
            }
            catch (e) {
                var response = xhr.responseText;
            }

            console.warn('Error during GET! Error was:');
            console.warn(response);

            util.setRequestError('GET from', url, response);
            if (!(errorCallback && errorCallback(xhr, status, err))) {
                util.goToErrorPage();
            }
        };

        // Examine the current path., xref !390
        var callback;
        if (resultCallback !== undefined) {
            var path = util.getPath();
            callback = function (xhr, status, err) {

                // Only execute the callback if we are on the same exact path as before,
                // to prevent the callback from executing in an undetermined way on the new page.
                if (path === util.getPath()) {
                    resultCallback(xhr, status, err);
                }
            };
        }

        var obj = {
            type: 'GET',
            url: url,
            data: query,
            dataType: 'json',
            contentType: contentType,
            success: callback,
            error: error,
        };

        return $.ajax(obj);
    },

    /**
     * Programmatically downloads a file from a browser.
     *
     * @param {string} filename - The name that the file will be downloaded as.
     * @param {string} href - The location (or dataUrl) of the resource to
     * download.
     */
    downloadFile: function (filename, href) {
        let a = document.createElement('a');
        a.download = filename;
        a.href = href;
        document.body.appendChild(a);
        a.click();
        a.remove();
    },

    /**
     * Get just the filename from a filepath.
     * @param {string} path - The filepath.
     * @return {string} The path's filename.
     */
    filenameFromPath: function(path) {
        if (!path) {
            return null;
        }

        return path.replace(/^.*[\\\/]/, '');
    },

    /**
     * Parse a date string into a date object.
     * @param {string} date - String representation of a date, in format yyyymmddhhmmss.
     * @return {Date} The equivalent Date object.
     */
    ParseDate: ParseDate,

    /**
     * Map for getting the nice display name
     * associated with a date format string.
     * @arg {string} delimiter - The date separator to use when creating the
     *                           display name.
     * @arg {string} value - The date format string.
     * @return {list} - The prettified date string for displaying,
     *                  given as a list of react components.
     */
    NiceDatetimeMap: function (delimiter, value) {
        const flex_dd = <span><u>d</u>d</span>;
        const flex_mm = <span><u>m</u>m</span>;

        let map = {
            'xm_xd_yyyy' : [flex_mm, flex_dd, 'yyyy'] ,
            'mm_dd_yyyy' : ['mm', 'dd', 'yyyy']       ,
            'xd_xm_yyyy' : [flex_dd, flex_mm, 'yyyy'] ,
            'dd_mm_yyyy' : ['dd', 'mm', 'yyyy']       ,
            'yyyy_xm_xd' : ['yyyy', flex_mm, flex_dd] ,
            'yyyy_mm_dd' : ['yyyy', 'mm', 'dd']       ,
            'yyyy_mm_ddT': ['yyyy', 'mm', 'ddT']      ,
            'yyyy_xd_xm' : ['yyyy', flex_dd, flex_mm] ,
            'yyyy_dd_mm' : ['yyyy', 'dd', 'mm']       ,
            'xm_xd_yy'   : [flex_mm, flex_dd, 'yy']   ,
            'mm_dd_yy'   : ['mm', 'dd', 'yy']         ,
            'xd_xm_yy'   : [flex_dd, flex_mm, 'yy']   ,
            'dd_mm_yy'   : ['dd', 'mm', 'yy']         ,
            'yy_xm_xd'   : ['yy', flex_mm, flex_dd]   ,
            'yy_mm_dd'   : ['yy', 'mm', 'dd']         ,
            'yy_xd_xm'   : ['yy', flex_dd, flex_mm]   ,
            'yy_dd_mm'   : ['yy', 'dd', 'mm']         ,
            'mmddyyyy'   : ['mmddyyyy']               ,
            'ddmmyyyy'   : ['ddmmyyyy']               ,
            'yyyymmdd'   : ['yyyymmdd']               ,
            'yyyyddmm'   : ['yyyyddmm']               ,
            'mmddyy'     : ['mmddyy']                 ,
            'ddmmyy'     : ['ddmmyy']                 ,
            'yymmdd'     : ['yymmdd']                 ,
            'yyddmm'     : ['yyddmm']                 ,
        }

        const mapped_value = map[value];
        if (!mapped_value) return value;

        let result = [];
        _.forEach(mapped_value, (element, i) => {
            result.push(element);
            if (i < mapped_value.length - 1) {
                result.push(<span>{delimiter}</span>);
            }
        });

        return result;
    },

    /**
     * Gets a nice description for a date format string.
     * @arg {string} value - The date format string.
     * @return {string} - The description of the date format.
     */
    NiceDatetimeDescription: function (value) {
        if (!_.isString(value)) return value;

        value = value
            .replace('xm', 'a one or two digit month')
            .replace('mm', 'a two digit month')
            .replace('xd', 'a one or two digit day')
            .replace('dd', 'a two digit day')
            .replace('yyyy', 'a four digit year')
            .replace('yy', 'a two digit year')
            .replace('_', ', a separator, ')
            .replace('_', ', a separator, and ');

        value = _.capitalize(value) + '.';

        return value;
    },

    /**
     * Unbox a value in an array if an array, otherwise return the value as is.
     * @arg value - The value, potentially wrapped in an array.
     * @return value - The unboxed value.
     */
    unbox: function (value) {
        return _.isArray(value) ? value[0] : value;
    },

    /**
     * Pluralize a string.
     * @arg {string} s - The input string to pluralize.
     * @return {string} - The pluralized output string.
     */
    pluralize: function (s) {
        var lastLetter = _.last(s);
        if (lastLetter !== 's') {
            if (lastLetter == 'y') {
                return s.substr(0, s.length - 1) + 'ies';
            } else if (lastLetter !== 's') {
                return s + 's';
            }
        } else {
            return s;
        }
    },

    /**
     * Gets a formatting function.
     * @arg {string} type - The format type, eg dollar, float, int, percent.
     * @return {function} - The formatting function.
     */
    getFormatFunc: function (type) {
        var unbox = util.unbox;

        if (type === 'name') {
            return value => util.formatName(unbox(value));
        } else if (type === 'dollar' || type === 'dollars') {
            return value => numeral(unbox(value)).format('$0,0.00');
        } else if (type === 'dollar-only' || type === 'dollars-only') {
            return value => numeral(unbox(value)).format('$0,0');
        } else if (type == 'float') {
            return value => numeral(unbox(value)).format('0,0.00');
        } else if (type === 'percent') {
            return value => numeral(unbox(value)).format('0.00%');
        } else {
            return value => numeral(unbox(value)).format(type);
        }
    },

    /**
     * Returns a copy of the passed JavaScript Date with the time set to
     * the beginning of the day (00:00:00.000).
     * @arg {(Date|number)} date - The date object to copy and reset.
     * @return {Date} - The passed date with its time set to BOD.
     */
    toBeginningOfDay: function (date) {

        if (!_.isDate(date)) {
            date = new Date(date);
            if (!_.isDate(date)) {
                throw new Error('Invalid Date');
            }
        }

        return new Date(date.toDateString());

    },

    /**
     * Returns a copy of the passed JavaScript Date with the time set to
     * the end of the day (23:59:59.999).
     * @arg {(Date|number)} date - The date object to copy and reset.
     * @return {Date} - The passed date with its time set to EOD.
     */
    toEndOfDay: function (date) {

        if (!_.isDate(date)) {
            date = new Date(date);
            if (!_.isDate(date)) {
                throw new Error('Invalid Date');
            }
        }

        // Beginning of day plus 86399999ms is end of day.
        let bod = new Date(date.toDateString());
        return new Date(bod.getTime() + 86399999);

    },

    defaults: function (props, defaultz) {
        var mapped_props = defaultz;
        function setValue(obj, path, value){
            if (path.length > 1){
                setValue(obj[path.shift()], path, value);
            } else {
                obj[path[0]] = value;
            }
            return obj;
        }

        function traverse(object, path, callback) {
            if( typeof object == "object" ) {
                $.each(object, function(k, v) {
                    // k is either an array index or object key
                    var p = path.slice();
                    p.push(k)
                        traverse(v, p, callback);
                });
            } else {
                // object is a number or string
                if (object) {
                    callback(path, object);
                }
            }
        };

        traverse(props, [], function(path, value) {
            mapped_props = setValue(mapped_props, path, value);
        });

        return mapped_props;
    },

    // classnames for aiding testability
    testClassNames: {
        hasOverlayTrigger: '_test-has-ot'
    },

    /**
     * Return a 32-bit hash of a string.
     * @param {string} string - The string to hash.
     * @return {int} - The 32-bit hash.
     */
    hash: function(string) {
        var hash = sjcl.hash.sha256.hash(string);

        // The hash is an array of 8 32-bit words.
        // We return the first word, for brevity,
        // with the assumption that we should still
        // have no hash collisions, since this hash
        // is used to distinguish between ~O(100) items.
        return hash[0];
    },

    /*
     * Formats a string to something which is more human readable
     * @param {string} name - the string to be formated
     * @return {string} - the well formated string
     */
    formatName: function(name) {
        if (name && _.isString(name)) {
            var result = name;
            result = result
                .replace(/_/g, " ")
                .replace(/\bpnl\b/g, "P&L")
                .replace(/\bpctnotional\b/g, "% notional")
                .replace(/\bpershare\b/g, "per share")
                .replace(/\bcount tid\b/g, "number of transactions")
                .replace(/\b\bcomm\b\b/g, "commission")
                .replace(/\bsec\b/g, "security")
                .replace(/\bqty\b/g, "quantity")
                .replace(/\bcnt\b/g, "count")
                .replace(/\bcount /g, "count of ")
                .replace(/\bacct\b/g, "account")
                .replace(/\bnunique account\b/g, "nunique accounts")
                .replace(/\bnunique broker\b/g, "nunique brokers")
                .replace(/\bnunique security\b/g, "nunique securities")
                .replace(/\bmkt\b/g, "market")
                .replace(/\badjfactor\b/g, "adjustment factor")
                .replace(/\bexch\b/g, "exchange")
                .replace(/\bcumm\b/g, "(Cumulative)")
                .replace(/\bnunique\b/g, "number of unique")
                .replace(/\btid\b/g, "trade ID")
                .replace(/\bsum\b/g, "total")
                .replace(/\bwavg\b/g, "weighted average")
                .replace(/\bmean\b/g, "average")
                .replace(/\bavg\b/g, "average")
                .replace(/\babs\b/g, "absolute value of")
                .replace(/\b pct \b/g, ", percent of ")
                .replace(/\btotal total\b/g, "total")
                .replace(/\bmax max\b/g, "max")
                .replace(/\bmin min\b/g, "min")
                .replace(/( \w)/g, function(v) { return v.toUpperCase() })
                .replace(/^(\w)/, function(v) { return v.toUpperCase() })
                .replace(/ Of /g, " of ")
                .replace(/ The /g, " the ")
                .replace(/ A /g, " a ")
                .replace(/ An /g, " an ")
                .replace(/ Vs /g, " vs ")
                .replace(/ In /g, " in ")
                .replace(/ By /g, " by ");

            return result;
        }
        return name;
    },

    /*
     * Takes a list of strings and formats them to something which is more human friendly
     * @param {string} name - the list of strings to be formated
     * @return {string} - the list of well formated strings
     */
    formatNames: function(names) {
        if (_.isArray(names)) {
            return names.map(this.formatName);
        } else if (_.isObject(names)) {
            return _.mapValues(names, this.formatName);
        }
    },

    formatNum: function (column) {
        if (_.some(['price', 'notional', 'comm', 'fee', 'pnl', 'value', 'cost', 'exposure'].map( x => { return (column.indexOf(x) > -1) }))) {
            return ',.2f';
        } else if (_.some(['count', 'nuniq'].map( x => { return (column.indexOf(x) > -1) }))) {
            return ',f';
        } else {
            return ',.0f';
        }
    },

    prefixNum: function (column) {
        if (_.some(['price', 'notional', 'comm', 'fee', 'pnl', 'value', 'cost', 'exposure'].map( x => { return (column.indexOf(x) > -1) }))) {
            return '$';
        } else {
            return '';
        }
    },

    columnParser: function(column, format, prefix) {
        var prefix = prefix || this.prefixNum(column);
        var format = format || this.formatNum(column);
        return (x => { return prefix + '{' + x + ':' + format + '}' });
    },

    parseNum: function(x, column, format, prefix) {
        var prefix = prefix || this.prefixNum(column);
        var format = format || this.formatNum(column);
        if (x < 0) {
            prefix = '-' + prefix;
        }
        return prefix + numeral(Math.abs(x)).format(format);
    },
};

export default util;
