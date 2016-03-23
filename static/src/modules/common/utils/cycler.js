import _ from 'lodash';

/**
 * Cycler is an abstract base class that provides a simple "cycling"
 * behavior for subclasses. That is, when the client retrieves a property
 * from a cycler class it can alternate between a set of options.
 *
 * To declare the options the cycler subclass should define cycle-able
 * properties with a leading underscore (_). e.g. we can declare a subclass
 * like so:
 *
 * class SubCycler extends Cycler {
 *    constructor() {
 *       super();
 *       this.myOptions = {
 *           opts1: {
 *               _color: ['red', 'blue'],
 *               _height: [10, 20],
 *               width: 50
 *           }
 *           ...
 *       };
 *   ...
 *   }
 *
 * When the client goes to retrieve opts1 it will have alternating values
 * for the opts1 propteries on each call. Properties with leading underscore
 * will be replaced with a non-leading underscore version and the next option
 * from the list, e.g.
 *
 * > var sub = new SubCycler();
 * > sub.get('myOptions', 'opts1');
 * { color: 'red', height: 10, width: 50 }
 * > sub.get('myOptions', 'opts1');
 * { color: 'blue', height: 20, width: 50 }
 *
 */

class Cycler {

    constructor() {
        this.cpi = {};
    }

    /**
     * Deep traverse an object calling callbacks
     *   adapted from https://github.com/marklagendijk/lodash-deep
     */
    _deepMapValues(object, callback, propertyPath){
        var self = this;
        propertyPath = propertyPath || [];

        var toCycle = (_.startsWith(_.last(propertyPath), '_') &&
            _.isArray(object));

        if (toCycle) {
            return callback(object, propertyPath);
        } else if (_.isArray(object)) {
            return _.map(object, deepMapValuesIteratee);
        } else if (_.isPlainObject(object)) {
            return _.extend({}, object, _.mapValues(object, deepMapValuesIteratee));
        }

        function deepMapValuesIteratee(value, key){
            var valuePath = propertyPath.concat(key);
            return self._deepMapValues(value, callback, valuePath);
        }
    }

    get() {
        var self = this;
        var args = _.toArray(arguments);
        var path = args.join('.');
        var subObj = _.get(this, path);
        var newObj = _.cloneDeep(subObj);

        self._deepMapValues(subObj, function(subArray, subPath) {
            // remove the underscore
            subPath.push(subPath.pop().slice(1));
            var strPath = subPath.join('.');
            var fullPath = path + '.' + strPath;

            if (_.isUndefined(self.cpi[fullPath])) {
                self.cpi[fullPath] = 0;
            }

            _.set(newObj, strPath, subArray[self.cpi[fullPath]]);
            self.cpi[fullPath] = (self.cpi[fullPath]+1)%subArray.length;
        });

        return newObj;
    }

    /**
     * This is a helper method for doing several calls to _.defaultsDeep
     * @param startOpts the starting options object
     * @param optsArr an array of property names within this[optsItem] to
     *   iterate through and pass to defaultsDeep
     * @param optsItem the top-level object to look find defaults from, i.e.
     *   this[optsItem] should exist
     * @returns the startOpts object after several calls to _.defaultsDeep
     */
    buildOptions(startOpts, optsArr, optsItem) {
        if (!_.isArray(optsArr)) {
            return startOpts;
        }
        var self = this;
        return _.reduce(optsArr, function(result, opts) {
            if (_.isString(opts)) {
                // user provides a key to predefined default opts
                return _.defaultsDeep(result, self.get(optsItem, opts));

            } else if (_.isObject(opts)) {
                // user provides configuration object
                return _.defaultsDeep(result, opts);
            }

        }, startOpts);
    }
};

export default Cycler;