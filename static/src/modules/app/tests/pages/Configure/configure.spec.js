import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import Configure from 'app/pages/Configure/Configure';

var sandbox, component;
var ntUtils = new NeatTestUtils(React);

describe('Configure', function() {

    var neatOpts;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    function renderHelper() {
        sandbox.stub(NeatApp, 'getApp', function() {
            return { NeatOptions: neatOpts };
        });

        component = ntUtils.renderWithContext(Configure);
    }

    it('should render X number of checkbox rows', function() {
        neatOpts = {
            opt1: { input: 'checkbox' },
            opt2: { input: 'checkbox' },
            opt3: { input: 'checkbox' }
        };

        renderHelper();

        var trs = TestUtils.scryRenderedDOMComponentsWithTag(
            component,
            'tr'
        );
        expect(trs.length).to.equal(Object.keys(neatOpts).length + 1);
    });

});
