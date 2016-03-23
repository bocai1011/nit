import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Modal } from 'react-bootstrap';
import Notification from 'common/components/Notification';

var sandbox;
var component;
var onRequestHide;

describe('Notification', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        onRequestHide = sandbox.spy();
        component = TestUtils.renderIntoDocument(React.createElement(
            Notification, { onRequestHide: onRequestHide }));
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should render a modal', function() {
        expect(TestUtils.isCompositeComponentWithType(component, Modal));
    });

    function clickButton() {
        var button = TestUtils.findRenderedDOMComponentWithTag(
            component, 'button');
        TestUtils.Simulate.click(button.getDOMNode());
    }

    it('should close on click on OK', function() {
        clickButton();
        expect(component.state.disabled).to.be.true;
    });

    it('should call onRequestHide', function() {
        clickButton();
        expect(onRequestHide).to.have.been.called;
    });

});
