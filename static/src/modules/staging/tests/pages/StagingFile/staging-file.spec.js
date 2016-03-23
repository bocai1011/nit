import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import StatusLabel from 'staging/components/StatusLabel';
import StagingFile from 'staging/pages/StagingFile/StagingFile';

describe('StagingFile', function() {

    var sandbox, component;
    var ntUtils = new NeatTestUtils(React);

    // Reference to mocked data is here so we can re-assign in testcases
    var stagingFiles, props;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        // Restore default mocked data values
        stagingFiles = [{}];
        props = { params: { fileIndex: 0 }};

        // Wire up mocked data & functions
        ntUtils.stubCurrentCase(NeatApp, { stagingFiles: stagingFiles });
        sandbox.stub(NeatApp, 'saveCurrentCase', function() {});
        sandbox.stub(NeatApp, 'caseName', function() {
            return 'foo';
        });
        var stubApp = { NeatOptions: { DatabaseNames: { value: 'foo' }}};
        sandbox.stub(NeatApp, 'getApp', function() { return stubApp; });
        ntUtils.stubForHelpBlurb(stubApp);
    });

    afterEach(function () {
        sandbox.restore();
    });

    function renderHelper() {
        var opts = {
            currentParams: { fileIndex: 0 },
            props: props
        };
        component = ntUtils.renderWithContext(StagingFile, opts);
    }

    it('should request and set the layout if not provided', function() {
        // reference to layout name we will be testing for
        var testLayout = 'test';

        // reference to the callback called within the requestData func
        var cb;

        // stub the util post function and capture the callback reference
        sandbox.stub(util, 'post',
            function(url, __, _cb) {
                cb = _cb;
            }
        );

        // render the component
        renderHelper();

        // setup stubs to state altering functions, do this after the render
        // as this is when our component reference is ready
        var setStateStub = sandbox.stub(component, 'setState', function() {});
        var saveStateStub = sandbox.stub(component, '_saveState', function() {});

        // trigger the callback only after the stubs are in place
        cb({ layout: testLayout });

        // assert the save is state correctly
        expect(setStateStub.args[0][0].layout).to.equal(testLayout);
        expect(saveStateStub).to.have.been.called;
    });


    describe('with a layout', function() {

        var testLayout;

        var cfpStub, bpStub;

        beforeEach(function() {
            // create a test layout we will reference later
            testLayout = [{
                mapping: { name: 'foo', type: 'bar'},
                options: [{name: 'foo'}],
                values: [{}]
            }];

            // wire up the test layout
            var _sf = { layout: testLayout, file: { length: 1 }};
            stagingFiles.splice(0, stagingFiles.length, _sf);

            // set up stubs
            cfpStub = sandbox.stub(NeatApp, 'cleanFileProcessing', function() {});
        });

        it('should use provided layout', function() {
            renderHelper();
            bpStub = sandbox.stub(component, 'beginProcessing', function() {});
            // assert the test layout got set correctly
            expect(component.state.layout).to.equal(testLayout);
        });

        function findProcessBtn() {
            // find all buttons
            var buttons = TestUtils.scryRenderedDOMComponentsWithTag(
                component, 'button');

            // find the process button
            var button = buttons.filter(function(btn) {
                return (btn.getDOMNode().textContent.toLowerCase()
                    .indexOf('process') !== -1);
            });

            return button[0];
        }

        // Check if a snippet of text is contained in the labels
        function inLabels(text) {
            var labels = TestUtils.scryRenderedComponentsWithType(
                component, StatusLabel);
            return labels.some(function(_label) {
                var _text = _label.getDOMNode().textContent.toLowerCase();
                return (_text.indexOf(text) > -1);
            });
        }

        it('should start processing on Process button click', function() {
            renderHelper();
            bpStub = sandbox.stub(component, 'beginProcessing', function() {});

            // click the process button
            TestUtils.Simulate.click(findProcessBtn().getDOMNode());

            expect(cfpStub).to.have.been.calledWith(props.params.fileIndex);
            expect(bpStub).to.have.been.called;
        });

        it('should display a successful process state', function() {
            // add linecount to staging file to test successful processing
            var _sf = { layout: testLayout, file: { length: 1 }, lineCount: 1 };
            stagingFiles.splice(0, stagingFiles.length, _sf);

            renderHelper();
            bpStub = sandbox.stub(component, 'beginProcessing', function() {});

            // click the process button
            TestUtils.Simulate.click(findProcessBtn().getDOMNode());
            component.onSuccessfulProcess();
            component.forceUpdate();

            expect(inLabels('successfully processed')).to.be.true;
        });

        it('should display an unsuccessful process state', function() {
            // add error state to the staging file to test unsuccessful processing
            var _sf = { layout: testLayout, file: { length: 1 }, error: true, errorCount: 1 };
            stagingFiles.splice(0, stagingFiles.length, _sf);

            renderHelper();
            bpStub = sandbox.stub(component, 'beginProcessing', function() {});

            // click the process button
            TestUtils.Simulate.click(findProcessBtn().getDOMNode());
            component.onSuccessfulProcess();
            component.forceUpdate();

            expect(inLabels('neat encountered too many errors')).to.be.true;
        });
    });
});
