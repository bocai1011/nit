import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import StatusLabel from 'staging/components/StatusLabel';
import Share from 'staging/pages/Share';

describe('Share', function() {

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
            getShareMarks: [],
        };

        // Wire up mocked data & functions
        ntUtils.stubCurrentCase(NeatApp);

        sandbox.stub(NeatApp, 'caseName', function() {
            return 'foo';
        });

        sandbox.stub(NeatApp, 'caseShortName', function () {
            return 'foo';
        });

        sandbox.stub(NeatApp, 'getApp',
            function() { return ntUtils.stubForHelpBlurb(); });
    });

    afterEach(function () {
        sandbox.restore();
    });

    // Check if a snippet of text is contained in the labels
    function inLabels(text) {
        var labels = TestUtils.scryRenderedComponentsWithType(
            component, StatusLabel);
        return labels.some(function(_label) {
            var _text = _label.getDOMNode().textContent.toLowerCase();
            return (_text.indexOf(text) > -1);
        });
    }

    function renderHelper() {
        // Wire up stubs
        Object.keys(neatAppStubMap).forEach(function(key) {
            sandbox.stub(NeatApp, key, function() { return neatAppStubMap[key]; });
        });

        var opts = {
            currentParams: { fileIndex: 0 }
        };
        component = ntUtils.renderWithContext(Share, opts);
    }


    it('should show label for a shared case', function() {
        renderHelper();
        expect(inLabels('shared')).to.be.true;
    });

    it('should show a label for a ready case', function() {
        neatAppStubMap.isLocked = true;
        renderHelper();
        expect(inLabels('ready')).to.be.true;
    });

    it('should show label for an incomplete case', function() {
        neatAppStubMap.isLocked = false;
        neatAppStubMap.canLock = false;
        renderHelper();
        expect(inLabels('incomplete')).to.be.true;
    });

    it('should show a label for a case with errors', function() {
        neatAppStubMap.isLocked = false;
        renderHelper();
        component.setState({ error: true });
        expect(inLabels('error')).to.be.true;
    });

    it('should call share when share button clicked', function() {
        neatAppStubMap.isLocked = false;
        renderHelper();

        // wire up stub methods
        sandbox.stub(NeatApp, 'addShareMark', function() {});
        sandbox.stub(component, 'beginProcessing', function() {});

        // find the button we need to click to trigger share
        var btns = TestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
        btns = btns.filter(function(btn) {
            return (btn.getDOMNode().textContent.toLowerCase() === 'share foo');
        });
        TestUtils.Simulate.click(btns[0].getDOMNode());

        // assert that our share has begun prcoessing
        expect(component.beginProcessing.args[0][0].toLowerCase()).to.equal('share');
    });

    it('displays an archive download link after successful processing', function () {
        neatAppStubMap.canLock = true;
        renderHelper();

        // wire up stub methods
        sandbox.stub(NeatApp, 'lockCase', function() {});
        sandbox.stub(NeatApp, 'saveCurrentCase', function() {});

        component.onSuccessfulProcess('C:/fakepath/FTC.neat');
        var panel = TestUtils.findRenderedDOMComponentWithClass(component, 'panel-success');
        var fileLink = TestUtils.findRenderedDOMComponentWithTag(panel, 'a').getDOMNode();
        expect(fileLink.textContent).to.equal('FTC.neat');
    });

    it('logs and saves a timestamp for a successful share', function () {
        neatAppStubMap.getShareMarks = [Date.now()];
        renderHelper();

        // wire up stub methods
        sandbox.stub(NeatApp, 'addShareMark', function() {});
        sandbox.stub(component, 'beginProcessing', function() {});

        component._share();
        var shareMark = TestUtils.scryRenderedDOMComponentsWithClass(component, 'alert-info');
        expect(shareMark).to.not.be.empty;
    });
});
