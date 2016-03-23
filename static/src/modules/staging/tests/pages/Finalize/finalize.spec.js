import $ from 'jquery';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Button, TabPane } from 'react-bootstrap';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import Finalize from 'staging/pages/Finalize/Finalize';

describe('Finalize', function() {

    var sandbox, component;
    var ntUtils = new NeatTestUtils(React);
    var currentCase;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        currentCase = ntUtils.stubCurrentCase(NeatApp);

        sandbox.stub(NeatApp, 'getApp',
            function() { return ntUtils.stubForHelpBlurb(); });
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should show two tabs if not finalized', function() {
        // pre-condition: should not be finalized
        expect(NeatApp.finalized()).to.be.false;
        component = ntUtils.renderWithContext(Finalize);
        var tabps = TestUtils.scryRenderedComponentsWithType(
            component, TabPane);
        expect(component.getInitialState().key).to.equal(0);
        expect(tabps.length).to.equal(2);
    });

    it('should show three tabs if finalized', function() {
        // stub the case to be finalized
        currentCase.stagingPhases[5].finalized = 'success';
        expect(NeatApp.finalized()).to.be.true;
        sandbox.stub(NeatApp, 'isLocked', function() { return true; });

        component = ntUtils.renderWithContext(Finalize);
        var tabps = TestUtils.scryRenderedComponentsWithType(
            component, TabPane);
        expect(component.getInitialState().key).to.equal(2);
        expect(tabps.length).to.equal(3);
    });

    it('should call beginProcessing() on click to finalize', function() {
        // render
        component = ntUtils.renderWithContext(Finalize);

        sandbox.stub(component, 'beginProcessing', function() {});

        // click the "Finalize" button
        var btns = TestUtils.scryRenderedComponentsWithType(
            component, Button);
        var btn = ntUtils.filterByTextContent(btns, 'Finalize');
        TestUtils.Simulate.click(btn.getDOMNode());

        expect(component.beginProcessing.args[0][0]).to.equal('Finalize');
    });

    it('locks a case after successful processing and change case name', function() {

        // pre-condition: should be unlocked
        expect(NeatApp.isLocked()).to.be.false;
        expect(NeatApp.caseName()).to.equal('testcase-unlocked');

        var saveCaseDeferred = $.Deferred();
        var lockRequestCb;

        // wire up stub methods
        sandbox.spy(NeatApp, 'lockCase');
        sandbox.stub(NeatApp, 'saveCurrentCase', function() {
            return saveCaseDeferred
        });
        sandbox.stub(NeatApp, 'canLock', function() {
            return true;
        });
        sandbox.stub(util, 'get', function(path, successCb) {
            // capture success callback to lock request
            lockRequestCb = successCb;
        });

        // render
        var transitionSpy = sandbox.spy();
        component = ntUtils.renderWithContext(Finalize, { transitionTo: transitionSpy });

        sandbox.spy(component, 'setState');
        component.onSuccessfulProcess();
        saveCaseDeferred.resolve();

        // once saveCurrentCase is resolved expect to call lockCase
        expect(NeatApp.lockCase).to.have.been.called;

        // send back our mock server response
        lockRequestCb({ status: 'locked', name: 'testcase-locked' });

        expect(NeatApp.isLocked()).to.be.true;
        expect(NeatApp.caseName()).to.equal('testcase-locked');
        expect(transitionSpy).to.have.been.called;
    });
});
