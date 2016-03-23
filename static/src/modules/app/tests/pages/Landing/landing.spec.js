import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Landing from 'app/pages/Landing/Landing';

describe('Landing', function() {

    it('should return a react component class', function() {
        expect(TestUtils.isElement(React.createElement(Landing)))
            .to.be.true;
    });

    it('should render', function () {
        var el = React.createElement(Landing);
        var component = TestUtils.renderIntoDocument(el);
        var h1 = TestUtils.findRenderedDOMComponentWithTag(
            component,
            'h1'
        );

        expect(h1).to.exist;
    });
});
