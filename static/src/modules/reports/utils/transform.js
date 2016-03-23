import Query from 'reports/utils/query';
import _ from 'lodash';

/**
 * Transform object (derived from Query)
 * This is a browser side analog to the query object.
 * Instead of parsing it's arguments into a callstack which is sent to the
 *   server to be processed, each argument is processed (sent to the server)
 *   if required, then the callback function is called, given access to the
 *   argument values.
 * @args dictionary of arguments to the transform callback as an object
 * @callback the function called with the argument values.
 */
var Transform = function (args, callback){
    var self = this;

    self.defaultArgs = args;
    self.args = _.clone(args);
    self.urlArgs = [];
    self.deps = [];

    _.forOwn(args, function(arg, i) {
        if (_.has(arg, '__proto__.subscribe')) { // If the argument value is a query
            arg.subscribe(self) // Adding self query as a child of the other
            self.deps.push({ref: i, query: arg});
        }
    });

    self.isTransform = true;
    self.widgetCallback = null;
    self.children = [];
    self.errors = _.clone(args);
    self.data = null;
    self.data_callbacks = [];
    self.callback = callback;
};

Transform.prototype = Object.create(Query.prototype);
Transform.prototype.constructor = Transform;

Transform.prototype.useData = function() {
    var self = this;
    let promises = this.deps.map((dep, ref) => {
        if (_.has(dep, 'query.__proto__.subscribe')) {
            return dep.query.useData();
        }
        return Promise.resolve(dep);
    });

    var results = {
        data: _.clone(self.args),
        errs: {},
    };

    var ready = Promise.resolve(null);
    promises.forEach((promise, i) => {
        ready = ready.then(() => promise)
            .then(function (val) {
                results.data[self.deps[i].ref] = val;
                results.errs[self.deps[i].ref] = false;
            })
            .catch(function (err) {
                results.data[self.deps[i].ref] = false;
                results.errs[self.deps[i].ref] = err;
            });
    });

    return ready.then(() => { return results; });
}

export default Transform;
