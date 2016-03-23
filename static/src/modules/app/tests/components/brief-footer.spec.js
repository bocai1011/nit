import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import BriefFooter from 'app/components/BriefFooter';

describe('BriefFooter', function() {

    var el,
        component;

    beforeEach(function () {
        el = React.createElement(BriefFooter);
        component = TestUtils.renderIntoDocument(el);
    })

    it('should return a react component class', function() {
        expect(TestUtils.isElement(el)).to.be.true;
    });

    it('should render a title for NEAT', function () {
        var header = TestUtils.findRenderedDOMComponentWithTag(
            component,
            'h4'
        );
        expect(header.getDOMNode().textContent).to.equal(
            'The National Exam Analytics Tool'
        );
    });

    it('should get a class name of "brief-footer"', function () {
        expect(component.getDOMNode().classList.contains('brief-footer'))
            .to
            .be
            .true;
    });

});
