import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Manual from 'app/pages/Manual/Manual';

describe('Manual', function() {

    var ntUtils = new NeatTestUtils(React);

    var sandbox = sinon.sandbox.create();

    afterEach(function () { sandbox.restore(); });

    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(Manual))).to.be.true;
    });

    it('should render', function () {
        var component = ntUtils.renderWithContext(Manual, {
            currentParams: {
                section: 'staging',
            },
        });

        expect(component).to.exist;

    });

    it('should scroll to the anchor upon mounting', function () {

        var element = {
            scrollIntoView: sandbox.spy(),
        };

        sandbox.useFakeTimers();
        sandbox.stub(window, 'scrollBy');
        sandbox.stub(document, 'getElementById', function () {
            return element;
        });

        ntUtils.renderWithContext(Manual, {
            props: {
                params: {
                    section: 'staging',
                },
            },
        });

        sandbox.clock.tick(15);

        expect(element.scrollIntoView).to.have.been.called;
        expect(window.scrollBy).to.have.been.called;
    });

    it('should call scrollToAnchor() on update', function () {

        sandbox.useFakeTimers();

        var component = ntUtils.renderWithContext(Manual);
        sandbox.stub(component, '_scrollToAnchor');

        component.forceUpdate();
        sandbox.clock.tick(15);
        expect(component._scrollToAnchor).to.have.been.called;
    });

    it('should not scroll if it does not get a valid anchor', function () {

        sandbox.useFakeTimers();
        sandbox.spy(document, 'getElementById');

        var component = ntUtils.renderWithContext(Manual, {
            props: {
                params: {
                    section: null,
                },
            },
        });

        sandbox.spy(component, '_scrollToAnchor');

        sandbox.clock.tick(15);
        expect(component._scrollToAnchor).to.have.been.called;
        expect(document.getElementById).not.to.have.been.called;

    });

});
