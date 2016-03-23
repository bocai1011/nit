import _ from 'lodash';
import { flagKeyFromConfig, buildFlags } from 'reports/components/charts/Timeseries/Flags';
import Default from 'reports/components/charts/Timeseries/Default';

describe('Flags', () => {

    // var ntUtils = new NeatTestUtils(React);

    var sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('flagKeyFromConfig', () => {
        it('should create a flattened mapping for flag configs', () => {
            var query1 = {};
            var query2 = {};
            var flags = [
                { query: query1 },
                { query: query2 }
            ];
            var { key, newFlags } = flagKeyFromConfig(flags);
            expect(key).to.eql([
                { query: query1, ref: 'flags0' },
                { query: query2, ref: 'flags1' },
            ]);
            expect(newFlags).to.eql({
                flags0: query1,
                flags1: query2
            });
        });
    });


    describe('buildFlags', () => {

        var args;

        beforeEach(() => {
            args = {
                flags0: {
                    pandas: {
                        axes: {
                            columns: {
                                values: ['date', 'synopsis']
                            }
                        },
                        values: [
                            { date: 1, synopsis: 'synopsis1' },
                            { date: 2, synopsis: 'synopsis2' }
                        ]
                    }
                },
                flagKey: [{ ref: 'flags0' }]
            }
        });

        it('should create data items correctly', () => {
            var flag = buildFlags(args, 0, 3)[0];
            expect(_.map(flag.data, 'x')).to.eql([1, 2]);
            expect(_.map(flag.data, 'text')).to.eql(['synopsis1', 'synopsis2']);
            expect(_.map(flag.data, 'title')).to.eql([1, 2]);
        });

        it('should support a textFn property to modify event data', () => {
            args.flagKey[0].textFn = ((t) => t.synopsis.toUpperCase());
            var flag = buildFlags(args, 0, 3)[0];
            expect(_.map(flag.data, 'text')).to.eql(['SYNOPSIS1', 'SYNOPSIS2']);
        });

        it('should apply configuration based on flagOptions', () => {
            // assumes an `mna` property exists under Default.flagOptions
            args.flagKey[0].flagOptions = ['mna'];
            var flag = buildFlags(args, 0, 3)[0];

            // .title property in flag object should be set to title
            expect(flag.title).to.equal('M&A');
            expect(flag.shape).to.equal('squarepin');

            // .title property in data item should be undefined
            expect(_.map(flag.data, 'title')).to.eql([undefined, undefined]);
        });
    });
});