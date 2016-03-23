import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Modal } from 'react-bootstrap';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import ProgressMixin from 'common/utils/ProgressMixin';

var sandbox;

describe('ProgressMixin', function() {

    var pm;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(NeatApp, 'getCurrentCase', function() {
            return { name: 'foo' };
        });

        // Create an instance of the mixin object
        pm = Object.create(ProgressMixin);
        pm.props = { fakeAsynch: false };
        pm.onSuccessfulProcess = sandbox.spy();
        pm.setState = sandbox.spy();
    });

    afterEach(function () {
        sandbox.restore();
        pm = null;
    });

    it('should call onSuccessfulProcess & set progress to 100 when done in getProgress()', function() {
        // capture the callback function used in the util call
        var cb;
        sandbox.stub(util, 'get', function(url, _cb) {
            cb = _cb;
        });

        pm.getProgress();

        // call the callback with done state
        cb({ done: true });

        // Assert the done is handled
        expect(pm.onSuccessfulProcess).to.have.been.called;
        expect(pm.setState.args[0][0].progress).to.equal(100);
    });

    it('should handle error from server response in getProgress()', function() {
        var errMsg = 'test';

        // capture the callback function used in the util call
        var cb;
        sandbox.stub(util, 'get', function(url, _cb) {
            cb = _cb;
        });

        pm.getProgress();

        // Call the callback with an error
        cb({ error: true, message: errMsg });

        // Assert error is handled
        expect(pm.onSuccessfulProcess).to.not.have.been.called;
        expect(pm.setState.args[0][0].progress).to.equal(0);
        expect(pm.setState.args[0][0].error).to.equal(errMsg);
    });

    it('should handle percent from server response in getProgress()', function() {
        var testPercent = 42;

        // need to initialize object with a numerical progress
        pm.state = { progress: 0 };

        // capture the callback function used in the util call
        var cb;
        sandbox.stub(util, 'get', function(url, _cb) {
            cb = _cb;
        });

        pm.getProgress();

        // Call the callback with a percentage
        cb({ percent: testPercent });

        // Assert percentage is updated
        expect(pm.setState.args[0][0].progress).to.equal(testPercent);
    });

    it('should POST to server and set state to processing in beginProcessing()', function() {
        var testRoute = 'fooRoute';
        var testData = {};

        // capture the route, data, and callback function used in the util call
        var data, route;
        sandbox.stub(util, 'post', function(_route, _data) {
            route = _route;
            data = _data;
        });

        pm.beginProcessing('', testRoute, testData);

        // check route & data POSTed
        expect(data).to.equal(testData);
        expect(route).to.equal(testRoute);

        // check state has been update to processing
        expect(pm.setState.args[0][0].processing).to.equal(true);
    });

    it('should set progress to 0 and call onBegin in beginProcessing()', function() {
        pm.onBegin = sandbox.spy();

        // capture the callback function used in the util call
        var cb;
        sandbox.stub(util, 'post', function(__, ___, _cb) {
            cb = _cb;
        });

        pm.beginProcessing('', '', {});

        cb();

        // check progress has been set to 0
        expect(pm.setState.args[0][0].progress).to.equal(0);

        // check onBegin is called
        expect(pm.onBegin).to.have.been.called;
    });

    it('should call forceFinish if fakeAsynch === true in beginProcessing()', function() {
        pm.props.fakeAsynch = true;
        sandbox.stub(pm, 'forceFinish', function() {});

        // capture the callback function used in the util call
        var cb;
        sandbox.stub(util, 'post', function(__, ___, _cb) {
            cb = _cb;
        });

        pm.beginProcessing('', '', {});

        cb();

        // check onBegin is called
        expect(pm.forceFinish).to.have.been.called;
    });

    it('should set error in state if util returns error in beginProcessing()', function() {
        var errMsg = 'fooErr';

        // capture the error callback function used in the util call
        var cb;
        sandbox.stub(util, 'post', function(__, ___, ____, _errCb) {
            cb = _errCb;
        });

        pm.beginProcessing('', '', {});

        cb({ responseText: errMsg });

        // check error has been set
        expect(pm.setState.args[1][0].error).to.equal(errMsg);
    });

    it('should render in a modal if processing', function() {
        pm.state = { processing: true, msgList: [] };
        var component = TestUtils.renderIntoDocument(pm.renderProgress());
        var modal = TestUtils.findRenderedComponentWithType(
            component, Modal);
        expect(modal).to.exist;
    });

    it('should render div if not processing', function() {
        pm.state = { processing: false, msgList: [] };
        var component = TestUtils.renderIntoDocument(pm.renderProgress());
        var div = TestUtils.findRenderedDOMComponentWithTag(
            component, 'noscript');
        expect(div).to.exist;
    });

});
