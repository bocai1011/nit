import _ from 'lodash';
import {
    _parseColumnNames,
    _processSeriesConfigHelper,
    _processSeriesConfig,
    buildSeries
} from 'reports/components/charts/Timeseries/Series';

describe('Series', () => {

    // var ntUtils = new NeatTestUtils(React);

    var sandbox;

    var mapping = {
        sec: {
            0: 'foo',
            1: 'bar'
        }
    };

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });


    describe('_parseColumnNames', () => {
        it('should correctly parse column names', () => {
            var columns = [
                '[{"sec": "0"}, {"variable": "count_tid"}]',
                '[{"sec": "1"}, {"variable": "sum_comm"}]'
            ];
            var result = _parseColumnNames(columns, mapping);
            expect(result).to.eql([
                { name: 'foo ', variable: 'count_tid', column_name: '[{"sec": "0"}, {"variable": "count_tid"}]' },
                { name: 'bar ', variable: 'sum_comm', column_name: '[{"sec": "1"}, {"variable": "sum_comm"}]' },
            ]);
        });
    });


    describe('_processSeriesConfigHelper', () => {

        var seriesConfig = [
            { id: 'asdf', subitems: ['foo'] },
            { id: 'baz', subitems: ['baz'] },
            { id: 'qux', subitems: ['qux', 'corge'] }
        ];

        var data = _.map(['foo','bar','baz','qux','corge'], (v) => {
            return {
                variable: v,
                name: v[0].toUpperCase() + v.slice(1),
                column_name: '_' + v
            };
        });

        it('should build subitems and fill in missing configs', () => {
            var newSeriesConfig = _processSeriesConfigHelper(seriesConfig, data);

            // fills in `bar` configuration
            expect(_.map(newSeriesConfig, 'id')).to.eql(['asdf','baz','qux','bar']);

            // should have correct subitems
            expect(_.map(newSeriesConfig, 'subitems')).to.eql([
                [{ name: 'Foo', id: '_foo', variable: 'foo' }],
                [{ name: 'Baz', id: '_baz', variable: 'baz' }],
                [{ name: 'Qux', id: '_qux', variable: 'qux' },
                 { name: 'Corge', id: '_corge', variable: 'corge' }],
                [{ name: 'Bar', id: '_bar', variable: 'bar' }]
            ]);
        });
    });


    describe('_processSeriesConfig', () => {

        it('should handle data records w/ same variable but different name', () => {
            var seriesConfig = [
                { id: 'foo', subitems: ['foo'] }
            ];
            var data = [
                { variable: 'foo', name: 'sec1', column_name: '_foo' },
                { variable: 'foo', name: 'sec2', column_name: '_foo' }
            ];
            var newSeriesConfig = _processSeriesConfig(seriesConfig, data);
            expect(_.map(newSeriesConfig, 'subitems')).to.eql([
                [{ name: 'sec1', id: '_foo', variable: 'foo' }],
                [{ name: 'sec2', id: '_foo', variable: 'foo' }]
            ]);
        });

        it('should sort data records according to id', () => {
            var seriesConfig = [
                { id: 'foo', subitems: ['foo'] },
                { id: 'bar', subitems: ['bar'] }
            ];
            var data = [
                { variable: 'foo', name: 'sec1', column_name: '_foo' },
                { variable: 'bar', name: 'sec1', column_name: '_bar' },
                { variable: 'foo', name: 'sec2', column_name: '_foo' },
                { variable: 'bar', name: 'sec2', column_name: '_bar' }
            ];
            var newSeriesConfig = _processSeriesConfig(seriesConfig, data);
            expect(_.map(newSeriesConfig, 'subitems')).to.eql([
                [{ name: 'sec1', id: '_bar', variable: 'bar' }],
                [{ name: 'sec2', id: '_bar', variable: 'bar' }],
                [{ name: 'sec1', id: '_foo', variable: 'foo' }],
                [{ name: 'sec2', id: '_foo', variable: 'foo' }]
            ]);
        });
    });


    describe('buildSeries', () => {
        function genFakeData(columns) {
            // generate some fake data
            var values = [];
            for (var i = 0; i < 5; i++) {
                var value = _.reduce(columns, (result, col, j) => {
                    // offset each data value by 100
                    result[col] = j*100 + i;
                    return result;
                }, {});
                values.push(value);
            }

            var xdata = _.map(values, 'date');

            return { xdata, values };
        }

        it('should build series correctly', () => {
            var columns = [
                'date',
                '[{"sec": "0"}, {"variable": "count_tid"}]',
                '[{"sec": "0"}, {"variable": "sum_comm"}]'
            ];
            var { xdata, values } = genFakeData(columns);
            var series = buildSeries(values, columns, xdata, mapping, { view_limit: 20 });
            expect(series.length).to.equal(2);
            expect(_.map(series, 'id')).to.eql(['count_tid', 'sum_comm']);
            expect(_.map(series, 'name')).to.eql(['Number of Transactions', 'Total Commission']);
        });

        it('should prepend names', () => {
            var columns = [
                'date',
                '[{"sec": "0"}, {"variable": "count_tid"}]',
                '[{"sec": "0"}, {"variable": "sum_comm"}]',
                '[{"sec": "1"}, {"variable": "count_tid"}]',
                '[{"sec": "1"}, {"variable": "sum_comm"}]'
            ];
            var { xdata, values } = genFakeData(columns);
            var series = buildSeries(values, columns, xdata, mapping, { view_limit: 20 });
            expect(series.length).to.equal(4);
            expect(_.map(series, 'id')).to.eql(['count_tid', 'count_tid', 'sum_comm', 'sum_comm']);
            expect(_.map(series, 'name')).to.eql([
                'foo : Number of Transactions',
                'bar : Number of Transactions',
                'foo : Total Commission',
                'bar : Total Commission'
            ]);
        });
    });
});