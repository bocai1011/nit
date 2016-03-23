import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import util from 'common/utils/util';
import MailtoError from 'common/components/MailtoError';

describe('MailtoError', function() {

    let sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should render', function () {

        var el = React.createElement(MailtoError, {
            description: 'Something bad happened!',
        });

        sandbox.stub(NeatApp, 'getApp', function () {
            return { version: '9.8.7' };
        });

        sandbox.stub(NeatApp, 'caseName', function () {
            return 'Case';
        });

        sandbox.stub(util);

        var mailto = 'mailto:NEATHelpEmail@sec.gov?subject=NEAT%20error%20encountered%20(v9.8.7)&body=The%20following%20error%20was%20encountered%20while%20in%20case%20Case%3A%0A%0ASomething%20bad%20happened!%0A%0AUnable%20to%20determine%20error.%0A%0A';

        var component = TestUtils.renderIntoDocument(el);
        var anchor = TestUtils.findRenderedDOMComponentWithTag(
            component, 'a'
        ).getDOMNode();

        expect(anchor.href).to.equal(mailto);
    });

});
