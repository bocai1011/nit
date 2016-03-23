import React from 'react';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';

var sandbox;

describe('NeatApp', function() {

    // Reference to mocked data is here so we can re-assign in testcases
    var testCase,
        fileStage,
        dbStage,
        interpStage,
        refDataStage,
        rectifyStage,
        finalizeStage,
        exportStage,
        shareStage;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // Restore default mocked data values
        fileStage = {};
        dbStage = {};
        interpStage = {};
        refDataStage = {};
        rectifyStage = {};
        finalizeStage = {};
        exportStage = {};
        shareStage = {};

        testCase = {
            base: 'fooBase',
            name: 'fooName',
            stagingPhases: [
                fileStage,
                dbStage,
                interpStage,
                refDataStage,
                rectifyStage,
                finalizeStage,
                exportStage,
                shareStage
            ]
        };

        NeatApp.setCurrentCase(testCase);
    });

    afterEach(function () {
        sandbox.restore();
        NeatApp.setCurrentCase(null);
    });

    it('should get & set case', function() {
        // case already set in beforeEach
        expect(NeatApp.getCurrentCase()).to.equal(testCase);
    });

    it('should have trade blotter', function() {
        testCase.stagingFiles = [{ file: { length: 1 }}];
        expect(NeatApp.hasTradeBlotter()).to.be.true;
    });

    it('should have valid trade blotter', function() {
        testCase.stagingFiles = [{ success: true, file: { length: 1 }}];
        // TODO NeatApp.js L227 is unused
        // expect(NeatApp.validTradeBlotter()).to.be.true;
    });

    it('should mark db as created', function() {
        sandbox.stub(NeatApp, 'updateStagingStatus', function() {});
        NeatApp.markDbAsCreated();
        expect(NeatApp.dbCreated()).to.be.true;
        expect(NeatApp.updateStagingStatus).to.have.been.called;
    });

    it('should determine if db can be created', function() {
        testCase.stagingFiles = [{ success: true, file: { length: 1 }}];
        expect(NeatApp.canCreateDb()).to.be.true;
    });

    it('should set & get interp data', function() {
        var interpData = {};
        NeatApp.setInterpData(interpData);
        expect(NeatApp.getInterpData()).to.equal(interpData);
    });

    it('should mark and check interp completed', function() {
        sandbox.stub(NeatApp, 'updateStagingStatus', function() {});
        NeatApp.markInterpComplete();
        expect(NeatApp.interpCompleted()).to.be.true;
        expect(NeatApp.stageDone(interpStage)).to.be.true;
        expect(NeatApp.updateStagingStatus).to.have.been.called;
    });

    it('should mark and check refData completed', function() {
        sandbox.stub(NeatApp, 'updateStagingStatus', function() {});
        NeatApp.markRefDataComplete();
        expect(NeatApp.refDataCompleted()).to.be.true;
        expect(NeatApp.stageDone(refDataStage)).to.be.true;
        expect(NeatApp.updateStagingStatus).to.have.been.called;
    });

    it('should mark and check rectify complete', function() {
        sandbox.stub(NeatApp, 'updateStagingStatus', function() {});
        NeatApp.markRectifyComplete();
        expect(NeatApp.stageDone(rectifyStage)).to.be.true;
        expect(NeatApp.updateStagingStatus).to.have.been.called;
    });

    it('should mark and check finalized & canLock', function() {
        sandbox.stub(NeatApp, 'updateStagingStatus', function() {});
        NeatApp.markAsFinalized();
        expect(NeatApp.finalized()).to.be.true;
        expect(NeatApp.canLock()).to.be.true;
        expect(NeatApp.updateStagingStatus).to.have.been.called;
    });

    it('should lock case', function() {
        var lockRequestCb;

        sandbox.stub(NeatApp, 'updateStagingStatus', function() {});
        sandbox.stub(util, 'get', function(path, successCb) {
            // capture success callback to lock request
            lockRequestCb = successCb;
        });

        NeatApp.lockCase();

        // send back our mock server response
        lockRequestCb({ status: 'locked' });

        expect(NeatApp.isLocked()).to.be.true;
    });

    it('should unlock case', function() {
        var unlockRequestCb;

        sandbox.stub(NeatApp, 'updateStagingStatus', function() {});
        sandbox.stub(util, 'get', function(path, successCb) {
            // capture success callback to lock request
            unlockRequestCb = successCb;
        });

        NeatApp.unlockCase();

        // send back our mock server response
        unlockRequestCb({ status: 'unlocked' });

        expect(NeatApp.isLocked()).to.be.false;
    });

    it('should add & get share marks', function() {
        NeatApp.addShareMark();
        var shareMarks = NeatApp.getShareMarks();
        expect(shareMarks).to.have.length(1)
        expect(shareMarks[0]).to.be.closeTo(Date.now(), 5);
    });

    it('should get case name', function() {
        expect(NeatApp.caseName()).to.equal(testCase.name);
    });

    it('should get case short name', function() {
        expect(NeatApp.caseShortName()).to.equal(testCase.base);
    });

    it('should update staging status', function() {
        testCase.stagingFiles = [{ success: true, file: { length: 1 }}];
        NeatApp.markDbAsCreated();
        NeatApp.markInterpComplete();
        NeatApp.markRefDataComplete();
        NeatApp.markRectifyComplete();
        NeatApp.markAsFinalized();

        // invalidate the files
        NeatApp.cleanFileItem(0);

        // assert all the stages are not completed
        expect(NeatApp.dbCreated()).to.be.false;
        expect(NeatApp.interpCompleted()).to.be.false;
        expect(NeatApp.refDataCompleted()).to.be.false;
        expect(NeatApp.stageDone(rectifyStage)).to.be.false;
        expect(NeatApp.finalized()).to.be.false;
    });

    it('should get & set app', function() {
        var testApp = {};
        NeatApp.setApp(testApp);
        expect(NeatApp.getApp()).to.equal(testApp);
    });

    it('should close app', function() {
        sandbox.stub(util, 'post', function() {});
        NeatApp.closeApp();
        expect(util.post).to.have.been.called;
    });

});
