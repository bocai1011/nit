import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import Export from 'staging/pages/Export/Export';
import ExportsTable from 'staging/pages/Export/ExportsTable';

describe( 'Export', function() {

    var sandbox, component;
    var ntUtils = new NeatTestUtils(React);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        ntUtils.stubCurrentCase(NeatApp);
        sandbox.stub(NeatApp, 'getApp',
            function() { return ntUtils.stubForHelpBlurb(); });
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should have an ExportsTable child', function() {
        component = ntUtils.renderWithContext(Export);
        var tbl = TestUtils.scryRenderedComponentsWithType(
            component, ExportsTable);
        expect(tbl).not.to.equal(null);
    });
});
