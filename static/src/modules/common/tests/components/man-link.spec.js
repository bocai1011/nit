import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ManLink from 'common/components/ManLink';

describe('ManLink', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(ManLink))).to.be.true;
    });
});
