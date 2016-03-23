import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Icon from 'common/components/Icon';

describe('Icon', function() {
    it('should render the popover message', function() {
        var msg = 'foo';
        var el = React.createElement(Icon, {
            data: {
                message: msg,
                icon: 'okay'
            }
        });
        var component = TestUtils.renderIntoDocument(el);
        var span = TestUtils.findRenderedDOMComponentWithClass(
            component, 'hide508');
        expect(span.getDOMNode().textContent).to.equal(msg);
    });
});
