import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import StagingUnfinished from 'staging/pages/StagingUnfinished';

describe('StagingUnfinished', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(StagingUnfinished))).to.be.true;
    });
});
