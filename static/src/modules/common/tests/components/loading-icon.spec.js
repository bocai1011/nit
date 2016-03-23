import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import LoadingIcon from 'common/components/LoadingIcon';

describe('LoadingIcon', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(LoadingIcon))).to.be.true;
    });
});
