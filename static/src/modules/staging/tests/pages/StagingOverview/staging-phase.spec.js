import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import StagingPhase from 'staging/pages/StagingOverview/StagingPhase';

var ntUtils = new NeatTestUtils(React);

describe('StagingPhase', function () {

    it('should create a valid ReactElement', function () {
        var el = React.createElement(StagingPhase);
        expect(TestUtils.isElementOfType(el, StagingPhase)).to.be.true;
    });

    it('should properly render', function () {
        ntUtils.stubCurrentCase(NeatApp, {
            name: 'Casey',
            status: 'unlocked',
        });

        var component = ntUtils.renderWithContext(StagingPhase, {
            props: {
                info: {
                    link: 'stringy',
                    name: 'string-a-ling',
                    state: 0,
                    title: 'put a string on it',
                },
                phase: {
                    statusCode: 'inactive',
                    status: 'stringo starr',
                },
            },
        });

        expect(component.getDOMNode().classList.contains('panel')).be.true;
    });

});
