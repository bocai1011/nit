import React from 'react';
import util from 'common/utils/util';
import $ from 'jquery';

var sandbox;

describe('util', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        util.setReplaceWith(function() {});
    });

    afterEach(function () {
        sandbox.restore();
        util.setReplaceWith(undefined);
    });

    // date from format yyyymmddhhmmss
    it('should parse dates correctly', function() {
        var d = new Date(2015, 5, 17, 10, 55, 0, 0).toISOString();
        expect(util.ParseDate('20150617105500').toISOString()).to.equal(d);
    });

    it('should parse filename from path', function() {
        var path = '/foo/bar/baz.txt';
        expect(util.filenameFromPath(path)).to.equal('baz.txt');
    });

    it('should extract errors', function() {
        var err = { args: ['foo'] };
        expect(util.extractError(err)).to.equal('foo');
        err = { message: 'foo' };
        expect(util.extractError(err)).to.equal('foo');
    });

    describe('should set request error', function() {

        var ajaxObj, testUrl, testErr;

        beforeEach(function() {
            testUrl = 'fooUrl';
            testErr = { responseText: 'foo' };
            sandbox.stub($, 'ajax', function(obj) {
                ajaxObj = obj;
            });
        });

        it('on post', function() {
            util.post(testUrl, {});
            ajaxObj.error(testErr);
            expect(util.getErrorMessage()).to.equal(testErr.responseText);
            expect(util.getErrorDescription()).to.contain(testUrl);
        });

        it('on get', function() {
            util.get(testUrl, {});
            ajaxObj.error(testErr);
            expect(util.getErrorMessage()).to.equal(testErr.responseText);
            expect(util.getErrorDescription()).to.contain(testUrl);
        });

    });

});
