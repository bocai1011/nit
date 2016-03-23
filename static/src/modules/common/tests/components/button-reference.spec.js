import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ButtonReference from 'common/components/ButtonReference';

describe('ButtonReference', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(ButtonReference))).to.be.true;
    });
});
