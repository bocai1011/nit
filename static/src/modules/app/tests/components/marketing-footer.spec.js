import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import MarketingFooter from 'app/components/MarketingFooter';

describe('MarketingFooter', function() {
    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(MarketingFooter))).to.be.true;
    });

    it('should render a marketing footer', function () {
        var el = React.createElement(MarketingFooter);
        var component = TestUtils.renderIntoDocument(el);
        var domNode = component.getDOMNode();
        expect(domNode.id).to.equal('aboutNEAT');
    });
});
