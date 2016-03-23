import _ from 'lodash';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ExportsTableItem from 'staging/pages/Export/ExportsTableItem';

describe('ExportsTableItem', function() {

    var sandbox, component, props;
    var ntUtils = new NeatTestUtils(React);

    // We have to wrap the <ExportsTableItem/> in a <table> because if we don't,
    // React has trouble rendering it as a standalone <tr>. So this just
    // wraps <ExportsTableItem/> passes down all the props, and attaches a ref so
    // we can reference the actual <ExportsTableItem/> in tests.
    var WrappedExportTableItem = React.createClass({
        render: function () {
            return (
                <table>
                    <tbody>
                        <ExportsTableItem {...this.props} ref='exportsTableItem' />
                    </tbody>
                </table>
            );
        },
    });

    function renderHelper(props) {
        let component = ntUtils.renderWithContext(
            WrappedExportTableItem, {props: props});

        // The component we actually care about is the <ExportsTableItem/>,
        // which is stored as a ref in the <WrappedExportTableItem/>.
        return component.refs.exportsTableItem;
    }

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // initialize props
        props = {
            foreignTable: 'foo',
            index: 1,
            resetGenerateButtons: function() {}
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('0th index checkboxes should be disabled', function() {
        props.index = 0;
        component = renderHelper(props);
        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'input');
        _.forEach(inputs, function(checkbox) {
            expect(checkbox.getDOMNode().disabled).to.be.true;
        });
    });

    it('non 0th index checkboxes should be enabled', function() {
        props.index = 1;
        component = renderHelper(props);
        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'input');
        _.forEach(inputs, function(checkbox) {
            expect(checkbox.getDOMNode().disabled).to.be.false;
        });
    });

    it('should toggle include state & call `resetGenerateButtons` on checkbox click', function() {
        props.index = 1;
        props.resetGenerateButtons = sandbox.spy();
        component = renderHelper(props);

        // pre-condition `include` state is true by default
        expect(component.state.include).to.be.true;

        // simulate click
        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'input');
        TestUtils.Simulate.click(inputs[0]);

        // post-condition: `include` state toggled and called func
        expect(component.state.include).to.be.false;
        expect(props.resetGenerateButtons).to.have.been.called;
    });
});
