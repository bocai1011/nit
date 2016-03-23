import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import katex from 'katex';
import Katex from 'common/components/Katex';

var sandbox;

describe('Katex', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should call katex.render', function() {
        sandbox.spy(katex, 'render');
        var el = React.createElement(Katex);
        TestUtils.renderIntoDocument(el);
        expect(katex.render).to.have.been.called;
    });
});
