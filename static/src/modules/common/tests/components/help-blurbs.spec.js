import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import HelpBlurbs from 'common/components/HelpBlurbs';

describe('HelpBlurbs', function() {

    let sandbox = sinon.sandbox.create();

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(NeatApp, 'caseName');
        sandbox.stub(NeatApp, 'finalized', () => true);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should return an object of functions that return react elements',
        function() {
            Object.keys(HelpBlurbs).forEach(function(key) {
                var el = HelpBlurbs[key]();
                expect(TestUtils.isElement(el)).to.be.true;
            });
        }
    );

});
