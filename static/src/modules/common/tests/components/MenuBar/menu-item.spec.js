import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import MenuItem from 'common/components/MenuBar/MenuItem';

var sandbox;

describe('MenuItem', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should call onClick handler from props', function() {
        var props = {
            onClick: sandbox.spy()
        };
        var el = React.createElement(MenuItem, props);
        var component = TestUtils.renderIntoDocument(el);

        var anchor = TestUtils.findRenderedDOMComponentWithTag(component, 'a');
        TestUtils.Simulate.click(anchor.getDOMNode());
        expect(props.onClick).to.have.been.called;
    });

    it('should call own onClick handler', function() {
        var el = React.createElement(MenuItem, { to: 'foo' });
        var component = TestUtils.renderIntoDocument(el);
        sandbox.stub(component, 'transitionTo', function() {});

        var anchor = TestUtils.findRenderedDOMComponentWithTag(component, 'a');
        TestUtils.Simulate.click(anchor.getDOMNode());
        expect(component.transitionTo).to.have.been.called;
    });
});
