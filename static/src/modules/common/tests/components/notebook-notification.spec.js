import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Modal } from 'react-bootstrap';
import util from 'common/utils/util';
import NotebookNotification from 'common/components/NotebookNotification';

var sandbox = sinon.sandbox.create();

describe('NotebookNotification', function() {

    afterEach(function () {
        sandbox.restore();
    });

    it('should POST to \'/start_notebook/\' on init', function() {
        sandbox.stub(util, 'post', function(_r, _d, _cb) { _cb(); });
        var el = React.createElement(NotebookNotification);
        TestUtils.renderIntoDocument(el);
        expect(util.post).to.have.been.calledWith('/start_notebook/');
    });

    it('should set disabled state to true and hide on button click',
        function () {
            var el = React.createElement(NotebookNotification, {
                onRequestHide: sandbox.spy(),
            });
            var component = TestUtils.renderIntoDocument(el);

            var btn = TestUtils.findRenderedDOMComponentWithTag(
                component, 'button'
            );

            expect(component.state.disabled).be.false;
            TestUtils.Simulate.click(btn);
            expect(component.state.disabled).be.true;
            expect(component.props.onRequestHide).been.called;
        }
    );

    it('should render a modal', function() {
        var el = React.createElement(NotebookNotification);
        var component = TestUtils.renderIntoDocument(el);
        expect(TestUtils.isCompositeComponentWithType(component, Modal));
    });
});
