import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatManual from 'app/pages/Manual/NeatManual';

describe('NeatManual', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(NeatManual))).to.be.true;
    });
});
