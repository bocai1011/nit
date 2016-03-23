import React from 'react';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import StartupCheck from 'app/components/StartupCheck';

describe('StartupCheck', function() {

    var sandbox;
    var ntUtils = new NeatTestUtils(React);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should transition to startup', function() {
        sandbox.stub(NeatApp, 'getApp', function() { return null; });
        var transitionToSpy = sandbox.spy();
        ntUtils.renderWithContext(StartupCheck, {
            transitionTo: transitionToSpy,
        });

        expect(transitionToSpy).to.have.been.calledWith('startup');
    });
});
