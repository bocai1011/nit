import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Button } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import CreateDB from 'staging/pages/CreateDB';

describe('CreateDB', function() {
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

    it('should call beginProcessing() on click to Create Database', function() {
        sandbox.stub(NeatApp, 'canCreateDb', function() { return true; });
        sandbox.stub(NeatApp, 'dbCreated', function() { return false; });
        sandbox.stub(NeatApp, 'isLocked', function() { return false; });

        // render
        component = ntUtils.renderWithContext(CreateDB);

        sandbox.stub(component, 'beginProcessing', function() {});

        // find create db button and click it
        var btns = TestUtils.scryRenderedComponentsWithType(
            component, Button);
        var btn = ntUtils.filterByTextContent(btns, 'Create Database');
        TestUtils.Simulate.click(btn.getDOMNode());

        expect(component.beginProcessing.args[0][0]).to.equal('Create Database');
    });
});
