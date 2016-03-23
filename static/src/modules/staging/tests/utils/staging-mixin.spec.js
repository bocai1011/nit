import NeatApp from 'app/utils/NeatApp';
import StagingMixin from 'staging/utils/StagingMixin';

var sandbox = sinon.sandbox.create();

describe('StagingMixin', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('should check whether the guard should be active', function () {
        sandbox.stub(NeatApp, 'getPhaseInfo', function() {
            return { statusCode: 'inactive' };
        })
        var sm = Object.create(StagingMixin);
        sm.props = { stage: 'foo' };
        var guardActive = sm._guardActive();
        expect(NeatApp.getPhaseInfo).to.have.been.calledWith('foo');
        expect(guardActive).to.be.true;
    });

    it('should check whether the guard should be active', function () {
        sandbox.stub(NeatApp, 'isLocked', function() { return true; })
        sandbox.stub(NeatApp, 'caseName', function() { return 'bar'; })
        var sm = Object.create(StagingMixin);
        var guard = sm.guardLock();
        expect(NeatApp.isLocked).to.have.been.called;
        expect(guard).to.exist;
    });

});
