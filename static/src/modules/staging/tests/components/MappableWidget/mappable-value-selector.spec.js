import $ from 'jquery';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Button } from 'react-bootstrap';
import q from 'common/utils/queryFactory';
import NeatApp from 'app/utils/NeatApp';
import util from 'common/utils/util';
import MappableValueSelector from 'staging/components/MappableWidget/MappableValueSelector';

describe('MappableValueSelector', function () {
    var sandbox, component;
    var ntUtils = new NeatTestUtils(React);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should create a valid ReactElement', function () {
        var el = React.createElement(MappableValueSelector);
        expect(TestUtils.isElementOfType(el, MappableValueSelector)).true;
    });

    it('should trigger view transactions', function() {
        sandbox.stub(util, 'post', function() { return $.Deferred(); });
        sandbox.stub(q.stagings, 'get_interp_transactions', () => {
            return {};
        });
        sandbox.stub(NeatApp, 'ItemNameMap', function() {return 'test';});
        sandbox.stub(NeatApp, 'getNiceName', function() {return 'test';});
        sandbox.stub(NeatApp, 'caseName', function() {return 'test';});
        sandbox.stub(NeatApp, 'isLocked', function() {return true;});
        sandbox.stub(NeatApp, 'getApp', ntUtils.stubForHelpBlurb);
        var opt = {'props': { 'row': { 'count': 1}, 'options': [{nice_name: 'Foo', name: 'FOO', description: 'foo'},] }};
        // render
        component = ntUtils.renderWithContext(MappableValueSelector, opt);
        // click the "View Transactions" button
        var btns = TestUtils.scryRenderedComponentsWithType(component, Button);
        var btn = ntUtils.filterByTextContent(btns, 'View');
        TestUtils.Simulate.click(btn.getDOMNode());

        // expect query to be made
        expect(q.stagings.get_interp_transactions).to.have.been.called;
    });

});
