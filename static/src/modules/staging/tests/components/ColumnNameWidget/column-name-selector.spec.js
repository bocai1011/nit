import $ from 'jquery';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import ColumnNameSelector from 'staging/components/ColumnNameWidget/ColumnNameSelector';

describe('ColumnNameSelector', function() {

    var sandbox;
    var ntUtils = new NeatTestUtils(React);

    // Reference to mocked data is here so we can re-assign in testcases
    var props;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(NeatApp, 'ItemNameMap', function(x) { return x; });

        // Restore default mocked data values
        props = {
            column: {},
            selectors: [],
            onChange: sandbox.spy()
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    function renderHelper() {
        var parentEl = $('<table><tbody></tbody></table>')[0];

        return ntUtils.renderIntoDocument(
            parentEl,
            React.createElement(ColumnNameSelector, props));
    }

    /**
     * Toggles a dropdown and clicks on first link
     */
    var toggleDropdownAndClick = function(component, dropDownIdx) {
        var btns = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button');
        TestUtils.Simulate.focus(btns[dropDownIdx].getDOMNode());
        TestUtils.Simulate.click(btns[dropDownIdx].getDOMNode());

        var anchors = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'a');
        TestUtils.Simulate.click(anchors[0].getDOMNode());
    };

    it('should call props.onChange when clicking on a selector option', function() {
        props.column = {
            options: [{ name: 'skip'}],
        };

        var component = renderHelper();
        toggleDropdownAndClick(component, 0);
        expect(props.onChange).to.have.been.called;
    });

    it('should call props.onChange when clicking on a dateTime selector option', function() {
        props.column = {
            options: [{ name: 'foo', type: 'date' }],
            mapping: { name: 'foo' },
            datetime_format: [{ name: 'foo' }],
            datetime_mapping: { type: 'foo' },
            values: ['12/34/5678'],
        };

        var component = renderHelper();
        toggleDropdownAndClick(component, 1);
        expect(props.onChange).to.have.been.called;
    });
});
