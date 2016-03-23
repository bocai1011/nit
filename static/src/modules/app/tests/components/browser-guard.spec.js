import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Error from 'common/components/Error';
import BrowserGuard from 'app/components/BrowserGuard';

describe('BrowserGuard', function() {

    var el,
        component;

    beforeEach(function () {
        el = React.createElement(BrowserGuard);
        component = TestUtils.renderIntoDocument(el);
    })

    it('should return a react component class', function() {
        expect(TestUtils.isElement(el)).to.be.true;
    });

    it('should render with a class name of "container"', function () {
        expect(component.getDOMNode().classList.contains('container'))
            .to
            .be
            .true;
    });

    it('should create an <Error> element', function () {
        var error = TestUtils.findRenderedComponentWithType(
            component, Error
        );
        expect(error.getDOMNode().textContent)
            .to
            .contain('Please use either Firefox or Chrome');
    });

});
