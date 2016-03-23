import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Error from 'common/components/Error';

var sandbox;

describe('Error', function() {

    var el, component;
    var descriptionMsg = 'foo';
    var errorMsg = 'bar';

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // Render the component
        el = React.createElement(Error, {
            description: descriptionMsg,
            error: errorMsg,
            mailto: false
        });
        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should render the description', function() {
        var ps = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'p');
        expect(ps[0].getDOMNode().textContent).to.contain(descriptionMsg);
    });

    it('should render the error message', function() {
        var pre = TestUtils.findRenderedDOMComponentWithTag(
            component, 'pre');
        expect(pre.getDOMNode().textContent).to.contain(errorMsg);
    });

    it('should render the mailto text', function() {
        // TODO mailto not working due to " ".format failing
    });
});
