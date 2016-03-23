import _ from 'lodash';
import Default from 'reports/components/charts/Timeseries/Default';

export function flagKeyFromConfig(flags) {
    var newFlags = {};
    var key = flags.map((flag, i) => {
        newFlags['flags' + i] = flag.query;
        flag.ref = 'flags' + i;
        return flag;
    });
    return { key, newFlags };
}

export function buildFlags(args, minDate, maxDate) {
    var flags = _.map(args.flagKey, key => {

        var events = args[key.ref];

        if (events && (events.pandas.values.length > 0)) {
            var pd = events.pandas;
            var event_columns = pd.axes.columns.values;
            var date_column = _.filter(event_columns, col => _.includes(col, 'date'))[0];

            var events = _.filter(pd.values, row => (row[date_column] >= minDate) && (row[date_column] <= maxDate));
            events = _.sortBy(events, date_column);

            events = events.map((row, i) => {
                row.x = row[date_column];
                row.text = key.textFn ? key.textFn(row, i) : row.synopsis;
                row.title = i + 1;
                return row;
            });

            var flag = {
                type: 'flags',
                data: events,
                onSeries: key.onSeries,
                name: key.title || key.ref,
                id: key.id
            };

            var optsArr = ['default'];

            if (_.isArray(key.flagOptions)) {
                optsArr = key.flagOptions;
            }

            flag = Default.buildOptions(flag, optsArr, 'flagOptions');

            // if a title is defined at the top level, undefine it for each point
            if (flag.title !== undefined) {
                flag.data = _.map(flag.data, _.partialRight(_.omit, 'title'))
            }

            return flag;
        }
    });

    return _.filter(flags);
}
