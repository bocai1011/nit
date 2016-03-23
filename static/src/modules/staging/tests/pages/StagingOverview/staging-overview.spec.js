import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import StagingOverview from 'staging/pages/StagingOverview/StagingOverview';

describe('StagingOverview', function() {
    
    var ntUtils = new NeatTestUtils(React);

    var sandbox, component;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        var stubApp = { NeatOptions: { DatabaseNames: { value: 'foo' }}};
        sandbox.stub(NeatApp, 'getApp', function() { return stubApp; });
        ntUtils.stubForHelpBlurb(stubApp);

        ntUtils.stubCurrentCase(NeatApp);
        sandbox.stub(NeatApp, 'updateStagingStatus', function() {});
        component = ntUtils.renderWithContext(StagingOverview);
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should update staging status', function() {
        expect(NeatApp.updateStagingStatus).to.have.been.called;
    });

    it('should render X number of staging phases', function() {
        var panels = TestUtils.scryRenderedDOMComponentsWithClass(component, 'panel');

        // Should render 1 panel item for each staging phase.
        expect(panels.length).to.equal(NeatApp.getCurrentCase().stagingPhases.length);
    });
});
