import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { PageHeader } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import Header from 'common/components/Header';
import HelpBlurbs from 'common/components/HelpBlurbs';

var sandbox;
var ntUtils = new NeatTestUtils(React);

var component, opts;

describe('Header', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // Mock setup
        //

        ntUtils.stubCurrentCase(NeatApp);

        var testBlurb = 'StagingProcess';
        sandbox.stub(HelpBlurbs, testBlurb, function() {
            return React.createElement('div');
        });

        // Create the element opts
        //

        opts = {
            props: {
                helpBlurb: testBlurb,
            }
        };
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should render the help blurb', function() {
        sandbox.stub(NeatApp, 'getApp',
            function() { return ntUtils.stubForHelpBlurb(); });

        component = ntUtils.renderWithContext(Header, opts);
        expect(TestUtils.findRenderedDOMComponentWithClass(
            component, 'instructionsPanel')).to.exist;
    });

    it('should render the PageHeader', function() {
        sandbox.stub(NeatApp, 'getApp',
            function() { return ntUtils.stubForHelpBlurb(); });

        component = ntUtils.renderWithContext(Header, opts);
        expect(TestUtils.findRenderedComponentWithType(
            component, PageHeader)).to.exist;
    });

    it('should expand/collapse instructions on click if RemoveNotes option is set', function() {
        sandbox.stub(NeatApp, 'getApp',
            function() {
                var app = ntUtils.stubForHelpBlurb()
                app.NeatOptions.RemoveNotes.value = true;
                return app;
            });

        component = ntUtils.renderWithContext(Header, opts);

        // There should be no instructions by default.
        expect(TestUtils.scryRenderedDOMComponentsWithClass(
            component, 'instructionsPanel').length).to.equal(0);

        // Toggle the instructions on.
        var spans = TestUtils.scryRenderedDOMComponentsWithTag (
            component, 'span');
        TestUtils.Simulate.click(spans[0].getDOMNode());

        // Now there should be instructions.
        expect(TestUtils.findRenderedDOMComponentWithClass(
            component, 'instructionsPanel')).to.exist;
    });

});
