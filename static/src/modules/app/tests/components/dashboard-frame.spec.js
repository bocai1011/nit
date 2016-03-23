import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import DashboardFrame from 'app/components/DashboardFrame';

describe('DashboardFrame', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(DashboardFrame))).to.be.true;
    });
});
