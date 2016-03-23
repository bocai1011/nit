import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import RefData from 'staging/pages/RefData';

describe('RefData', function () {
    it('should create a valid ReactElement', function () {
        var el = React.createElement(RefData);
        expect(TestUtils.isElementOfType(el, RefData)).to.be.true;
    });
});
