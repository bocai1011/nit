import _ from 'lodash';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';

/**
 * Base query (node) object
 * This object is a node in the report DAG.
 * TODO: callback is currently unysed
 * @query string which identifies the calculation this node performs
 * @args dictionary of arguments for query
 * @callback currently unused
 */
var Query = function (query, args, callback){
    var self = this;

    this.isQuery = true;
    this.args = args;
    this.defaultArgs = _.clone(self.args);
    if (args['ref']) {
        this.ref = 'query:' + args['ref'];
        delete args['ref'];
    }
    if (args['doc']) {
        this.doc = args['doc'];
        delete args['doc'];
    }
    this.urlArgs = {};
    self.parseURL();
    this.dependencies = [];

    var createDependencies = function(arg){
        if (arg instanceof Query) { // If the argument value is a query

            arg.children.push(self); // Adding this query as a child of the other
            self.dependencies.push(arg)
            return arg.ref;
        }
        if (arg instanceof Array){
            return _.map(arg, createDependencies);
        }
        if (arg instanceof Object){
            return _.mapValues(arg, createDependencies);
        } else {
            return arg;
        }
    };

    this.args = createDependencies(self.args);

    this.widgetCallback = null;
    this.children = [];
    this.evaluated = false;
    this.evaluating = false;
    this.error = null;
    this.data = null;
    this.query = query;
    this.data_callbacks = [];
    this.doc = this.doc || "undocumented";
    this.docs = "";
    this.ref = this.ref || "query:" + util.hash(JSON.stringify(this.query) + JSON.stringify(this.args));
    this.promise = false;
    this.filters = [];
};

/**
 * Adds an object to query's children list.
 * Insures that chilrdern list is unique.
 * TODO: the uniqueness test is probably suboptimal
 * TODO: add test that child has required methods
 * @child object to be added to children list
 */
Query.prototype.subscribe = function(child) {
    this.children.push(child);
    this.children = _.uniq(this.children);
};

/**
 * Adds a new filter to a query's list of filters. The parameters are
 * organized in a different order than those that get added to the filter
 * list to make them more readable. ('account', '>', 100) is more semantic
 * than ('>', 'account', 100).
 * @param {string} field - The field or column to filter.
 * @param {string} operation - The filtering operation (=, >, <, in, etc.)
 * @param {number|string} value - The value against which to filter.
 */
Query.prototype.addFilter = function (field, operation, value) {

    // If a filter for the new field and operation already exists, remove it
    // because it makes no sense to have, e.g., two 'price >' filters.
    //
    // FIXME: We only want to remove a filter with the same field and
    // operation if it comes from the same source. If you filter the same
    // column but from a different UI component, you don't want that to
    // silently override the filter on that column from the original source.
    // This will become an issue when X-filtering from different widgets
    // has been implemented.
    if (this.hasFilter(field, operation)) {
        this.removeFilter(field, operation);
    }

    this.filters.push([ operation, field, value ]);

};

/**
 * Searches the query's filter list to determine if a filter exists for the
 * given field and filter operation.
 * @param {string} field - The column/field for which to search.
 * @param {string) operation - The filter operation (<, >, =, in, etc.).
 * @returns {Boolean} - Whether the filter exists in the list.
 */
Query.prototype.hasFilter = function (field, operation) {
    return !!_.find(this.filters, [ operation, field ]);
};

/**
 * Removes a filter from the filter list. A field and an operation is enough
 * to guarantee a unique filter to remove. If no operation is given, all
 * filters on the passed field will be removed.
 * @param {string} field - The field of the filter to remove.
 * @param {string} operation - The operation of the filter to remove.
 */
Query.prototype.removeFilter = function (field, operation) {

    if (!operation) {
        this.filters = _.reject(this.filters, filter => {
            return filter[1] == field;
        });
    } else {
        this.filters = _.reject(this.filters, filter => {
            return filter[0] == operation && filter[1] == field;
        });
    }

};

/**
 * Modifies the value of an argument to a query parameter.
 * Adds argument value to URL.
 * Triggers a call to update.
 * @arg string which identifes which query argument is being modified
 * @value value which query argument is being set to
 */
Query.prototype.setArgument = function(arg, value) {
    // takes a key and a value. Sets the argument of the given key to the value provided and updates.
    var self = this;
    self.args[arg] = value;
    self.urlArgs[arg] = value;
    var allUrlArgs = util.getQuery();
    allUrlArgs[JSON.stringify(self.ref)] = JSON.stringify(self.urlArgs);
    util.replaceWith(util.getPathname(), {}, allUrlArgs);

    // All this duck-typing will be stripped out once all the Widgets have been
    // ported to use the new Chart infrastructure.
    this.update && this.refresh && this.update().then(this.refresh());
    this._update && this._update();
};

/**
 * Parses the URL for arguments designated for this query.
 */
Query.prototype.parseURL = function() {
    // Loop through the url, take the args that
    var self = this;
    if ((! _.isUndefined(self.ref)) && util.getQuery()[JSON.stringify(self.ref)]) {
        self.urlArgs = JSON.parse(util.getQuery()[JSON.stringify(self.ref)]);
    }
    // this.args = util.defaults(this.urlArgs, this.defaultArgs);
};

/**
 * If the query is not currently being evaluated, this will force it and it's children to update.
 * TODO: If a query breaks, it could get this.evaluating set to true, and remain stuck (if a callback breaks, etc).
 * TODO: It is possible that a query may need to be forced to update while it is already evaluating. This is not addressed.
 */
// Query.prototype.update = function() {
//     var self = this;

//     if (!this.evaluating){
//         // Resets the query to evaluated=false.
//         // Calls it's widget callback, and tells it's children to update.
//         this.forceUpdate()
//     }
// };

/**
 * Sets query to evaluated=false, calls widget callback (if provided), and informs all children to update.
 */
Query.prototype.update = function() {
    var self = this;
    self.promise = null;

    if (self.widgetCallback) {
        self.widgetCallback();
    }

    let promises = self.children.map((dep, ref) => {
        if (dep.update) {
            return dep.update();
        }
        return Promise.resolve(dep);
    });

    var ready = Promise.resolve(null);
    promises.forEach((promise, i) => {
        ready = ready.then(() => promise);
    });
    return ready;
};

Query.prototype.refresh = function() {
    this.children.forEach( function(child) {
        child.refresh && child.refresh();
    });
};

/**
 * A recursive call that will span the Query DAG, telling each Query to
 * `update()` itself. Eventually, one of those DAG nodes will be a Widget,
 * and the Widget's `update()` method will actually fetch new data.
 */
Query.prototype._update = function() {
    this.children.forEach(child => child._update && child._update());
};

/**
 * Generates documentation from the doc strings of the nodes in it's dependancy graph.
 */
Query.prototype.makeDocs = function() {
    var self = this;
    // Parses the callstack needed to calculated the query. This is either handed to another query or the server.
    var docs = [];
    _.mapValues(self.dependencies, function(arg) { // for each of the dependencies
        var temp = arg.makeDocs().map(function(call) { // copy it's documentation
            if (call.id === 'self') { // rename the reference to 'self'
                call.id = arg.ref;
            }
            return call;
        });
        docs = _.union(temp, docs); // Join the other call stack with the current one
        docs = _.uniq(docs, 'id');
    });

    docs.push({id:'self', func:this.query, doc: this.doc, args: util.defaults(self.urlArgs, self.args)});

    this.docs = JSON.stringify(docs);
    return docs;
};

/**
 * Generate a hash of the current callstack. The hash is used by the server
 * for caching queries.
 * @param {object} query - The query object whose callstack is being hashed.
 * @param {array} calls - The callstack to hash.
 * @return {string} The hash.
 */
Query.prototype.makeHash = function (query, calls) {
    let stringQuery = JSON.stringify(this.query);
    let stringCalls = JSON.stringify(calls);
    let dynahash = util.hash(stringQuery + stringCalls);
    return dynahash;
}

/**
 * Generates a call stack to send to the server that can be used to generate query's data.
 * Loops over function arguments, and if there are queries, included their callstacks into it's own.
 * @filtered if filtered=true, an additional query will be appened to the callstack filtering the result, if filters are defined.
 */
Query.prototype.makeCalls = function(filtered) {
    var self = this;
    // Parses the callstack needed to calculated the query. This is either handed to another query or the server.
    var calls = [];
    _.mapValues(self.dependencies, function(arg) { // for each of the dependencies
        var temp = arg.makeCalls(filtered).map(function(call) { // copy it's call stack
            if (call.id === 'self') { // rename the reference to 'self'
                call.id = arg.ref;
            }
            return call;
        });
        calls = _.union(temp, calls); // Join the other call stack with the current one
        calls = _.uniq(calls, 'id');
    });

    if (filtered && !_.isEmpty(self.filters)) {

        calls.push({
            id: self.ref + 'base',
            query: this.query,
            args: util.defaults(self.urlArgs, self.args),
        });

        // Add a caching hash to the last call in the stack.
        _.last(calls).hash = this.makeHash(this.query, calls);

        // Add a filter_by call, and pass it the query's filter list.
        calls.push({
            id: 'self',
            query: 'core.filter_by',
            args: {
                data: self.ref + 'base',
                where: this.filters,
            },
        });

    } else {
        calls.push({
            id:'self',
            query: this.query,
            args: util.defaults(self.urlArgs, self.args)
        });
    }

    // hash the entire callstack, this will be used for caching
    _.last(calls).hash = this.makeHash(this.query, calls);
    this.calls = calls;

    /**
     * TODO: This is atrocious... Need to think of a smarter way to do this.
     * This reduces modularity by binding the query object to a python function,
     * furthermore this completely overrides the second argument of the function
     * removing the report writers ability to provide their own reference in the
     * kdb namespace.
     */
    if (this.query == 'core.alloc_data'){
        var numCalls = calls.length;
        this.args.hash_ref = 'kdb' + String(this.calls[numCalls - 2].hash).replace('-', '_');
    }

    return calls;
};

/**
 * returns a promise which represents the server request for the queries data.
 * @filtered if filtered=true, an additional query will be appened to the callstack filtering the result, if filters are defined.
 */
Query.prototype.useData = function (filtered) {
    var self = this;
    if (self.promise) {
        return self.promise;
    } else {
        self.promise = self.requestData(filtered);
        return self.promise;
    }
};

/**
 * Posts the call stack to the server to get data for the query.
 * @filtered if filtered=true, an additional query will be appened to the callstack filtering the result, if filters are defined.
 */
Query.prototype.requestData = function(filtered) {
    var self = this;
    return new Promise( function(resolve, reject) {
        var url = '/query/' + NeatApp.getCurrentCase().name + '/';

        util.query(url,
            self.makeCalls(filtered),  // This is the json blob that tells the server what to do
            function (json, status, err) {
                self.data = json; // NECESSARY?
                resolve(json);
            },
            function (xhr, status, err) {
                var response = JSON.parse(xhr.responseText);
                self.error = response.message; // NECESSARY?
                reject(response.message);
                return true;
            });
    });
};

/**
 * Posts the call stack to the server to ger a download of the query data.
 * TODO: xlsx file downloading is a little hacky right now. Saved in local directory.
 * TODO: the download should prompt a "save as" dialog, just like share case.
 * @format string which identifes the type of file being requested. Can be 'csv' or 'xlsx'
 * @report string. Name of the report page. Used in generating file name
 * @name string. Name of the widget or query making request. Used in generating the file name
 */
Query.prototype.requestDownload = function (format, report, name) {
    var self = this;
    report = _.snakeCase(report);
    name = _.snakeCase(name);
    var filename = `${report}-${name}.${format}`;
    filename = encodeURIComponent(filename);
    var url = '/query_output/' + NeatApp.getCurrentCase().name + '/' + filename;

    util.post(url,
        self.makeCalls(),  // This is the json blob that tells the server what to do
        function (response, status, xhr) {
            var type = xhr.getResponseHeader('Content-Type');
            var blob = new Blob([response], { type: type });

            var URL = window.URL || window.webkitURL;
            var downloadUrl = URL.createObjectURL(blob);

            var a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        },
        function (xhr, status, err) {
            return true;
        },
        'text'
    );
};

/**
 * Triggers the gerenation and download of a csv of the query data.
 * @report string. Name of the report page. Used in generating file name
 * @name string. Name of the widget or query making request. Used in generating the file name
 */
Query.prototype.toCsv = function(report, name) {
    this.requestDownload("csv", report, name);
};

/**
 * Triggers the generation and download of an xlsx of the query data.
 * @report string. Name of the report page. Used in generating file name
 * @name string. Name of the widget or query making request. Used in generating the file name
 */
Query.prototype.toXlsx = function(report, name) {
    this.requestDownload("xlsx", report, name);
};

 /**
 * Triggers the gerenation of an iPython notebook of the query callstack.
 * @report string. Name of the report page. Used in generating file name
 * @name string. Name of the widget or query making request. Used in generating the file name
 */
Query.prototype.toNotebook = function(report, name) {
    this.requestDownload("ipynb", report, name);
};

/**
 * Utility function which is short for jsutil.select_columns_rows on query data.
 * TODO: look up argument types and finish this documentation block
 * @cols
 * @rows
 * @cast
 */
Query.prototype.ix = function(cols, rows, cast) {
    var self = this;
    if (typeof rows == 'undefined') {
        rows: null;
    }
    if (typeof cast == 'undefined') {
        cast: false;
    }
    return new Query('jsutil.select_columns_rows', {
        data: self,
        cols: cols,
        rows: rows,
        implicit_cast: cast
    });
};

/**
 * Return a query for getting a single column.
 * @cols
 */
Query.prototype.col = function(...args) {
    var cols = util.ensureArray(...args);
    return this.ix(cols);
};

/**
 * Set the name of the new column created by this query.
 * @param {string} newColumnName - The new name for the new column.
 * @return this query object.
 */
Query.prototype.setName = function(newColumnName) {
    this.args.new_col = newColumnName;
    return this;
};

/**
 * Set the name of the new column created by this query.
 * @param {string} newColumnName - The new name for the new column.
 * @return this query object.
 */
Query.prototype.setDoc = function(docString) {
    this.doc = docString;
    return this;
};

/**
 * Utility fucntion which is short for jsutil.get_value. Selects a value, by index from query result.
 * @x integer (or string of an integer). determines the index of the value returned
 */
Query.prototype.i = function(x) {
    var self = this;
    return new Query('jsutil.get_value', {
        array: self,
        lift: false,
        index: x,
        // doc: '[utility function] selects a value, by index, from the query result'
    });
};

/**
 * Utility fucntion which is short for jsutil.concat which adds an argument to the end of the result of the query (result must be a list)
 * @list list which is concated to the end of the query result
 */
Query.prototype.append = function (list) {
    var self = this;
    return new Query('jsutil.concat', {
        l1: self,
        l2: list,
        // doc: '[utility function] appends argument to the end of a query result'
    });
}

/**
 * Utility fucntion which is short for jsutil.concat which adds an argument to the start of the result of the query (result must be a list)
 * @list list which is concated to the start of the query result
 */
Query.prototype.prepend = function (list) {
    var self = this;
    return new Query('jsutil.concat', {
        l1: list,
        l2: self,
        // doc: '[utility function] appends argument to the begining of a query result'
    });
};

/**
 * Utility fucntion which is short for jsutil.debug.
 * Causes the server to drop into the python debuger after the query is evaluated.
 * TODO: this is probably a security hole.
 */
Query.prototype.debug = function(){
    var self = this;
    return new Query('jsutil.debug', {
        name: this.query,
        args: util.defaults(this.urlArgs, this.args),
        data: this,
        // doc: '[utility function] causes the server to drop into a python debuger (devloper use only)'
    });
}

export default Query;
