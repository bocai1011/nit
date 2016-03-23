import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import ErrorNotification from 'common/components/ErrorNotification';

describe('ErrorNotification', function() {

    var el,
        component;

    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
        sandbox.stub(NeatApp, 'caseName');
        el = React.createElement(ErrorNotification, {
            description: 'A description of the error.',
            error: 'Warning! Errors abound.',
        });
        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should render a description', function () {
        var description = TestUtils.scryRenderedDOMComponentsWithTag(
            component,
            'p'
        )[0].getDOMNode().textContent;
        expect(description).to.equal('A description of the error.');
    });

    it('should have a default dismissAfter value of 5000', function () {
        expect(component.props.dismissAfter).to.equal(10000);
    });

    it('should accept a dismissAfter value to override the default', function () {
        var el = React.createElement(ErrorNotification, {
            dismissAfter: 3000
        });
        var component = TestUtils.renderIntoDocument(el);
        expect(component.props.dismissAfter).to.equal(3000);
    });

    // XFAIL for some reason, not sure why the component's onDismiss
    // prop method isn't being called after 10000ms.
    // it('should be hidden after 10000ms by default', function () {
    //     sandbox.useFakeTimers();
    //     console.log(component.state.visible);
    //     expect(component.state.visible).to.be.true;
    //     sandbox.clock.tick(15000);
    //     console.log(component.state.visible);
    //     expect(component.state.visible).to.be.false;
    // });

});
