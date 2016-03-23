import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Input as RBInput } from 'react-bootstrap';
import util from 'common/utils/util';
import CaseNameInput from 'app/pages/Landing/CaseNameInput';

describe('CaseNameInput', function () {

    var el,
        component,
        Input;

    var sandbox = sinon.sandbox.create();

    function simulateChange(caseName) {
        var input = TestUtils.findRenderedDOMComponentWithTag(
            component,
            'input'
        );

        TestUtils.Simulate.change(input, {
            target: {
                value: caseName,
            },
        });
    }

    beforeEach(function () {
        sandbox.stub(util, 'get', function (route, callback) {
            callback([
                { base: 'foo' },
            ]);
        });

        el = React.createElement(CaseNameInput, {
            onEnter: sandbox.spy(),
            onCancel: sandbox.spy(),
        });

        component = TestUtils.renderIntoDocument(el);
        Input = TestUtils.findRenderedComponentWithType(
            component,
            RBInput
        );
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should render a ReactBootstrap.Input with nothing in it',
        function () {
            expect(Input).to.exist;
            expect(Input.props.value).to.equal('');
            expect(Input.props.bsStyle).to.equal('error');
        }
    );

    it('should show a success message when a valid case name is entered',
        function () {
            simulateChange('new');
            expect(component.state.value).to.equal('new');
            expect(Input.props.label).to.equal('Press enter to create');
            expect(Input.props.bsStyle).to.equal('success');
        }
    );

    it('should show an error message when no case name is entered',
        function () {
            simulateChange('new');
            expect(Input.props.bsStyle).to.equal('success');
            simulateChange('');
            expect(Input.props.bsStyle).to.equal('error');
            expect(Input.props.label).to.equal('Enter new case name');
        }
    );

    it('should show an error message when an existing case name is entered',
        function () {
            simulateChange('foo');
            expect(Input.props.label).to.equal('Case name already exists');
            expect(Input.props.bsStyle).to.equal('error');
        }
    );

    it('should call onEnter() when its <form> is submitted', function () {
        var form = TestUtils.findRenderedDOMComponentWithTag(
            component,
            'form'
        );

        TestUtils.Simulate.submit(form);
        expect(component.props.onEnter).to.have.been.called;
    });

    it('should call onCancel() when ESC is pressed', function () {
        var input = TestUtils.findRenderedDOMComponentWithTag(
            component,
            'input'
        );

        TestUtils.Simulate.keyUp(input, {
            keyCode: 27,
        });

        expect(component.props.onCancel).to.have.been.called;
    });

});
