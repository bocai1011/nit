import React from 'react';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import CaseFrame from 'app/components/CaseFrame';

describe('CaseFrame', function() {

    var sandbox,
        transitionToSpy;

    var ntUtils = new NeatTestUtils(React);

    var createComponent = function () {
        var opts = {
            transitionTo: transitionToSpy,
            props: { params: { name: 'foo' }}
        };

        ntUtils.renderWithContext(CaseFrame, opts);
    }

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        transitionToSpy = sandbox.spy();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should transition to open when no currentCase', function() {
        sandbox.stub(NeatApp, 'getCurrentCase', function() {
            return null;
        });
        createComponent();
        expect(transitionToSpy).to.have.been.calledWith('open');
    });

    it('should transition to open when the case is changing', function () {
        sandbox.stub(NeatApp, 'getCurrentCase', function () {
            return { name: 'bar' };
        });
        createComponent();
        expect(transitionToSpy).to.have.been.calledWith('open', {
            name: 'foo'
        });
    });

});
