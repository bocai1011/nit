import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ButtonLink from 'common/components/ButtonLink';

var ntUtils = new NeatTestUtils(React);

describe('ButtonLink', function () {

    it('should transition on click', function () {
        var sandbox = sinon.sandbox.create();
        var transitionSpy = sandbox.spy();
        var props = {
            to: 'waffle-house',
            params: { order: 'all-start-special' },
        };

        var component = ntUtils.renderWithContext(ButtonLink, {
            transitionTo: transitionSpy,
            props: props,
        });

        var btn = TestUtils.findRenderedDOMComponentWithTag(
            component, 'button'
        );

        TestUtils.Simulate.click(btn);
        expect(transitionSpy).been.calledWith(props.to, props.params);
    });

});
