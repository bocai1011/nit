import $ from 'jquery';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import util from 'common/utils/util';
import TableWidget from 'common/components/TableWidget';

var sandbox = sinon.sandbox.create();

describe('TableWidget', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('should create a ReactElement', function () {
        var el = React.createElement(TableWidget);
        expect(TestUtils.isElementOfType(el, TableWidget))
            .to.be.true;
    });

    it('should make an HTTP POST on mount', function () {

        sandbox.stub(util, 'post', function() { return $.Deferred() });

        var params = { much: 'wow' };
        var el = React.createElement(TableWidget, {
            url: '/internet',
            params: params,
        });

        TestUtils.renderIntoDocument(el);

        expect(util.post).been.calledWith('/internet', params);
    });

});
