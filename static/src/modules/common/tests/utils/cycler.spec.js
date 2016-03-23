import _ from 'lodash';
import Cycler from 'common/utils/cycler';

describe('cycler', () => {

    var sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('_deepMapValues', () => {
        it('should callback on arrays to be cycled', () => {
            var toCycle = [1, 2, 3];
            var testObj = {
                foo: { a: 1 },
                bar: { _baz: toCycle }
            };

            var spyCb = sandbox.spy();

            var cycler = new Cycler();
            cycler._deepMapValues(testObj, spyCb);

            expect(spyCb.args[0][0]).to.equal(toCycle);
            expect(spyCb.args[0][1]).to.eql(['bar', '_baz']);
        });
    });

    describe('get', () => {
        it('should cycle through objects', () => {
            var toCycle = ['a', 1, 2.5, [20, 40], {}];

            class MyCycler extends Cycler {
                constructor() {
                    super();
                    this.testObj = {
                        foo: { a: 1 },
                        bar: { _baz: toCycle }
                    };
                }
            };

            var myCycler = new MyCycler();

            for (var i = 0; i < 5; i++) {  // test cycling 5 times through

                // for each call to `get` test we get next element from toCycle
                _.forEach(toCycle, (j) => {
                    expect(myCycler.get('testObj')).to.eql({
                        foo: { a: 1 },
                        bar: { _baz: toCycle, baz: j }
                    });
                });
            }
        });
    });

    describe('buildOptions', () => {

        var myCycler;

        beforeEach(() => {
            class MyCycler extends Cycler {
                constructor() {
                    super();
                    this.topItem = {
                        foo: {
                            a: 1,
                            b: 'bfoo'
                        },
                        bar: {
                            a: 2,
                            b: 'bbar'
                        },
                        deep: {
                            deeper: {
                                deepest: {
                                    a: 10,
                                    b: 20
                                }
                            }
                        }
                    }
                }
            }
            myCycler = new MyCycler();
        });

        it('should ', () => {
            var result = myCycler.buildOptions({}, ['foo', 'bar'], 'topItem');
            expect(result).to.eql({ a: 1, b: 'bfoo' });
        });

        it('should ', () => {
            var result = myCycler.buildOptions({}, ['bar', 'foo'], 'topItem');
            expect(result).to.eql({ a: 2, b: 'bbar' });
        });

        it('should apply defaults deeply', () => {
            var result = myCycler.buildOptions({
                a: 'inita',
                deeper: {
                    b: 'initb',
                    deepest: {
                        c: 'initc'
                    }
                }
            }, ['deep'], 'topItem');

            expect(result).to.eql({
                a: 'inita',
                deeper: {
                    b: 'initb',
                    deepest: {
                        a: 10,
                        b: 20,
                        c: 'initc'
                    }
                }
            });
        });
    })
});