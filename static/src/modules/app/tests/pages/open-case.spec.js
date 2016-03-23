import React from 'react';
import $ from 'jquery';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import OpenCase from 'app/pages/OpenCase';

describe('OpenCase', function() {

    var sandbox;
    var ntUtils = new NeatTestUtils(React);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should get from server and set current case', function() {

        let testCase = {},
            deferred = $.Deferred(),
            opts = { props: { params: { name: 'foo' }}};

        sandbox.stub(util, 'get', () => deferred);
        sandbox.stub(NeatApp, 'setCurrentCase');
        sandbox.stub(NeatApp, 'loadMappings');

        ntUtils.renderWithContext(OpenCase, opts);

        // assert call was made util.get with /get_case/foo endpoint
        expect(util.get).to.have.been.calledWith('/get_case/foo');

        // Resolve the jQuery.Deferred with the test case.
        deferred.resolve(testCase);

        expect(NeatApp.setCurrentCase).to.have.been.calledWith(testCase);
        expect(NeatApp.loadMappings).to.have.been.calledOnce;
    });
});
