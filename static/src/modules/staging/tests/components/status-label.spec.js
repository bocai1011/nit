import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import StatusLabel from 'staging/components/StatusLabel';

describe('StatusLabel', function () {

    it('should create a valid ReactElement', function () {
        var el = React.createElement(StatusLabel);
        expect(TestUtils.isElementOfType(el, StatusLabel)).be.true;
    });

    it('should render properly', function () {
        var el = React.createElement(StatusLabel, { status: 'warning' });
        var component = TestUtils.renderIntoDocument(el);
        var h4 = TestUtils.findRenderedDOMComponentWithTag(component, 'h4');
        expect(h4.getDOMNode().classList.contains('warning')).be.true;
    });

});
