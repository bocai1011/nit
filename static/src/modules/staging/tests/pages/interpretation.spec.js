import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Button } from 'react-bootstrap';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import AppButton from 'common/components/AppButton';
import MappableWidget from 'staging/components/MappableWidget/MappableWidget';
import Interpretation from 'staging/pages/Interpretation';

describe('Interpretation', function() {

    var sandbox, component;
    var ntUtils = new NeatTestUtils(React);

    // Reference to mocked data is here so we can re-assign in testcases
    var interpData;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        ntUtils.stubCurrentCase(NeatApp);

        // Restore default mocked data values
        interpData = { data: { tables: {}, options: {}}};

        // Wire up mocked data & functions
        sandbox.stub(NeatApp, 'getInterpData', function() {
            return interpData;
        });
        sandbox.stub(NeatApp, 'interpCompleted', function() {
            return false;
        });
        var stubApp = { NeatOptions: { DatabaseNames: { value: 'foo' }}};
        sandbox.stub(NeatApp, 'getApp', function() { return stubApp; });
        ntUtils.stubForHelpBlurb(stubApp);
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should render X number of MappableWidgets', function() {
        interpData = {
            data: {
                tables: {
                    foo: {
                        pandas: { values: [] }
                    },
                    bar: {
                        pandas: { values: [] }
                    }
                },
                options: { foo: [], bar: [] }
            }
        };

        // render
        component = ntUtils.renderWithContext(Interpretation);

        // find the mappable widget components
        var mws = TestUtils.scryRenderedComponentsWithType(
            component, MappableWidget);

        expect(mws.length).to.equal(
            Object.keys(interpData.data.tables).length);
    });

    it('should call setInterpData() on select', function() {
        // set `code` var to force isValid to be true
        interpData = {
            data: {
                tables: {
                    foo: {
                        pandas: { values: [{ code: 1 }] }
                    },
                    bar: {
                        pandas: { values: [{ code: 1 }] }
                    }
                },
                options: { foo: ['opt1'], bar: ['opt1']}
            }
        };

        sandbox.stub(NeatApp, 'setInterpData', function() {});

        // render
        component = ntUtils.renderWithContext(Interpretation);

        // find the mappable widget components
        var mws = TestUtils.scryRenderedComponentsWithType(
            component, MappableWidget);

        // Toggle the dropdown
        var btns = TestUtils.scryRenderedDOMComponentsWithTag(
            mws[0], 'button');
        TestUtils.Simulate.focus(btns[0].getDOMNode());
        TestUtils.Simulate.click(btns[0].getDOMNode());

        // Simulate click
        var anchors = TestUtils.scryRenderedDOMComponentsWithTag(
            mws[0], 'a');
        TestUtils.Simulate.click(anchors[0].getDOMNode());

        expect(NeatApp.setInterpData).to.have.been.called;
    });

    it('should get interperables from server', function() {
        interpData = null;
        sandbox.stub(NeatApp, 'setInterpData', function() {});

        // capture callback from util call
        var cb;
        sandbox.stub(util, 'get', function(__, _cb) {
            cb = _cb;
        });

        // render
        component = ntUtils.renderWithContext(Interpretation);

        expect(util.get.args[0][0]).to.contain('/get_interpretation_tables/');

        // call the callback with our test data and assert it has been set
        // in the component
        var testInterpData = { data: { tables: {}}};
        cb(testInterpData);
        expect(NeatApp.setInterpData).to.have.been.calledWith(testInterpData);
    });

    it('should trigger confirm', function() {
        sandbox.stub(NeatApp, 'interpChanged', function() {});
        sandbox.stub(NeatApp, 'markInterpComplete', function() {});

        // capture callback from util call
        var cb;
        sandbox.stub(util, 'post', function(__, ___, _cb) {
            cb = _cb;
        });

        // render
        component = ntUtils.renderWithContext(Interpretation);

        // click the "Confirm" button
        var btns = TestUtils.scryRenderedComponentsWithType(
            component, Button);
        var btn = ntUtils.filterByTextContent(btns, 'Confirm');
        TestUtils.Simulate.click(btn.getDOMNode());

        // expect util POST to be made
        expect(util.post.args[0][0]).to.contain('/set_interpretation_tables/');

        // trigger the util callback and expect markInterpComplete to be called
        cb();
        expect(NeatApp.markInterpComplete).to.have.been.called;
    });

    it('should trigger reset', function() {
        sandbox.stub(NeatApp, 'interpChanged', function() {});

        // render
        component = ntUtils.renderWithContext(Interpretation);

        // mock the component now that its rendered
        sandbox.stub(component, '_getInterperables', function() {});
        sandbox.stub(component, 'setState', function() {});

        // click the "Reset" button
        var appBtns = TestUtils.scryRenderedComponentsWithType(
            component, AppButton);
        var resetAppBtn = appBtns[1];
        var resetBtn = TestUtils.findRenderedComponentWithType(
            resetAppBtn, Button);
        TestUtils.Simulate.click(resetBtn.getDOMNode());

        // Confirm the modal
        var btns2 = TestUtils.scryRenderedComponentsWithType(
            resetAppBtn._overlayInstance, Button);
        TestUtils.Simulate.click(btns2[0].getDOMNode());

        expect(NeatApp.interpChanged).to.have.been.called;
        expect(component._getInterperables).to.have.been.called;
        expect(component.setState).to.have.been.called;
    });


    it('should prevent confirmation if all records excluded', function() {
        interpData = {
            data: {
                tables: {
                    foo: {
                        pandas: { values: [{code: NeatApp.EXCLUDE_CODE}] }
                    },
                    bar: {
                        pandas: { values: [{code: NeatApp.EXCLUDE_CODE}] }
                    }
                },
                options: { foo: [], bar: [] }
            }
        };

        // render
        component = ntUtils.renderWithContext(Interpretation);

        // click the "Confirm" button
        var appBtns = TestUtils.scryRenderedComponentsWithType(
            component, AppButton);
        var confirmAppBtn = appBtns[0];
        var confirmBtn = TestUtils.findRenderedComponentWithType(
            confirmAppBtn, Button);
        TestUtils.Simulate.click(confirmBtn.getDOMNode());

        // confirm the guard appears
        expect(confirmAppBtn._overlayInstance.props.title).to.equal('All records excluded');
    });
});
