import $ from 'jquery';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Button } from 'react-bootstrap';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import AppButton from 'common/components/AppButton';
import CaseOverview from 'staging/pages/CaseOverview';

describe('CaseOverview', function() {
    var sandbox, component;
    var ntUtils = new NeatTestUtils(React);

    // Reference to mocked data is here so we can re-assign in testcases
    var neatAppStubMap;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // Restore default mocked data values
        neatAppStubMap = {
            isLocked: true,
            canLock: true,
            finalized: true,
        };

        // Wire up mocked data & functions
        ntUtils.stubCurrentCase(NeatApp);

        sandbox.stub(NeatApp, 'getCurrentCase', function() {
            return {
                update: util.ParseDate('20150901000000'),
                create: util.ParseDate('20151001000000'),
            };
        });

        sandbox.stub(NeatApp, 'unlockCase', function() {
            return $.Deferred();
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should unlock case when Unlock button clicked', function() {
        // Wire up stubs
        Object.keys(neatAppStubMap).forEach(function(key) {
            sandbox.stub(NeatApp, key, function() { return neatAppStubMap[key]; });
        });

        component = ntUtils.renderWithContext(CaseOverview);

        // click the "Unlock" button
        var appBtns = TestUtils.scryRenderedComponentsWithType(
            component, AppButton);
        var unlockAppBtn = appBtns[0];
        var unlockBtn = TestUtils.findRenderedComponentWithType(
            unlockAppBtn, Button);
        TestUtils.Simulate.click(unlockBtn.getDOMNode());

        // confirm the modal
        var btns = TestUtils.scryRenderedComponentsWithType(
            unlockAppBtn._overlayInstance, Button);
        var unlockModalBtn = ntUtils.filterByTextContent(btns, 'Confirm');
        expect(unlockModalBtn).to.exist;
        TestUtils.Simulate.click(unlockModalBtn.getDOMNode());

        expect(NeatApp.unlockCase).to.have.been.called;
    });

    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(CaseOverview))).to.be.true;
    });
});
