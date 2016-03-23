import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Button } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import FilesOverview from 'staging/pages/FilesOverview';

describe('FilesOverview', function() {
    var sandbox;
    var ntUtils = new NeatTestUtils(React);

    var component;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        ntUtils.stubCurrentCase(NeatApp);

        // Wire up mocked data & functions
        var stubApp = { NeatOptions: { DatabaseNames: { value: 'foo' }}};
        sandbox.stub(NeatApp, 'getApp', function() { return stubApp; });
        ntUtils.stubForHelpBlurb(stubApp);
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should call _confirmFileDone() on click to Confirm', function() {
        sandbox.stub(NeatApp, 'canCreateDb', function() { return true; });
        sandbox.stub(NeatApp, 'filesDone', function() { return false; });
        sandbox.stub(NeatApp, 'nextFile', function() { return -1; });

        sandbox.spy(NeatApp, 'markFilesDone');
        // render
        component = ntUtils.renderWithContext(FilesOverview);

        // find confirm button and click it
        var btns = TestUtils.scryRenderedComponentsWithType(
            component, Button);
        var btn = ntUtils.filterByTextContent(btns, 'Confirm');

        TestUtils.Simulate.click(btn.getDOMNode());

        expect(NeatApp.markFilesDone).to.have.been.called;
    });
});
