import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import AppButton from 'common/components/AppButton';

var el,
    component;

var ntUtils = new NeatTestUtils(React);
var sandbox = sinon.sandbox.create();

describe('AppButton', function () {

    afterEach(function () {
        sandbox.restore();
    });

    describe('with a <Modal>', function () {

        var modal;

        beforeEach(function () {
            el = (<AppButton
                    name='NewCase'
                    onClick={sandbox.spy()}
                    confirm='Some confirmation text!'
                />);

            component = TestUtils.renderIntoDocument(el);
            component.setState({ isModalOpen: true });
            modal = component.renderOverlay();
            modal = TestUtils.renderIntoDocument(modal);
        });

        it('should render a modal with a confirm string', function () {
            sandbox.spy(TestUtils, 'findRenderedDOMComponentWithClass');
            var modalBody = TestUtils.findRenderedDOMComponentWithClass(
                modal, 'modal-body'
            );
            expect(modalBody).to.exist;
            expect(TestUtils.findRenderedDOMComponentWithClass)
                .not.to.throw;
        });

        it('should close the modal when Close is clicked', function () {
            var btns = TestUtils.scryRenderedDOMComponentsWithTag(
                modal, 'button'
            );

            var closeBtn = ntUtils.filterByTextContent(btns, 'Cancel');
            expect(component.state.isModalOpen).be.true;
            TestUtils.Simulate.click(closeBtn.getDOMNode());
            expect(component.state.isModalOpen).be.false;
        });

        it('should call onClick and then close when Confirm clicked',
            function () {
                var btns = TestUtils.scryRenderedDOMComponentsWithTag(
                    modal, 'button'
                );

                var confirmBtn = ntUtils.filterByTextContent(
                    btns, 'Confirm'
                );

                expect(component.state.isModalOpen).be.true;
                TestUtils.Simulate.click(confirmBtn.getDOMNode());
                expect(component.props.onClick).been.called;
                expect(component.state.isModalOpen).be.false;
            }
        );

    })

});
