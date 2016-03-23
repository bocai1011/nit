import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NewOpen from 'app/pages/Landing/NewOpen';

describe('NewOpen', function () {

    var el,
        component;

    var ntUtils = new NeatTestUtils(React);
    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
        el = React.createElement(NewOpen);
        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should render two buttons', function () {
        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(
            component,
            'button'
        );

        expect(buttons.length).to.equal(2);
        expect(buttons[0].getDOMNode().textContent).to.contain('New Case');
        expect(buttons[1].getDOMNode().textContent).to.contain('Open Case');
    });

    it('should render a text input when the User clicks New Case',
        function () {
            var newCaseBtn = TestUtils.scryRenderedDOMComponentsWithTag(
                component,
                'button'
            ).shift();

            TestUtils.Simulate.click(newCaseBtn);
            expect(component.state.newCase).to.be.true;
            var input = TestUtils.findRenderedDOMComponentWithTag(
                component,
                'input'
            );

            expect(input).to.exist;
        }
    );

    it('should transition to the cases page when the User clicks Open Case',
        function () {
            var transitionToSpy = sandbox.spy();
            component = ntUtils.renderWithContext(NewOpen, {
                transitionTo: transitionToSpy,
            });

            var openCaseBtn = TestUtils.scryRenderedDOMComponentsWithTag(
                component,
                'button'
            ).pop();

            TestUtils.Simulate.click(openCaseBtn);
            expect(transitionToSpy).to.have.been.calledWith('cases');
        }
    );

    it('should cancel new case when _cancel is called', function () {
        el = React.createElement(NewOpen, { startWith: true });
        component = TestUtils.renderIntoDocument(el);

        expect(component.state.newCase).to.be.true;
        component._cancel();
        expect(component.state.newCase).to.be.false;
    });

});
