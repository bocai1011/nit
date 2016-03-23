import _ from 'lodash';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import OptionsForm from 'common/components/OptionsForm';

describe('OptionsForm', function() {

    var sandbox, component;
    var testDef, testData, testHandler, inputs;

    beforeEach(function () {
        component = null;
        sandbox = sinon.sandbox.create();

        testDef = {
            optionA: {
                label: 'foo',
                group: 'fooGroup',
                order: 2
            },
            optionB: {
                label: 'bar',
                group: 'barGroup',
                order: 1
            }
        };

        testData = {
            optionA: false,
            optionB: true
        };

        testHandler = sandbox.spy();

        var opts = OptionsForm.makeControls(testData, testDef, testHandler);
        var el = React.createElement('div', {}, opts);
        component = TestUtils.renderIntoDocument(el);
        inputs = TestUtils.scryRenderedDOMComponentsWithTag(component, 'input');
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should create N number of input elements', function() {
        expect(inputs.length).to.equal(Object.keys(testDef).length);
    });

    it('should create checkboxes by default', function() {
        _.forEach(inputs, function(input) {
            expect(input.props.type).to.equal('checkbox');
        });
    });

    it('should call changeHandler on toggle', function() {
        TestUtils.Simulate.change(inputs[1].getDOMNode());
        expect(testHandler).to.have.been.called;
        expect(testHandler.args[0][0]).to.equal('optionA');
    });

    it('should order options by `order` field', function() {
        expect(inputs[0].props.id).to.equal('optionB');
        expect(inputs[1].props.id).to.equal('optionA');
    });

    it('should set the `value` prop according to provided data', function() {
        expect(inputs[0].props.value).to.equal(testData.optionB);
        expect(inputs[1].props.value).to.equal(testData.optionA);
    });

    it('should set group headers', function() {
        var headers = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'h4');
        expect(headers[0].getDOMNode().innerText).to.equal(testDef.optionB.group);
        expect(headers[1].getDOMNode().innerText).to.equal(testDef.optionA.group);
    });

});
