import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import About from 'app/pages/About';

describe('About', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(About))).to.be.true;
    });
});
