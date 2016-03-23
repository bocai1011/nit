import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import ConfigurationOption from 'app/pages/Configure/ConfigurationOption';

describe('ConfigurationOption', function () {

    var el, sandbox, component;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        el = React.createElement(ConfigurationOption, {
            option: {
                description: 'A configuration option.',
                name: 'Configure',
                value: false
            },
        });

        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should render a single checkbox', function () {
        var checkBox = TestUtils.findRenderedDOMComponentWithTag(
            component,
            'input'
        ).getDOMNode();
        expect(checkBox.type).to.equal('checkbox');
    });

    it('should update the `value` prop on click', function () {
        sandbox.stub(NeatApp, 'saveApp');
        var checkBox = TestUtils.findRenderedDOMComponentWithTag(
            component,
            'input'
        );
        TestUtils.Simulate.change(checkBox);
        expect(NeatApp.saveApp).to.have.been.called;
        expect(component.props.option.value).to.equal(true);
    });

});
