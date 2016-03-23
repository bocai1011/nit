import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import util from 'common/utils/util';
import Status from 'app/pages/Status';

var sandbox, component;

describe('Status', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should render X number of checkbox rows', function() {
        // mock status response
        var testStatus = [{}, {}, {}];

        // capture the callback used in the server request
        var cb;
        sandbox.stub(util, 'get', function(__, _cb) {
            cb = _cb;
        });

        // render component
        component = TestUtils.renderIntoDocument(
            React.createElement(Status));

        // call callback and pass our test status
        cb(testStatus);

        var trs = TestUtils.scryRenderedDOMComponentsWithTag(component, 'tr');
        expect(trs.length).to.equal(Object.keys(testStatus).length);
    });
});
