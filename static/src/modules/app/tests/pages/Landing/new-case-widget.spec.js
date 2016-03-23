import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import util from 'common/utils/util';
import NewCaseWidget from 'app/pages/Landing/NewCaseWidget';

describe('NewCaseWidget', function () {

    var component,
        transitionToSpy;

    var ntUtils = new NeatTestUtils(React);
    var sandbox = sinon.sandbox.create();

    function simulateEnterCaseName(input, caseName) {
        TestUtils.Simulate.change(input, {
            target: {
                value: caseName,
            },
        });
    }

    beforeEach(function () {
        transitionToSpy = sandbox.spy();
        component = ntUtils.renderWithContext(NewCaseWidget, {
            transitionTo: transitionToSpy,
            props: {
                onCancel: sandbox.spy(),
            },
        });
    })

    afterEach(function () {
        sandbox.restore();
    });

    it('should render two buttons and a text input', function () {
        var input = TestUtils.findRenderedDOMComponentWithTag(
            component,
            'input'
        );

        var buttons = TestUtils.scryRenderedDOMComponentsWithTag(
            component,
            'button'
        );

        expect(input).to.exist;
        expect(buttons).to.have.length(2);
    });

    it('should call props.onCancel() when User clicks the cancel button',
        function () {
            component._cancel();
            expect(component.props.onCancel).to.have.been.called;
        }
    );

    describe('#_create()', function () {

        var success,
            error,
            postStub,
            input;

        beforeEach(function () {
            postStub = sandbox.stub(util, 'post',
                function (_route, _data, _success, _error) {
                    success = _success;
                    error = _error;
                }
            );

            input = TestUtils.findRenderedDOMComponentWithTag(
                component,
                'input'
            );
        });

        it('should create a new case', function () {
            simulateEnterCaseName(input, 'foo');
            component._create();
            expect(component.state.creating).to.be.true;
            expect(postStub).to.have.been.calledWith('/new_case/foo');
            success({ name: 'bar' });
            expect(transitionToSpy).to.have.been.calledWith(
                'overview',
                { name: 'bar' }
            );
        });

        it('should set state.create to false and exit on err', function () {
            simulateEnterCaseName(input, 'foo');
            component._create();
            expect(component.state.creating).to.be.true;
            expect(postStub).to.have.been.calledWith('/new_case/foo');
            error();

            expect(transitionToSpy).not.to.have.been.called;
            expect(component.state.creating).to.be.false;
        });

        it('should just return if the case name is invalid', function () {
            simulateEnterCaseName(input, '');
            component._create();
            expect(postStub).not.to.be.called;
            expect(component.state.creating).to.be.false;
        })

    });

});
