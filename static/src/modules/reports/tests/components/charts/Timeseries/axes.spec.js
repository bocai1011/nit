import _ from 'lodash';
import { _mapSeriesToAxes, buildAxes } from 'reports/components/charts/Timeseries/Axes';

describe('Axes', () => {

    // var ntUtils = new NeatTestUtils(React);

    var sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });


    describe('buildAxes', () => {


        describe('test series 1', () => {

            var testSeries;

            beforeEach(() => {
                testSeries = [
                    { id: 'foo' },
                    { id: 'bar' },
                    { id: 'baz' }
                ];
            });

            it('should calculate and set correct height, top, and offset', () => {
                var testAxesConfig = [
                    { ids: ['foo'], height: 50 },
                    { ids: ['bar'], height: 10 },
                    { ids: ['baz'], height: 40 }
                ]

                var axes = buildAxes(testSeries, { axesConfig: testAxesConfig });
                expect(axes.length).to.equal(3);
                expect(_.map(axes, 'height')).to.eql(['45%', '5%', '40%']);
                expect(_.map(axes, 'top')).to.eql(['0%', '50%', '60%']);
                expect(_.map(axes, 'offset')).to.eql([0, 0, 0]);
            });

            it('should calculate and set height, top, offset correctly for single axis', () => {
                // no axesConfig => everything on one axis
                var axes = buildAxes(testSeries, {});
                expect(axes.length).to.equal(3);
                expect(_.map(axes, 'height')).to.eql(['100%', '100%', '100%']);
                expect(_.map(axes, 'top')).to.eql(['0%', '0%', '0%']);
                expect(_.map(axes, 'offset')).to.eql([0, 70, 140]);
            });
        });


        describe('test series 2', () => {

            var testSeries;

            beforeEach(() => {
                testSeries = [
                    { id: 'foo' },
                    { id: 'bar' },
                    { id: 'baz' },
                    { id: 'qux' },
                    { id: 'corge'}
                ];
            });

            it('should support partial sharing of axes', () => {
                var testAxesConfig = [
                    { ids: ['foo'], height: 50 },
                    { ids: ['bar','qux','corge'], height: 10, isShared: ['qux', 'corge'] },
                    { ids: ['baz'], height: 40 }
                ];
                var axes = buildAxes(testSeries, { axesConfig: testAxesConfig });
                expect(axes.length).to.equal(4);
                expect(_.map(axes, 'height')).to.eql(['45%', '5%', '5%', '40%']);
                expect(_.map(axes, 'top')).to.eql(['0%', '50%', '50%', '60%']);
                expect(_.map(axes, 'offset')).to.eql([0, 0, 70, 0]);
            });

            it('should support sharing of axes', () => {
                var testAxesConfig = [
                    { ids: ['foo'], height: 50 },
                    { ids: ['bar','qux','corge','baz'], height: 50, isShared: true }
                ];
                var axes = buildAxes(testSeries, { axesConfig: testAxesConfig });
                expect(axes.length).to.equal(2);
                expect(_.map(axes, 'height')).to.eql(['45%', '50%']);
                expect(_.map(axes, 'top')).to.eql(['0%', '50%']);
                expect(_.map(axes, 'offset')).to.eql([0, 0]);
            });

            it('should place unconfigured series on first axis', () => {
                var testAxesConfig = [
                    { ids: ['foo'], height: 50 },
                    { ids: ['bar'], height: 10 },
                    { ids: ['baz'], height: 40 }
                ];
                var axes = buildAxes(testSeries, { axesConfig: testAxesConfig });
                expect(axes.length).to.equal(5);
                expect(_.map(axes, 'height')).to.eql(['45%', '45%', '45%', '5%', '40%']);
                expect(_.map(axes, 'top')).to.eql(['0%', '0%', '0%', '50%', '60%']);
                expect(_.map(axes, 'offset')).to.eql([0, 70, 140, 0, 0]);
            });
        });


        describe('test series 3', () => {

            var testSeries;
            var testAxesConfig;
            var axes;

            beforeEach(() => {
                testSeries = [
                    { id: 'foo', variable: 'foo_name' },
                    { id: 'bar', variable: 'bar_name' },
                    { id: 'baz', variable: 'baz_name' },
                    { id: 'qux', type: 'flags', variable: 'qux_name' },
                    { id: 'corge', variable: 'corge_name'}
                ];
                testAxesConfig = [
                    { ids: ['foo', 'bar'], height: 50 },
                    { ids: ['qux','corge','baz'], height: 50 }
                ];
                axes = buildAxes(testSeries, { axesConfig: testAxesConfig });
            });

            it('should set a name using the `variable` property', () => {
                expect(_.map(_.map(axes, 'title'), 'text')).to.eql([
                    'Foo Name', 'Bar Name', 'Qux Name', 'Corge Name', 'Baz Name']);
            });

            it('should calculate and set height, top, offset correctly for flags', () => {
                expect(axes.length).to.equal(5);
                expect(_.map(axes, 'height')).to.eql(['45%', '45%', '50%', '50%', '50%']);
                expect(_.map(axes, 'top')).to.eql(['0%', '0%', '50%', '50%', '50%']);
                expect(_.map(axes, 'offset')).to.eql([0, 70, 0, 0, 70]);
            });
        });
    });


    describe('_mapSeriesToAxes', () => {

        var testIdGroups;
        var testSeries;

        beforeEach(() => {
            testSeries = [
                { id: 'foo' },
                { id: 'bar' },
                { id: 'baz' },
                { id: 'qux' },
                { id: 'corge'}
            ];
        });

        it('should return default indices if no idGroups provided', () => {
            var axesIndices = _mapSeriesToAxes(testSeries, []);
            expect(axesIndices).to.eql([0, 0, 0, 0, 0]);
        });


        describe('with complete group config', () => {
            beforeEach(() => {
                testIdGroups = [
                    ['qux', 'bar'],
                    ['foo'],
                    ['baz', 'corge']
                ];
            });

            it('should return array of axes indices', () => {
                var axesIndices = _mapSeriesToAxes(testSeries, testIdGroups);
                expect(axesIndices).to.eql([0, 0, 1, 2, 2]);
            });

            it('should modify series param to match axes ordering', () => {
                _mapSeriesToAxes(testSeries, testIdGroups);
                expect(testSeries).to.eql([
                    { id: 'qux' },
                    { id: 'bar' },
                    { id: 'foo' },
                    { id: 'baz' },
                    { id: 'corge'}
                ]);
            });
        });


        describe('with incomplete group config', () => {
            beforeEach(() => {
                testIdGroups = [
                    ['baz'],
                    ['foo']
                ];
            });

            it('should return array of axes indices w/ unconfigured series in 1st axis', () => {
                var axesIndices = _mapSeriesToAxes(testSeries, testIdGroups);
                expect(axesIndices).to.eql([0, 0, 0, 0, 1]);
            });

            it('should modify series param to match axes ordering w/ unconfigured series unshifted in', () => {
                _mapSeriesToAxes(testSeries, testIdGroups);
                expect(testSeries).to.eql([
                    { id: 'corge'},
                    { id: 'qux' },
                    { id: 'bar' },
                    { id: 'baz' },
                    { id: 'foo' }
                ]);
            });
        });
    });
});