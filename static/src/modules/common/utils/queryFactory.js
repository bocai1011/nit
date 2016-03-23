import _ from 'lodash';
import Query from 'reports/utils/query';
import queryManifest from 'reports/utils/query-manifest.json';

var queries = {};

_.forEach(queryManifest, function(queryClassCollection, queryClass) {

    var queryFuncs = queries[queryClass] = {};

    _.forEach(queryClassCollection, function(queryMeta, queryName) {
        queryFuncs[queryName] = function(args, callback) {

            // Check if user passed in an unsupported param.
            var metaKeys = _.without(Object.keys(queryMeta), 'return');
            metaKeys.push('ref');
            metaKeys.push('doc');
            metaKeys.push('docs');

            var diff = _.difference(Object.keys(args), metaKeys);
            if (diff.length > 0) {
                throw Error('Unsupported args: '+ diff.join(', '));
            }

            var queryStr = [queryClass, queryName].join('.');
            var query = new Query(queryStr, args, callback);
            query.queryMeta = queryMeta;
            query.queryName = queryName;
            return query;
        };
    });
});

export default queries;
