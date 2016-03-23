import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Error from 'app/pages/Error';

describe('Error', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(Error))).to.be.true;
    });
});
