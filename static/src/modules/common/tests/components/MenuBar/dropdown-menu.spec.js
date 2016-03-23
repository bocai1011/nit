import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import DropdownMenu from 'common/components/MenuBar/DropdownMenu';

var component;
var ntUtils = new NeatTestUtils(React);
var sandbox = sinon.sandbox.create();

describe('DropdownMenu', function () {

    beforeEach(function () {
        var submenuItems = [
            { label: 'Sub Marine', quickKey:'M', url: 'other-page' },
            { label: 'Sub Way', quickKey:'W', url: 'other-page' },
            { label: 'Sub Optimal', quickKey:'O', url: 'other-page' },
        ];

        component = ntUtils.renderWithContext(DropdownMenu, {
            props: {
                name: 'Harold',
                quickKey: 'H',
                subitems: submenuItems,
                expandedMenu: null,
            },
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should collapse/uncollapse the menu with _toggleCollapse()',
        function () {
            var domNode = component.getDOMNode();
            domNode.classList.contains('collapsed').should.be.true;
            component._toggleCollapse();
            domNode.classList.contains('collapsed').should.be.false;
            component._toggleCollapse();
            domNode.classList.contains('collapsed').should.be.true;
        }
    );

    it('should collapse after 450ms on _delayedCollapse', function () {
        sandbox.useFakeTimers();

        component._toggleCollapse();
        expect(component.state.isExpanded).to.be.true;
        component._delayedCollapse();
        sandbox.clock.tick(400);
        expect(component.state.isExpanded).to.be.true;
        sandbox.clock.tick(55);
        expect(component.state.isExpanded).to.be.false;
    });

    it('should transition pages _onClick()', function () {
        var transitionSpy = sandbox.spy();
        var props = {
            name: 'Quentin',
            key: 'Q',
            to: 'the-moon',
            params: { apollo: 13 },
        };

        component = ntUtils.renderWithContext(DropdownMenu, {
            transitionTo: transitionSpy,
            props: props,
        });

        var div = TestUtils.findRenderedDOMComponentWithTag(
            component, 'div'
        );

        TestUtils.Simulate.click(div);
        expect(transitionSpy).to.have.been.calledWith(
            props.to, props.params
        );

    });

    it('should render a tooltip on hover after 350ms', function () {
        sandbox.useFakeTimers();

        // https://github.com/facebook/react/issues/1297
        TestUtils.SimulateNative.mouseOver(component.getDOMNode());
        expect(component.state.showTooltip).to.be.false;
        sandbox.clock.tick(355);
        expect(component.state.showTooltip).to.be.true;
    });

    it('should hide the tooltip when the mouse leaves', function () {
        sandbox.useFakeTimers();
        var domNode = component.getDOMNode();
        TestUtils.SimulateNative.mouseOver(domNode);
        sandbox.clock.tick(355);
        expect(component.state.showTooltip).to.be.true;
        TestUtils.SimulateNative.mouseOut(domNode);
        expect(component.state.showTooltip).to.be.false;
    });

    it('should prevent collapse when focuses', function () {
        sandbox.spy(component, '_preventCollapse');
        var ul = TestUtils.findRenderedDOMComponentWithTag(component, 'ul');
        TestUtils.Simulate.focus(ul);
        expect(component._preventCollapse).to.have.been.called;
    });

    it('should collapse after 450ms when the mouse leaves', function () {
        sandbox.useFakeTimers();
        var ul = TestUtils.findRenderedDOMComponentWithTag(component, 'ul');
        TestUtils.Simulate.focus(ul);
        expect(component.state.isExpanded).to.be.true;
        TestUtils.SimulateNative.mouseOut(ul);
        sandbox.clock.tick(455);
        expect(component.state.isExpanded).to.be.false;
    });

    it('should collapse after 450ms when it loses focus', function () {
        sandbox.useFakeTimers();
        var ul = TestUtils.findRenderedDOMComponentWithTag(component, 'ul');
        TestUtils.Simulate.focus(ul);
        expect(component.state.isExpanded).to.be.true;
        TestUtils.Simulate.blur(ul);
        sandbox.clock.tick(455);
        expect(component.state.isExpanded).to.be.false;
    });

    it('should collapse the menu when a MenuItem is clicked', function () {
        sandbox.useFakeTimers();
        var clickSpy = sandbox.spy();
        component.setState({ isExpanded: true });
        component._clickMenuItem({
            onClick: clickSpy,
        });

        expect(component.state.isExpanded).to.be.false;
        sandbox.clock.tick(5);
        expect(clickSpy).to.have.been.called;
    });

});
