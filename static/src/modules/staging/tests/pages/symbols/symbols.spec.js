import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Button} from 'react-bootstrap';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import Symbols from 'staging/pages/Symbols/Symbols';
import ReferenceData from 'staging/services/ReferenceData';
import AppButton from 'common/components/AppButton';

describe('Symbols', function() {

    var sandbox, component, mockGrid, mockData;
    var ntUtils = new NeatTestUtils(React);

    var SELECT = 'select';
    var EXCLUDE = 'exclude';

    var testCase = 'foo';
    var testOid = 42;
    var mockPandaValues;

    beforeEach(function () {
        component = null;
        sandbox = sinon.sandbox.create();
        ntUtils.stubCurrentCase(NeatApp);
        sandbox.stub(NeatApp, 'caseName', function() { return testCase; });
        sandbox.stub(NeatApp, 'getApp',
            function() { return ntUtils.stubForHelpBlurb(); });

        mockPandaValues = [
            {oid: testOid, foo: 1, price: 2, excld: false},
            {oid: -1, foo: 3, price: 4, excld: false},
            {oid: -2, foo: 5, price: 6, excld: false}
        ];

        mockData = {
            data: {
                pandas: {
                    values: mockPandaValues
                }
            },
            meta: {
                columns: [
                    'foo',
                    'price'
                ]
            }
        };

        var mockDataView = {
            getLength: function() {
                return mockPandaValues.length;
            },
            getItem: function(i) {
                return mockPandaValues[i];
            }
        };

        mockGrid = {
            getDataItem: function(idx) {
                return mockPandaValues[idx];
            },
            invalidate: function() {},
            setSelectedRows: function() {},
            getData: function() {
                return mockDataView;
            }
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    function renderHelper() {
        component = ntUtils.renderWithContext(Symbols);
        component._onLoad(mockData);
        sandbox.stub(component, '_getUnderlyingGrid', function() {
            return mockGrid;
        });
        return component;
    }

    /**
     * Click on a "toggle" checkbox in the DOM
     * @param whichOne (str) will search checkboxes for one which contains
     *   this string in its ID
     */
    function clickToggleCheckbox(whichOne) {
        // find toggle checkbox and send click event
        var inputs = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'input');
        var checkboxes = _.filter(inputs, function(input) {
            return (input.getDOMNode().id.indexOf(whichOne) !== -1);
        });
        var toggleCheckbox = checkboxes[0];
        var mockEvent = { target: { checked: true }};
        TestUtils.Simulate.click(toggleCheckbox.getDOMNode(), mockEvent);
    }

    it('should POST to \'/set_symbol_table/\' on confirmation', function() {
        component = renderHelper();
        var postStub = sandbox.stub(util, 'post', function() {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred;
        });

        // Find the confirm button and click it
        var confirmAppBtn = TestUtils.findRenderedComponentWithType(
            component, AppButton);
        var confirmBtn = TestUtils.findRenderedComponentWithType(
            confirmAppBtn, Button);
        TestUtils.Simulate.click(confirmBtn.getDOMNode());

        // Find the confirm button in the modal and click it
        var btns = TestUtils.scryRenderedComponentsWithType(
            confirmAppBtn._overlayInstance, Button);
        var confirmModalBtn = ntUtils.filterByTextContent(btns, 'Confirm');
        TestUtils.Simulate.click(confirmModalBtn.getDOMNode());

        // Expect that on the first call, the first arg equals our value
        expect(postStub.args[0][0]).to.equal('/set_symbol_table/' + testCase);
    });

    it('should set selected row on active cell', function() {
        component = renderHelper();
        component._handleActiveCell({}, {row: 1, cell: 0, grid: mockGrid});
        expect(component.state.highlightSection).to.be.null;
    });

    it('should set `highlightSection` for certain columns', function() {
        component = renderHelper();
        component._handleActiveCell({}, {row: 0, cell: 1, grid: mockGrid});
        expect(component.state.highlightSection).to.equal('price');
    });

    it('should call `invalidate` when security has been updated', function() {
        component = renderHelper();
        sandbox.stub(mockGrid, 'invalidate', function() {});

        // stub out the getValidation call
        var deferredGetValidation = $.Deferred();
        sandbox.stub(ReferenceData, 'getValidation', function() {
            return deferredGetValidation;
        });

        component._handleSecurityUpdate([testOid]);
        expect(ReferenceData.getValidation.args[0][0]).to.eql([testOid]);

        // resolve getValidation server call
        deferredGetValidation.resolve([{foo: -1, price: -1, oid: testOid}]);

        // should update underlying pandas data
        var testRecord = _.find(
            component.state.data.data.pandas.values, {oid: testOid});
        expect(testRecord.price).to.equal(-1);

        // sould invalidate grid (so it re-renders)
        expect(mockGrid.invalidate).to.have.been.called;
    });

    it('should call `setSelectedRows` when select-toggle clicked', function() {
        component = renderHelper();
        sandbox.spy(mockGrid, 'setSelectedRows');
        // click select-toggle checkbox
        clickToggleCheckbox(SELECT);
        expect(mockGrid.setSelectedRows).to.have.been.called;
    });

    it('`handleSelectedRows` should set selectedOids state', function() {
        component = renderHelper();

        component._handleSelectedRows(undefined, {
            rows: _.range(mockPandaValues.length),
            grid: mockGrid
        });

        var expectedOids = _.map(mockPandaValues, 'oid');
        expect(component.state.selectedOids).to.eql(expectedOids);
    });

    it('should toggle exclude state when exclude-toggle button clicked', function() {
        component = renderHelper();

        // precondition: excld state should be false
        _.each(component.state.data.data.pandas.values, function(datum) {
            expect(datum.excld).to.be.false;
        });

        // click exclude-toggle checkbox
        clickToggleCheckbox(EXCLUDE);

        // postcondition: excld state should be true
        _.each(component.state.data.data.pandas.values, function(datum) {
            expect(datum.excld).to.be.true;
        });
    });

    it('should toggle exclude state on selected securities when exclude-toggle button clicked', function() {
        component = renderHelper();

        var rangeEnd = 2;
        var expectExcluded = rangeEnd;
        var expectedNotExcluded = mockPandaValues.length - rangeEnd;
        var excludeCnt = 0;
        var notExcludeCnt = 0;

        // grab only a subset of the mock rows to set as our "selection"
        var mockPandaSubset = mockPandaValues.slice(0, rangeEnd);
        component._handleSelectedRows(undefined, {
            rows: _.range(mockPandaSubset.length),
            grid: mockGrid
        });

        // precondition: excld state should be false
        _.each(component.state.data.data.pandas.values, function(datum) {
            expect(datum.excld).to.be.false;
        });

        // click exclude-toggle checkbox
        clickToggleCheckbox(EXCLUDE);

        // postcondition: excld state
        _.each(component.state.data.data.pandas.values, function(datum) {
            if (_.map(mockPandaSubset, 'oid').indexOf(datum.oid) !== -1) {
                // should be true if its is in our mock subset
                expect(datum.excld).to.be.true;
                excludeCnt += 1;
            } else {
                // should be false otherwise
                expect(datum.excld).to.be.false;
                notExcludeCnt += 1
            }
        });

        expect(excludeCnt).to.equal(expectExcluded);
        expect(notExcludeCnt).to.equal(expectedNotExcluded);
    });

    it('#_guard() should return a guard if all securities are excluded',
        function () {
            component = renderHelper();

            // click exclude-toggle checkbox
            clickToggleCheckbox(EXCLUDE);

            let guard = component._guard();
            expect(guard.title).to.equal('No symbols to analyze!');
        }
    );
});
