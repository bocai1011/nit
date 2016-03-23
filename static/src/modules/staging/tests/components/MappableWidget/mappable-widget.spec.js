import _ from 'lodash';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import MappableWidget from 'staging/components/MappableWidget/MappableWidget';

var sandbox;

describe('MappableWidget', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // Stub out ItemNameMap or else DropdownBox complains
        sandbox.stub(NeatApp, 'ItemNameMap', function() { return null; });
        sandbox.stub(NeatApp, 'isLocked', function() { return false; });
        sandbox.stub(NeatApp, 'caseName', function() { return 'test'; });
    });

    afterEach(function () {
        sandbox.restore();
    });

    function toObj(val) {
        return {
            name: val,
            code: val
        };
    }

    function renderHelper(props) {
        var el = React.createElement(MappableWidget, props);
        return TestUtils.renderIntoDocument(el);
    }

    it('should display text blurb when no values provided', function() {
        var component = renderHelper({ values: [] });
        var textBlurb = TestUtils.findRenderedDOMComponentWithTag(
            component, 'p');
        expect(textBlurb.getDOMNode().textContent.toLowerCase()).contains(
            'we didn\'t find');
    });

    it('should display X rows for each value provided', function() {
        var vals = ['val1', 'val2', 'val3'];
        var component = renderHelper({
            values: _.map(vals, toObj),
            options: _.map(vals, toObj)
        });
        var rows = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'tr');
        expect(rows.length).to.equal(vals.length);
    });

    it('should propagate onSelect call from Dropdown back to table', function() {
        var vals = ['val1'];
        var props = {
            values: _.map(vals, toObj),
            options: _.map(['opt1', 'opt2'], toObj),
            onSelect: sandbox.spy()
        };
        var component = renderHelper(props);

        // Toggle the dropdown
        var btns = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button');
        TestUtils.Simulate.focus(btns[0].getDOMNode());
        TestUtils.Simulate.click(btns[0].getDOMNode());

        // Simulate click
        var anchors = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'a');
        TestUtils.Simulate.click(anchors[0].getDOMNode());
        expect(props.onSelect).to.have.been.called;
    });
});
