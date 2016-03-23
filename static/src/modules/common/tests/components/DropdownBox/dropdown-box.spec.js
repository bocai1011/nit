import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import DropdownBox from 'common/components/DropdownBox/DropdownBox';

var sandbox;

var toggleDropdown = function(component) {
    var btn = TestUtils.findRenderedDOMComponentWithTag(
        component, 'button');

    // need focus + click, just calling click alone doesnt seem to work
    TestUtils.Simulate.focus(btn.getDOMNode());
    TestUtils.Simulate.click(btn.getDOMNode());
};

describe('DropdownBox', function() {

    var el, component;
    var options = ['opt1', 'opt2'];

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        el = React.createElement(DropdownBox, {
            value: 'foo',
            options: options
        });
        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should call _createDropdown on click', function() {
        sandbox.spy(component, '_createDropdown');
        toggleDropdown(component);
        expect(component._createDropdown).to.have.been.called;
    });

    it('should call _onSelect on selection', function() {
        sandbox.spy(component, '_onSelect');
        toggleDropdown(component);
        var anchors = TestUtils.scryRenderedDOMComponentsWithTag(component, 'a');
        TestUtils.Simulate.focus(anchors[0].getDOMNode());
        TestUtils.Simulate.click(anchors[0].getDOMNode());
        expect(component._onSelect).to.have.been.called;
    });

    it('should render X number of options on click', function() {
        toggleDropdown(component);
        var anchors = TestUtils.scryRenderedDOMComponentsWithTag(component, 'a');
        expect(anchors.length).to.equal(options.length);
    });

    it('should de-render options on toggle', function() {
        toggleDropdown(component);
        toggleDropdown(component);
        var anchors = TestUtils.scryRenderedDOMComponentsWithTag(component, 'a');
        expect(anchors.length).to.equal(0);
    });
});

describe('DropdownBox with Submenus', function() {

    var el, component;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        el = React.createElement(DropdownBox, {
            value: 'foo',
            options: [{
                name:'opt1',
                options: ['subOpt1', 'subOpt2']
            }, {
                name:'opt2',
                options: ['subOpt3', 'subOpt4']
            }]
        });
        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should setActiveSubmenu', function() {
        expect(component._getActiveSubmenu()).to.be.null;
        toggleDropdown(component);
        var lis = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');
        TestUtils.Simulate.focus(lis[0].getDOMNode());
        expect(component._getActiveSubmenu().getDOMNode()).to.equal(
            lis[0].getDOMNode());
    });

    it('should switch active submenu', function() {
        expect(component._getActiveSubmenu()).to.be.null;
        toggleDropdown(component);
        var lis = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');
        TestUtils.Simulate.focus(lis[0].getDOMNode());
        var oldActiveSubmenu = component._getActiveSubmenu();
        // focus on item at index 3 since we render subitems as li's as
        // well, so the index 1 & 2 are suboptions to the first option
        var li3 = lis[3].getDOMNode();
        TestUtils.Simulate.focus(li3);
        expect(component._getActiveSubmenu()).to.not.equal(oldActiveSubmenu);
        expect(component._getActiveSubmenu().getDOMNode()).to.equal(li3);
    });
});
