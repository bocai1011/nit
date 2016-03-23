import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import ReportButton from 'reports/components/ReportButton';
import Start from 'reports/pages/Start';

const ntUtils = new NeatTestUtils(React);

describe('Start', function () {

    let sandbox = sinon.sandbox.create();

    beforeEach(() => {
        ntUtils.stubCurrentCase(NeatApp);
    });

    afterEach(() => {
        sandbox.restore()
        ntUtils.unsetCase(NeatApp);
    });

    it('should render 5 ReportButtons', () => {

        sandbox.stub(NeatApp, 'getApp', () => {
            return ntUtils.stubForHelpBlurb();
        });

        let el = React.createElement(Start);
        let component = TestUtils.renderIntoDocument(el);
        let reportButtons = TestUtils.scryRenderedComponentsWithType(
            component,
            ReportButton
        );

        expect(reportButtons).to.have.length(5);
    });

});
