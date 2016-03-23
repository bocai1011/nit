import $ from 'jquery';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Alert } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import DeepDive from 'staging/pages/Symbols/DeepDive';
import ReferenceData from 'staging/services/ReferenceData';

describe('DeepDive', function() {

    var sandbox, component;
    var ntUtils = new NeatTestUtils(React);

    beforeEach(function () {
        component = null;
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should not render anything if not securityOid', function() {
        component = ntUtils.renderWithContext(DeepDive);
        var tabs = TestUtils.scryRenderedDOMComponentsWithClass(
            component, 'symbol-deep-dive-tabs');
        expect(tabs.length).to.equal(0);
    });

    var testCase = 'foo';
    var testOid = 42;
    var testRsecOid = 1337;
    var testRsecCode = 'rightcode';
    var testRefData,
        testSecData,
        testPricingData;
    var deferredGet,
        deferredSet,
        deferredGetPricing,
        deferredGetValidation;

    function renderHelper(override) {
        override = override || {};
        sandbox.stub(NeatApp, 'caseName', function() { return testCase; });

        // Create test server responses
        testRefData = [{
            oid: testRsecOid,
            code: testRsecCode
        }, {
            oid: 0,
            code: 'wrongcode'
        }];
        if (override.testRefData) {
            testRefData = override.testRefData;
        }

        testSecData = {
            oid: testOid
        }

        // pricing data
        testPricingData = override.testPricingData || {};

        // Stub server calls and setup to return deferreds
        deferredGet = $.Deferred();
        sandbox.stub(ReferenceData, 'get', function() {
            return deferredGet;
        });

        deferredSet = $.Deferred();
        sandbox.stub(ReferenceData, 'set', function() {
            return deferredSet;
        });

        deferredGetPricing = $.Deferred();
        sandbox.stub(ReferenceData, 'getPricing', function() {
            return deferredGetPricing;
        });

        deferredGetValidation = $.Deferred();
        sandbox.stub(ReferenceData, 'getValidation', function() {
            return deferredGetValidation;
        });

        // Render
        component = ntUtils.renderWithContext(DeepDive);

        // Stub out charting as these functions are mostly trivial
        sandbox.stub(component, '_renderPricingChart', function() {});
        sandbox.stub(component, '_renderNotionalChart', function() {});

        // Set prop and fire deferreds
        component.setProps({
            securityOid: testOid
        });
        deferredGet.resolve({
            reference: testRefData,
            security: testSecData
        });
        deferredGetPricing.resolve(testPricingData);
    }

    it('should render a tab for each ref security', function() {
        renderHelper();
        var tabs = TestUtils.scryRenderedDOMComponentsWithClass(
            component, 'symbol-deep-dive-tabs');
        expect(tabs.length).to.equal(testRefData.length);
    });

    it('should query reference data and update internal state on securityOid change', function() {
        renderHelper();
        expect(ReferenceData.get.args[0][0]).to.equal(testOid);
        expect(component.state.refData).to.equal(testRefData);
        expect(component.state.secData).to.equal(testSecData);
    });

    it('should query pricing data and update internal state on securityOid change', function() {
        renderHelper();
        expect(ReferenceData.getPricing.args[0][0]).to.equal(testOid);
        expect(ReferenceData.getPricing.args[0][1]).to.equal(testRsecOid);
        expect(component.state.pricingData).to.equal(testPricingData);
    });

    it('should update rsec link and call `onSecurityUpdate` on `_handleClickRemap`', function() {
        renderHelper();
        var func = sandbox.spy();
        component.setProps({
            onSecurityUpdate: func
        });
        component._handleClickRemap();
        deferredSet.resolve();
        expect(ReferenceData.set.args[0][0]).to.equal(testOid);
        expect(ReferenceData.set.args[0][1].rsec).to.equal(testRsecOid);
        expect(func.args[0][0]).to.equal(testOid);
        expect(func.args[0][1].rsec_code).to.equal(testRsecCode);
    });


    // Alert for missing Reference Data
    //

    it('should not render Alert when refSec is available', function() {
        renderHelper();
        var alerts = TestUtils.scryRenderedComponentsWithType(
            component, Alert);
        expect(alerts.length).to.equal(0);
    });

    it('should render Alert when no refSec available', function() {
        renderHelper({testRefData: []});
        var alerts = TestUtils.scryRenderedComponentsWithType(
            component, Alert);
        expect(alerts.length).to.equal(1);
    });


    describe('_hasPricingData', function() {
        it('should return false when server response does not contain data', function() {
            renderHelper();
            expect(component._hasPricingData()).to.be.false;
        });

        it('should return true when server response contains data', function() {
            renderHelper({testPricingData: { hist: [[0, 0, 0]] }});
            expect(component._hasPricingData()).to.be.true;
        });
    });


    describe('_hasNotionalData', function() {
        it('should return false when server response does not contain data', function() {
            renderHelper();
            expect(component._hasNotionalData()).to.be.false;
        });

        it('should return true when server response contains data', function() {
            renderHelper({testPricingData: { notional: { notional: [[0, 0, 0]]}}});
            expect(component._hasNotionalData()).to.be.true;
        });
    });
});
