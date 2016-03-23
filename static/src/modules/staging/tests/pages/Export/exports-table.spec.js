import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Alert } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import AppButton from 'common/components/AppButton';
import ExportsTable from 'staging/pages/Export/ExportsTable';
import ExportsTableItem from 'staging/pages/Export/ExportsTableItem';

describe( 'ExportsTable', function() {

    var sandbox, component, props;
    var ntUtils = new NeatTestUtils(React);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        ntUtils.stubCurrentCase(NeatApp);

        sandbox.stub(NeatApp, 'getApp',
            function() { return ntUtils.stubForHelpBlurb(); });

        // initialize props
        props = {
            name: 'foo',
            available: true,
            includes: ['one']
        };
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should render N ExportsTableItem components', function() {
        props.includes = ['one', 'two', 'three'];
        component = ntUtils.renderWithContext(ExportsTable, {props: props});
        var items = TestUtils.scryRenderedComponentsWithType(
            component, ExportsTableItem);
        expect(items.length).to.equal(props.includes.length);
    });

    it('should render an alert if not available', function() {
        props.available = false;
        component = ntUtils.renderWithContext(ExportsTable, {props: props});
        var alert = TestUtils.findRenderedComponentWithType(
            component, Alert);
        expect(alert).to.exist;
    });

    it('should call beginProcessing on Generate CSV click', function() {
        component = ntUtils.renderWithContext(ExportsTable, {props: props});

        // stub the beginProcessing call
        sandbox.stub(component, 'beginProcessing', function() {});

        // click the generate button
        var btns = TestUtils.scryRenderedComponentsWithType(
            component, AppButton);
        var genBtn = btns[0];

        TestUtils.Simulate.click(genBtn.getDOMNode());
        expect(component.beginProcessing).to.have.been.called;
    });
});
