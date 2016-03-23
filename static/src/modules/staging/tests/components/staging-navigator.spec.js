import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import { Link } from 'react-router';
import { ModalTrigger } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import StagingNavigator from 'staging/components/StagingNavigator';

describe('StagingNavigator', function() {

    var ntUtils = new NeatTestUtils(React);

    var sandbox;
    var currentCase;
    var component;

    // Reference to mocked data is here so we can re-assign in testcases
    var currentParams;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        currentCase = ntUtils.stubCurrentCase(NeatApp);

        // Restore default mocked data values
        currentParams = { fileIndex: 0 };

        // Wire up mocked data & functions
        sandbox.stub(NeatApp, 'stageDone', function() { return true; });
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    function renderHelper(routes) {
        var opts = {
            currentParams: currentParams,
            routes: routes
        };
        component = ntUtils.renderWithContext(StagingNavigator, opts);
    }

    // Helper function that asserts a previous / next link is correct
    function expectDirection(linkName, direction) {
        var navigator = TestUtils.findRenderedDOMComponentWithClass(component, 'staging-navigator-buttons');
        var links = TestUtils.scryRenderedComponentsWithType(navigator, Link);

        var idx = 0;
        if (links.length > 1 && direction === 'right') {
            idx = 1;
        }

        expect(links[idx].props.to).to.equal(linkName);
        var arrows = TestUtils.scryRenderedDOMComponentsWithClass(
            links[idx], 'glyphicon-chevron-' + direction);
        expect(arrows.length).to.equal(1);
    }

    function expectPrev(linkName) {
        expectDirection(linkName, 'left');
    }

    function expectNext(linkName) {
        expectDirection(linkName, 'right');
    }

    // Helper function that asserts a previous / next link triggers a modal
    function expectNotification(direction) {
        var triggers = TestUtils.scryRenderedComponentsWithType(
            component, ModalTrigger);

        var idx = 0;
        if (triggers.length > 1 && direction === 'right') {
            idx = 1;
        }

        var arrows = TestUtils.scryRenderedDOMComponentsWithClass(
            triggers[idx], 'glyphicon-chevron-' + direction);
        expect(arrows.length).to.equal(1);
    }

    function expectNextNotification() {
        expectNotification('right');
    }


    // Overview
    //

    it('should have overview -> files', function() {
        renderHelper([{ name: 'overview' }]);
        TestUtils.scryRenderedComponentsWithType(component, Link);
        expectNext('files');
    });


    // Files
    //

    it('should have overview <- files', function() {
        renderHelper([{ name: 'files' }]);
        TestUtils.scryRenderedComponentsWithType(component, Link);
        expectPrev('overview');
    });

    it('should have files -> Notification , when there are remaining files', function() {
        renderHelper([{ name: 'files' }]);
        TestUtils.scryRenderedComponentsWithType(component, Link);
        //expectNext('stage-file');
        expectNextNotification();
    });

    it('should have files -> create_database when files are done', function() {
        currentCase.stagingFiles = [{ file: { length: 1 }, success: true }];
        sandbox.stub(NeatApp, 'dbCreated', function() { return true; });
        sandbox.stub(NeatApp, 'filesDone', function() { return true; });
        sandbox.stub(NeatApp, 'canCreateDb', function() { return true; });
        renderHelper([{ name: 'files' }]);
        TestUtils.scryRenderedComponentsWithType(component, Link);
        expectNext('create_database');
    });

    it('should have files -> Notification when db not created', function() {
        currentCase.stagingFiles = [{ file: { length: 1 }, success: true }];
        sandbox.stub(NeatApp, 'dbCreated', function() { return false; });
        sandbox.stub(NeatApp, 'canCreateDb', function() { return false; });
        renderHelper([{ name: 'files' }]);
        TestUtils.scryRenderedComponentsWithType(component, Link);
        expectNextNotification();
    });


    // Stage-file
    //

    it('should have files <- stage-file if no previous files', function() {
        renderHelper([{ name: 'stage-file' }]);
        expectPrev('files');
    });

    it('should have stage-file <- stage-file if previous file exists', function() {
        currentCase.stagingFiles = [
            { file: { length: 1 }, success: false },
            { file: { length: 1 }, success: true }
        ];
        currentParams.fileIndex = 1;
        renderHelper([{ name: 'stage-file' }]);
        expectPrev('stage-file');
    });

    it('should have stage-file -> Notification on error', function() {
        renderHelper([{ name: 'stage-file' }]);
        expectNextNotification();
    });

    it('should have stage-file -> stage-file if next file exists', function() {
        currentCase.stagingFiles = [
            { file: { length: 1 }, success: true },
            { file: { length: 1 }, success: false }
        ];
        renderHelper([{ name: 'stage-file' }]);
        expectNext('stage-file');
    });

    it('should have stage-file -> files if no next file exist', function() {
        currentCase.stagingFiles = [{ file: { length: 1 }, success: true }];
        renderHelper([{ name: 'stage-file' }]);
        expectNext('files');
    });


    // CreateDB
    //
    it('should have files <- create_database', function() {
        renderHelper([{ name: 'create_database' }]);
        expectPrev('files');
    });

    it('should have create_database -> Notification when createDB is not completed', function() {
        sandbox.stub(NeatApp, 'dbCreated', function() { return false; });
        renderHelper([{ name: 'create_database' }]);
        expectNextNotification();
    });

    it('should have create_database -> interpretation when createDB is completed', function() {
        sandbox.stub(NeatApp, 'dbCreated', function() { return true; });
        sandbox.stub(NeatApp, 'canCreateDb', function() { return true; });
        renderHelper([{ name: 'create_database' }]);
        expectNext('interpretation');
    });

    // Interpretation
    //

    it('should have create_database <- interpretation', function() {
        currentCase.stagingFiles = [{ file: { length: 1 }, success: true }];
        sandbox.stub(NeatApp, 'interpCompleted', function() { return true; });
        renderHelper([{ name: 'interpretation' }]);
        expectPrev('create_database');
    });

    it('should have interpretation -> Notification when interp is not completed', function() {
        sandbox.stub(NeatApp, 'interpCompleted', function() { return false; });
        renderHelper([{ name: 'interpretation' }]);
        expectNextNotification();
    });

    it('should have interpretation -> refdata when interp is completed', function() {
        sandbox.stub(NeatApp, 'interpCompleted', function() { return true; });
        renderHelper([{ name: 'interpretation' }]);
        expectNext('refdata');
    });


    // RefData
    //

    it('should have interpretation <- refdata', function() {
        renderHelper([{ name: 'refdata' }]);
        expectPrev('interpretation');
    });

    it('should have refdata -> symbols', function() {
        renderHelper([{ name: 'refdata' }]);
        expectNext('symbols');
    });


    // Symbols
    //

    it('should have refdata <- symbols', function() {
        renderHelper([{ name: 'symbols' }]);
        expectPrev('refdata');
    });

    it('should have symbols -> finalize', function() {
        renderHelper([{ name: 'symbols' }]);
        expectNext('finalize');
    });


    // Finalize

    it('should have symbols <- finalize', function() {
        sandbox.stub(NeatApp, 'finalized', function() { return false; });
        renderHelper([{ name: 'finalize' }]);
        expectPrev('symbols');
    });

    it('should have finalize -> export', function() {
        sandbox.stub(NeatApp, 'finalized', function() { return true; });
        renderHelper([{ name: 'finalize' }]);
        expectNext('export');
    });

    it('should have finalize -> Notification if NeatApp not finalized', function() {
        sandbox.stub(NeatApp, 'finalized', function() { return false; });
        renderHelper([{ name: 'finalize' }]);
        expectNextNotification();
    });

    // Share
    //

    it('should have export <- share', function() {
        renderHelper([{ name: 'share' }]);
        expectPrev('export');
    });

    it('should have export -> share', function() {
        renderHelper([{ name: 'export'}]);
        expectNext('share');
    });

    it('should have share -> report-list', function() {
        renderHelper([{ name: 'share' }]);
        expectNext('reports-start');
    });

});
