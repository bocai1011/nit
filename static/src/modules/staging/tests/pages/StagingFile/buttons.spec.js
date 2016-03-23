import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import util from 'common/utils/util';
import Buttons from 'staging/pages/StagingFile/Buttons';

var ntUtils = new NeatTestUtils(React);
var sandbox = sinon.sandbox.create();

var component;

describe('Buttons', function () {

    beforeEach(function () {
        sandbox.stub(util, 'post');
        ntUtils.stubCurrentCase(NeatApp, {
            name: 'Casey',
        });

        var el = React.createElement(Buttons, {
            doImport: sandbox.spy(),
            error: 'Yikes!',
            item: {
                type: 'cool',
                file: 'things.csv',
            },
            onMount: sandbox.spy(),
            processing: false,
            reset: sandbox.spy(),
        });

        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should call props.onMount when it mounts', function () {
        expect(component.props.onMount).to.have.been.called;
    });

    it('should call props.doImport when the process button is clicked',
        function () {
            var btn = TestUtils.scryRenderedDOMComponentsWithTag(
                component, 'button'
            )[0];

            TestUtils.Simulate.click(btn);
            expect(component.props.doImport).to.have.been.called;
        }
    );

});
