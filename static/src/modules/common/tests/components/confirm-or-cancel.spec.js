import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ConfirmOrCancel from 'common/components/ConfirmOrCancel';

var sandbox;

describe('ConfirmOrCancel', function() {

    var component, el;
    var title = 'foo';
    var confirmFunc, onRequestHideFunc;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // Setup function spies
        confirmFunc = sandbox.spy();
        onRequestHideFunc = sandbox.spy();

        // Render the component
        el = React.createElement(ConfirmOrCancel, {
            title: title,
            confirm: confirmFunc,
            onRequestHide: onRequestHideFunc
        });

        // TODO need to either create a document requirejs wrapper, or refactor
        // ConfirmOrCancel to not use document at all
        sandbox.stub(document, 'getElementById', function() {
            return {
                focus: function() {}
            };
        });

        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should render the title correctly', function() {
        var titleComp = TestUtils.findRenderedDOMComponentWithClass(
            component, 'modal-title');
        expect(titleComp.getDOMNode().textContent).to.equal(title);
    });

    it('should call confirm() on click', function() {
        // Note: spying on component.confirm directly does not seem to work
        sandbox.spy(confirmFunc);
        var btns = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button');
        TestUtils.Simulate.click(btns[1].getDOMNode());
        expect(confirmFunc).to.have.been.called;
    });

    it('should call cancel() on click', function() {
        // Note: spying on component.cancel directly does not seem to work
        sandbox.spy(onRequestHideFunc);
        var btns = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button');
        TestUtils.SimulateNative.click(btns[2].getDOMNode());
        expect(onRequestHideFunc).to.have.been.called;
    });
});
