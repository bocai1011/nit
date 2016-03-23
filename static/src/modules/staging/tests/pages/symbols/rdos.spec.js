import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import RDOs from 'staging/pages/Symbols/RDOs';
import ReferenceData from 'staging/services/ReferenceData';

describe('RDOs', function() {

    var sandbox, component;
    var ntUtils = new NeatTestUtils(React);
    var deferredGetRDOs, deferredSetCollection;

    beforeEach(function () {
        component = null;
        sandbox = sinon.sandbox.create();

        deferredGetRDOs = $.Deferred();
        sandbox.stub(ReferenceData, 'getRDOs', function() {
            return deferredGetRDOs;
        });

        deferredSetCollection = $.Deferred();
        sandbox.stub(ReferenceData, 'setCollection', function() {
            return deferredSetCollection;
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    // Helper function
    function submitRDOs(component) {
        // find and click the submit button
        var form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
        var btns = TestUtils.scryRenderedDOMComponentsWithTag(form, 'button');
        // submit button should be the last one
        var submitBtn = btns[btns.length-1];
        TestUtils.Simulate.click(submitBtn.getDOMNode());
    }

    // Helper function
    function renderHelper(securityOids) {
        component = ntUtils.renderWithContext(RDOs, {
            props: {securityOids: securityOids}
        });
    }


    it('should toggle panel expanded state on button click', function() {
        renderHelper([]);
        // assert pre-condition, expanded state should be false by default
        expect(component.state.panelExpanded).to.equal(false);
        var btns = TestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
        TestUtils.Simulate.click(btns[0].getDOMNode());
        expect(component.state.panelExpanded).to.equal(true);
    });

    it('should query RDOs on initial render if securityOids provided', function() {
        var testOids = [42];
        renderHelper(testOids);
        expect(ReferenceData.getRDOs.args[0][0]).to.equal(testOids[0]);
    });

    it('should not query RDOs on initial render if no securityOids provided', function() {
        renderHelper([]);
        expect(ReferenceData.getRDOs).to.not.have.been.called;
    });


    describe('loaded with a test security', function() {

        var testOids, testRDOs;

        beforeEach(function() {
            testOids = [42];
            testRDOs = {
                adjfactor: {}
            };
            renderHelper(testOids);
            deferredGetRDOs.resolve(testRDOs);
        });

        it('should retrieve RDOs from server when securityOids update', function() {
            // assert getRDOs is called with our test security oid
            expect(ReferenceData.getRDOs.args[0][0]).to.equal(testOids[0]);
            // assert the server response is properly set
            expect(component.state.rdos.adjfactor).to.equal(testRDOs.adjfactor);
        });

        it('should commit RDOs to server on form submission', function() {
            submitRDOs(component);
            // assert setRDOs called with correct oid and RDO data
            expect(ReferenceData.setCollection.args[0][0]).to.equal(testOids);
            expect(ReferenceData.setCollection.args[0][1].rdos.adjfactor).to.equal(testRDOs.adjfactor);
        });

        it('should call onChange handler on successful setCollection call', function() {
            component.setProps({onChange: sandbox.spy()});
            submitRDOs(component);
            deferredSetCollection.resolve();
            expect(component.props.onChange.args[0][0]).to.equal(testOids);
        });

        it('should not call onChange handler on non-successful setCollection call', function() {
            component.setProps({onChange: sandbox.spy()});
            submitRDOs(component);
            deferredSetCollection.reject();
            expect(component.props.onChange).to.not.have.been.called;
        });
    });

    describe('loaded with multiple securities', function() {
        var testOids;

        beforeEach(function() {
            testOids = [42, 1337];
            renderHelper(testOids);
        });

        it('should not retrieve RDOs from server when multiple oids provided', function() {
            // assert getRDOs is not called called with our test security oid
            expect(ReferenceData.getRDOs).to.not.be.called;
        });

        it('should set all state.rdos.<rdo_name> to null', function() {
            expect(_.every(component.state.rdos, _.isNull)).to.be.true;
        });

        it('should set indeterminate=true in checkbox nodes', function() {
            var form = TestUtils.findRenderedDOMComponentWithTag(component, 'form');
            var inputs = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');

            // find checkboxes, should have at least 1
            var checkboxes = _.filter(inputs, function(input) {
                return input.getDOMNode().type === 'checkbox';
            });
            expect(checkboxes.length).to.be.at.least(1);

            // check for indeterminate
            _.forEach(checkboxes, function(checkbox) {
                expect(checkbox.getDOMNode().indeterminate).to.be.true;
            });
        });

        it('should not commit RDOs to server when state.rdos.<rdo_name> are null', function() {
            submitRDOs(component);
            expect(ReferenceData.setCollection).to.not.be.called;
        });

        it('should commit subset of RDOs (non-null values) to server', function() {
            // manually set a non-null value for adjfactor
            var rdos = component.state.rdos;
            rdos.adjfactor = true;
            component.setState({rdos: rdos});

            submitRDOs(component);

            // send {adjfactor: true} to server, no other keys
            expect(ReferenceData.setCollection.args[0][0]).to.equal(testOids);
            expect(ReferenceData.setCollection.args[0][1].rdos.adjfactor).to.equal(true);
            expect(_.keys(ReferenceData.setCollection.args[0][1].rdos)).to.eql(['adjfactor']);
        });
    });
});
