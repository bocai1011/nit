import React from 'react';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import Startup from 'app/components/StartUp';

describe('Startup', function() {

    var sandbox;
    var ntUtils = new NeatTestUtils(React);
    var _originalUA = window.navigator.userAgent;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();

        // Hacky reset.
        window.navigator.__defineGetter__('userAgent', function () {
            return _originalUA;
        });
    });

    it('should navigate to browser guard', function() {

        window.navigator.__defineGetter__('userAgent', function () {
            return 'Blah Blah Blah MSIE Blah Blah like Gecko';
        });

        var transitionToSpy = sandbox.spy();
        ntUtils.renderWithContext(Startup, {
            transitionTo: transitionToSpy,
        });

        expect(transitionToSpy).to.have.been.calledWith('browser-guard');
    });

    it('should restore an existing NEAT app', function() {
        var obj = {};
        sandbox.stub(util, 'get', function(url, cb) { cb(obj); });
        sandbox.spy(NeatApp, 'setApp');

        var goBackSpy = sandbox.spy();
        ntUtils.renderWithContext(Startup, { goBack: goBackSpy });

        expect(NeatApp.setApp).to.have.been.calledWith(obj);
        expect(goBackSpy).to.have.been.called;
    });

    // TODO: When /get_config/ responds with null, <Startup/> calls
    // NeatApp.newApp(), which is currently not defined.
    it('should create a new app if /get_config/ responds with null');

});
