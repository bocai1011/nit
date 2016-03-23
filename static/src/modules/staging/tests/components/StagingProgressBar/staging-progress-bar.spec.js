import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import StagingProgressBar from 'staging/components/StagingProgressBar/StagingProgressBar';

var ntUtils = new NeatTestUtils(React);

var sandbox = sinon.sandbox.create();

describe('StagingProgressBar', function () {
    it('should create a valid ReactElement', function () {
        var el = React.createElement(StagingProgressBar);
        expect(TestUtils.isElementOfType(el, StagingProgressBar)).be.true;
    });

    it('should render correctly', function () {
        sandbox.stub(NeatApp, 'getCurrentCase', function () {
            return {
                stagingPhases: [
                    { statusCode: 'inactive' }
                ],
            };
        });

        var component = ntUtils.renderWithContext(StagingProgressBar);
        expect(component.getDOMNode().tagName).to.equal('SPAN');
        sandbox.restore();
    });

});
