import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ModalOverlay from 'common/components/ModalOverlay';

var el, component;
var testTitle = 'foo';
var sandbox;

describe('ModalOverlay', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // Render the component
        el = React.createElement(ModalOverlay, {
            title: testTitle,
            renderAs: '&nbsp;'
        });
        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should be inactive by default', function() {
        expect(component.state.isModalOpen).to.be.false;
    });

    it('should be toggled on click', function() {
        TestUtils.Simulate.click(component.getDOMNode());
        expect(component.state.isModalOpen).to.be.true;
    });
});
