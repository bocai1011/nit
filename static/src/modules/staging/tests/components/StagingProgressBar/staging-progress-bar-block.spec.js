import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import StagingProgressBarBlock from 'staging/components/StagingProgressBar/StagingProgressBarBlock';

var component;

var ntUtils = new NeatTestUtils(React);
var sandbox = sinon.sandbox.create();

describe('StagingProgressBarBlock', function () {

    beforeEach(function () {

        sandbox.stub(NeatApp, 'getCurrentCase', function () {
            return { name: 'KFC' };
        });

        component = ntUtils.renderWithContext(StagingProgressBarBlock, {
            routes: [{ name: 'overview' }],
            props: {
                info: {
                    name: 'RegistrantFiles',
                    title: 'Yes',
                    link: 'what',
                    stage: 1,
                },
                guard: true,
                phase: {
                    statusCode: 'inactive',
                },
            }
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should toggle the modal open and closed', function () {
        var a = TestUtils.findRenderedDOMComponentWithClass(
            component, 'progress-unavailable'
        );

        expect(component.state.isModalOpen).be.false;
        TestUtils.Simulate.click(a);
        expect(component.state.isModalOpen).be.true;
    });

    it('#_stage() should return a number representing current stage',
        function () {
            expect(component._stage()).to.equal(0);
        }
    );

    it('#_stageClass() should return a className based on current stage',
        function () {
            expect(component._stageClass(0)).to.equal(
                'progress-here progress-unavailable'
            );
        }
    );

});
