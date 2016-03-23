import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import keyboardNavItems from 'common/components/MenuBar/KeyboardNavItems';
import MenuBar from 'common/components/MenuBar/MenuBar';

var sandbox;
var ntUtils = new NeatTestUtils(React);
var NeatOpts;

describe('MenuBar', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        NeatOpts = {
            PowerTool: {value: true}
        };

        sandbox.stub(NeatApp, 'getApp', function() {
            return {
                NeatOptions: NeatOpts
            };
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    function renderHelper(props) {
        if (typeof props === 'undefined') {
            props = {};
        };

        return ntUtils.renderWithContext(MenuBar, {
            props: props
        });
    }

    // test if text snippet is contained in some menu bar item
    function isTextInMenu(component, text) {
        var menuItems = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'li');

        return menuItems.some(function(item) {
            var itemText = item.getDOMNode().textContent.toLowerCase();
            return (itemText.indexOf(text) > -1);
        });
    }

    it('should have a link to the PowerTool if enabled', function() {
        var component = renderHelper();
        expect(isTextInMenu(component, 'power tool')).to.be.true;
    });

    it('should not have a link to the PowerTool if disabled', function() {
        NeatOpts.PowerTool.value = false;
        var component = renderHelper();
        expect(isTextInMenu(component, 'power tool')).to.be.false;
    });

    it('should have a link to the About page', function() {
        var component = renderHelper();
        expect(isTextInMenu(component, 'about neat')).to.be.true;
    });

    it('should not have a staging link if no case selected', function() {
        var component = renderHelper();
        expect(isTextInMenu(component, 'staging')).to.be.false;
    });

    it('should not have a reports link if no case selected', function() {
        var component = renderHelper();
        expect(isTextInMenu(component, 'reports')).to.be.false;
    });

    it('should scroll to the footer if it is a marketing page', function () {
        var component = renderHelper({ marketing: true });
        var scrollSpy = sandbox.spy();
        sandbox.stub(document, 'getElementById', function () {
            return {
                scrollIntoView: scrollSpy,
            };
        });

        component._about({
            preventDefault: function () {},
        });

        expect(scrollSpy).to.have.been.calledWith({
            block: 'end',
            behavior: 'smooth',
        });
    });

    it('should launch the Dev Manual', function () {
        var component = renderHelper();
        sandbox.stub(window, 'open');
        component._launchDevManual();
        expect(window.open).been.calledWith('/devmanual/');
    })

    it('should open a new tab', function () {
        var component = ntUtils.renderWithContext(MenuBar, {
            currentPath: '/hello/yall',
        });

        sandbox.stub(window, 'open');

        component._newTab();
        expect(window.open)
            .to.have.been.calledWith('#/hello/yall', '_blank');
    });

    describe('#_keyboardNavListener', function () {

        it('should call the corresponding function on keypress',
            function () {
                var component = renderHelper();
                keyboardNavItems[1337] = sandbox.spy();
                component._keyboardNavListener({
                    altKey: true,
                    keyCode: 1337,
                    preventDefault: function () {},
                });

                expect(keyboardNavItems[1337]).to.have.been.called;
                delete keyboardNavItems[1337];
            }
        );

        it('should transition to the corresponding page on keypress',
            function () {
                var transitionSpy = sandbox.spy();
                sandbox.stub(NeatApp, 'getCurrentCase', function () {
                    return false;
                });
                keyboardNavItems[1337] = 'cool-page';
                var component = ntUtils.renderWithContext(MenuBar, {
                    transitionTo: transitionSpy,
                });

                component._keyboardNavListener({
                    altKey: true,
                    keyCode: 1337,
                    preventDefault: function () {},
                });

                expect(transitionSpy).been.calledWith('cool-page', false);
            }
        );

    });

    describe('with a current case', function() {

        beforeEach(function() {
            ntUtils.stubCurrentCase(NeatApp, {
                name: 'foo',
                base: 'foo'
            });
        });

        afterEach(function() {
            ntUtils.unsetCase(NeatApp);
        });

        it('should contain a link to the current case', function() {
            var component = renderHelper();
            expect(isTextInMenu(component, 'case: foo')).to.be.true;
        });

        it('should have a staging link', function() {
            var component = renderHelper();
            expect(isTextInMenu(component, 'staging')).to.be.true;
        });

        describe('with an unfinalized current case', function() {

            beforeEach(function() {
                sandbox.stub(NeatApp, 'finalized', () => false);
            });

            it('should not have a reports link', function() {
                var component = renderHelper();
                expect(isTextInMenu(component, 'reports')).to.be.false;
            });
        });

        describe('with an finalized current case', function() {

            beforeEach(function() {
                sandbox.stub(NeatApp, 'finalized', () => true);
            });

            it('should not have a reports link', function() {
                var component = renderHelper();
                expect(isTextInMenu(component, 'reports')).to.be.true;
            });
        });
    });
});
