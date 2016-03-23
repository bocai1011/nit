import $ from 'jquery';
import _ from 'lodash';
import q from 'common/utils/queryFactory';
import util from 'common/utils/util';
import PhaseConsts from 'app/utils/PhaseConsts';

var NeatApp = null;
var CurrentCase = null;
var CurrentNavigator = null;

/**
 * A lookup table from table OIDs to codes. It will be updated whenever a new
 * case is loaded and each time a Staging phase gets completed
 * (after CreateDB.)
 */
var mappings = {};

/**
 * Main app object.
 * This object stores app state as well as current case state.
 * TODO: Consider factoring out these two states into separate objects.
 * @exports NeatApp
 */
const app = {
    EXCLUDE_CODE: 'SKIP',

    /**
     * All the info related to the current case's state in each
     * phase of staging.
     */
    PhaseInfo: [
        {name: PhaseConsts.REGISTRANTFILES, title: 'Import Registrant Files', link: 'files', stage:1},
        {name: PhaseConsts.CREATEDB, title: 'Create Case Database', link: 'create_database', stage:12},
        {name: PhaseConsts.INTERPRETATION, title: 'Interpret Table Columns', link: 'interpretation', stage:2},
        {name: PhaseConsts.REFERENCEDATA, title: 'Reference Data', link: 'refdata', stage:3},
        {name: PhaseConsts.RECTIFICATION, title: 'Rectify Database Symbols', link: 'symbols', stage:4},
        {name: PhaseConsts.FINALIZE, title: 'Finalize', link: 'finalize', stage:5},
        {name: PhaseConsts.EXPORT, title: 'Export Data', link: 'export'},
        {name: PhaseConsts.SHARE, title: 'Share Case', link: 'share'},
    ],

    /**
     * Get the phase info associated with a staging phase name.
     * @param {string} name - The name of the staging phase.
     * @returns {object} An object holding information about the staging phase.
     */
    getPhaseInfo: function(name) {
        for (var i = 0; i < app.PhaseInfo.length; i++) {
            if (app.PhaseInfo[i].name === name) {
                return app.getCurrentCase().stagingPhases[i];
            }
        }

        return null;
    },

    /**
     * Static information for interpreting staging status.
     */
    StatusLookup: {
        locked: {
            bsStyle:'success', progressStyle:'progress-complete', glyph:'lock',
            label: 'Completed and locked.'
        },

        complete: {
            bsStyle:'success', progressStyle:'progress-complete', glyph:'check-square',
            label: 'Completed.'
        },

        active: {
            bsStyle:'info', progressStyle:'progress-incomplete', glyph:'square-o',
            label: 'Ready to begin work on.'
        },

        inactive: {
            bsStyle:'default', progressStyle:'progress-unavailable', glyph:'square',
            label: 'Unavailable. Complete earlier phases first.',
            description: 'This stage is currently unavailable. Please complete earlier stages first.',
        },
    },

    /**
     * Static map to help translate between database names
     * and nice English names for display to the user.
     */
    NiceNameMap: {
        trade_blotter          : 'Trade Blotter',
        initial_position       : 'Initial Position',
        employee_trade_blotter : 'Employee Trade Blotter',
        restricted_list        : 'Restricted List',
        returns_list           : 'Returns List',
        bbg_security           : 'Bloomberg Securities',

        side     : 'Trade Side',
        sec_type : 'Security Type',
        currency : 'Currency',
    },

    /**
     * Gets the nice display name associated with a given database variable name.
     * @param {string} name - A database variable name.
     * @returns {string} The nice display name.
     */
    getNiceName: function(name) {
        return app.NiceNameMap[name] || name;
    },

    /**
     * Get the NEAT app object.
     * @returns {object} The NEAT app object.
     */
    getApp: function () {
        return NeatApp;
    },

    /**
     * Set the NEAT app object.
     * @param {object} The NEAT app object.
     */
    setApp: function (obj) {
        NeatApp = obj;
    },

    /**
     * Close down NEAT.
     * Tells the server to close anything related to the current case.
     */
    closeApp: function() {
        if (CurrentCase === null) {
            return;
        }

        var name = CurrentCase.name;

        if (CurrentCase) {
            util.post('/close_case/' + name, {},
            function () {
                console.log('Case ' + name + ' closed.');
            },
            function (xhr, status, err) {
                console.log('Error closing case.');
                console.log(xhr);
                console.log(status);
                console.log(err);
                return true;
            });
        }
    },

    /**
     * Save the current Neat configuration.
     */
    saveApp: function() {
        util.post('/set_config/', NeatApp);
    },

    /**
     * Save the current case configuration.
     * @returns {object} jQuery.Deferred object for the POST request
     */
    saveCurrentCase: function() {
        return util.post('/save_case/' + CurrentCase.name, CurrentCase);
    },

    /**
     * Lock the current case, update the case configuration.
     */
    lockCase: function() {
        return util.get('/update_locking/locked/'+ CurrentCase.name,
            function (json) {
                return app.setCurrentCase(json);
            },
            function (xhr, status, err) {
                console.log('Error locking case.');
                console.log(xhr);
                console.log(status);
                console.log(err);
                return true;
            });
    },

    /**
     * Unlock the current case, update the case configuration.
     */
    unlockCase: function() {
        return util.get('/update_locking/unlocked/'+ CurrentCase.name,
            function (json) {
                return app.setCurrentCase(json);
            },
            function (xhr, status, err) {
                console.log('Error unlocking case.');
                console.log(xhr);
                console.log(status);
                console.log(err);
                return true;
            });
    },

    nextFile: function(index) {
        var files = app.getCurrentCase().stagingFiles;
        for (var i = index + 1; i < files.length; i++) {
            var file = files[i];
            if (file.file && file.file.length && !file.success) {
                return i;
            }
        }

        return -1;
    },

    prevFile: function(index) {
        var files = app.getCurrentCase().stagingFiles;
        for (var i = index - 1; i >= 0; i--) {
            var file = files[i];
            if (file.file && file.file.length && !file.success) {
                return i;
            }
        }

        return -1;
    },


    /**
     * Reset state associated with file processing for a single file.
     * This does not reset work done staging the file, just processing it.
     * @param {int} The index of the file to clean.
     */
    cleanFileProcessing: function(fileIndex) {
        var item = CurrentCase.stagingFiles[fileIndex];
        item.error = null;
        item.success = null;
        item.errorCount = null;
        item.lineCount = null;

        app.filesChanged();
        app.updateNavigator();
    },

    /**
     * Reset state associated with staging a file.
     * @param {int} The index of the file to clean.
     */
    cleanFileItem: function(fileIndex) {
        var item = CurrentCase.stagingFiles[fileIndex];
        item.layout = null;
        item.success = null;
        item.errorCount = null;
        item.lineCount = null;

        app.filesChanged();
        app.updateNavigator();
    },

    /**
     * Call when any file in staging has changed, been added, or been removed.
     * This cleans and marks as incomplete next dependent staging phase and may trigger chain-event furthers.
     */
    filesChanged: function() {
        var fileStage = app.getPhaseInfo(PhaseConsts.REGISTRANTFILES);
        fileStage.statusCode = 'active';

        app.dbChanged();
    },

    /**
     * Call when db or previous dependency changes
     * This cleans and marks as incomplete next dependent staging phase and may trigger chain-event further.
     */
    dbChanged: function() {
        var dbStage = app.getPhaseInfo(PhaseConsts.CREATEDB);
        dbStage.statusCode = 'active';

        app.cleanInterp();
    },

    /**
     * Clean state associated with interpretation phase.
     */
    cleanInterp: function() {
        app.setInterpData(null);
        app.interpChanged();
    },

    /**
     * Call when any data in the interpretation stage has changed.
     * This cleans and marks as incomplete next dependent staging phase and may trigger chain-event further.
     */
    interpChanged: function() {
        var interpStage = app.getPhaseInfo(PhaseConsts.INTERPRETATION);
        interpStage.statusCode = 'active';

        app.refDataChanged();
    },

    /**
     * Call when any refData staging data has changed.
     * This cleans and marks as incomplete all dependent staging phases.
     */
    refDataChanged: function() {
        var refDataStage = app.getPhaseInfo(PhaseConsts.REFERENCEDATA);
        refDataStage.statusCode = 'active';

        app.rectifyChanged();
    },

    /**
     * Call when any data in the rectification stage has changed.
     * This cleans and marks as incomplete next dependent staging phase and may trigger chain-event further.
     */
    rectifyChanged: function() {
        var rectifyStage = app.getPhaseInfo(PhaseConsts.RECTIFICATION);
        rectifyStage.statusCode = 'active';

        app.finalizeChanged();
    },

    /**
     * Call when any data in the Finalize stage has changed; currently None
     * This also server as the end of previous staging phase change's chain reaction
     * It make the final update and save the case
     */
    finalizeChanged: function() {
        var finalStage = app.getPhaseInfo(PhaseConsts.FINALIZE);
        finalStage.statusCode = 'active';

        app.updateStagingStatus({update:false});
        app.saveCurrentCase();
    },

    /**
     * @return {bool} Whether the current case has a trade blotter.
     */
    hasTradeBlotter: function() {
        var files = CurrentCase.stagingFiles;
        var tradeBlotter = files[0];
        return tradeBlotter.file && tradeBlotter.file.length > 0;
    },

    /**
     * @return {bool} Whether the current case has a successfully processed trade blotter.
     */
    validTradeBlotter: function() {
        var files = CurrentCase.stagingFiles;

        return files[0].file.length > 0;
    },

    /**
     * @return {bool} Whether the current case has a successfully processed trade blotter.
     */
    completedTradeBlotter: function() {
        var files = CurrentCase.stagingFiles;

        return files[0].success && files[0].file.length > 0;
    },

    /**
     * Mark the user are done with loading files
     * @return {string} The status code associated with the file staging phase of Staging.
     */
    markFilesDone: function() {
        var fileStage = app.getPhaseInfo(PhaseConsts.REGISTRANTFILES);
        fileStage.statusCode = 'complete';

        app.updateStagingStatus({update:true});
        app.saveCurrentCase();
    },


    /**
     * Mark the database as successfully created.
     * @return {string} The status code associated with the file staging phase of Staging.
     */
    markDbAsCreated: function() {
        var dbStage = app.getPhaseInfo(PhaseConsts.CREATEDB);
        dbStage.statusCode = 'complete';

        app.updateStagingStatus({update:true});
        app.saveCurrentCase();
    },

    /**
     * @return {bool} Whether the case's database is ready to be created.
     */
    canCreateDb: function() {
        var files = CurrentCase.stagingFiles;

        var allValid = _.every(files, function(f) { return f.success || f.file.length === 0; });
        return allValid && app.validTradeBlotter();
    },

    /**
     * @return {bool} Whether the user has indicated that he is done loading files.
     */
    filesDone: function() {
        var fileStage = app.getPhaseInfo(PhaseConsts.REGISTRANTFILES);
        return fileStage.statusCode === 'complete';
    },

    /**
     * @return {bool} Whether the current case has a successfully created database.
     */
    dbCreated: function() {
        var dbStage = app.getPhaseInfo(PhaseConsts.CREATEDB);
        return dbStage.statusCode === 'complete';
    },

    /**
     * Get the data associated with interpretation phase of staging.
     * @return {object} Data associated with interpretation phase of staging.
     */
    getInterpData: function() {
        var interpStage = app.getPhaseInfo(PhaseConsts.INTERPRETATION);
        return interpStage.data;
    },

    /**
     * Set the data associated with interpretation phase of staging.
     * @param {object} Data associated with interpretation phase of staging.
     */
    setInterpData: function(data) {
        var interpStage = app.getPhaseInfo(PhaseConsts.INTERPRETATION);
        interpStage.data = data;

        app.saveCurrentCase();
    },

    /**
     * Mark the interpretation phase of staging as complete.
     */
    markInterpComplete: function() {
        var interpStage = app.getPhaseInfo(PhaseConsts.INTERPRETATION);
        interpStage.statusCode = 'complete';

        app.updateStagingStatus({update:true});
        app.saveCurrentCase();
    },

    /**
     * @return {bool} Whether the interpretation phase of staging is complete.
     */
    interpCompleted: function() {
        var interpStage = app.getPhaseInfo(PhaseConsts.INTERPRETATION);
        return interpStage.statusCode === 'complete';
    },

    /**
     * Mark the refData phase of staging as complete.
     */
    markRefDataComplete: function() {
        var refDataStage = app.getPhaseInfo(PhaseConsts.REFERENCEDATA);
        refDataStage.statusCode = 'complete';
        app.updateStagingStatus({update:true});
    },

    /**
     * @return {bool} Whether the ref data phase of staging is complete.
     */
    refDataCompleted: function() {
        var refDataStage = app.getPhaseInfo(PhaseConsts.REFERENCEDATA);
        return refDataStage.statusCode === 'complete';
    },

    /**
     * Mark the rectification phase of staging as complete.
     */
    markRectifyComplete: function() {
        var rectifyStage = app.getPhaseInfo(PhaseConsts.RECTIFICATION);
        rectifyStage.statusCode = 'complete';

        app.updateStagingStatus({update:true});
    },

    /**
     * @return {bool} Whether the rectification phase of staging is complete.
     */
    rectifyCompleted: function() {
        var rectifyStage = app.getPhaseInfo(PhaseConsts.RECTIFICATION);
        return rectifyStage.statusCode === 'complete';
    },

    /**
     * Mark the finalization phase of staging as complete.
     */
    markAsFinalized: function() {
        var finalizeStage = app.getPhaseInfo(PhaseConsts.FINALIZE);
        finalizeStage.finalized = 'success';

        app.updateStagingStatus({update:true});
    },

    /**
     * @return {bool} Whether the current case is ready to be finalized.
     */
    canFinalize: function() {
        // var finalizeStage = app.getPhaseInfo(PhaseConsts.FINALIZE);
        return true;
    },

    /**
     * @return {bool} Whether the finalization phase of staging is complete.
     */
    finalized: function() {
        var finalizeStage = app.getPhaseInfo(PhaseConsts.FINALIZE);
        return finalizeStage.finalized === 'success';
    },

    /**
     * mark the current case as shared.
     */
    markAsShared: function() {
        CurrentCase.shared = true;
    },

    /**
     * @return {bool} Whether the current case is locked.
     */
    isShared: function() {
        return CurrentCase.shared;
    },

    /**
     * @return {bool} Whether the current case is locked.
     */
    isLocked: function() {
        return CurrentCase.status === 'locked';
    },

    /**
     * @return {bool} Whether the current case is ready to be locked.
     */
    canLock: function() {
        return app.finalized();
    },

    /**
     * Adds a case-share timestamp to our collection of case-share timestamps.
     * This allows us to show to the user all instances of sharing of the CurrentCase,
     * including when it was shared.
     */
    addShareMark: function() {
        var shareStage = app.getPhaseInfo(PhaseConsts.SHARE);
        if (!shareStage.shares) {
            shareStage.shares = [];
        }

        shareStage.shares.push(Date.now());
        app.saveCurrentCase();
    },

    /**
     * @return {list} List of share-case timestamps.
     */
    getShareMarks: function() {
        var shareStage = app.getPhaseInfo(PhaseConsts.SHARE);
        return shareStage.shares ? shareStage.shares : [];
    },

    /**
     * Whether a staging phase in the current case is done or not.
     * @param {object} A staging phase object.
     * @return {bool} Whether a staging phase in the current case is done or not.
     */
    stageDone: function(stage) {
        return stage.statusCode === 'complete' || stage.statusCode === 'locked';
    },

    /**
     * Update all staging statuses for all phases of staging.
     * @param {params} An object storing flags for how to update.
                       params.update stores whether the staging navigator should update.
     */
    updateStagingStatus: function(params) {
        // Registrant files
        var fileStage = app.getPhaseInfo(PhaseConsts.REGISTRANTFILES);
        if (!app.stageDone(fileStage)) {
            if (app.dbCreated() && app.canCreateDb()) {
                fileStage.statusCode = 'complete';
            }
            else {
                fileStage.statusCode = 'active';
            }
        }

        // Create DB
        var createDbStage = app.getPhaseInfo(PhaseConsts.CREATEDB);
        if (app.stageDone(fileStage)) {
            if (!app.stageDone(createDbStage)) {
                createDbStage.statusCode = 'active';
            }
        }
        else {
            createDbStage.statusCode = 'inactive';
        }

        // Interpretation
        var interpStage = app.getPhaseInfo(PhaseConsts.INTERPRETATION);
        if (app.stageDone(createDbStage)) {
            if (!app.stageDone(interpStage)) {
                interpStage.statusCode = 'active';
            }
        }
        else {
            interpStage.statusCode = 'inactive';
        }

        // refData
        var refDataStage = app.getPhaseInfo(PhaseConsts.REFERENCEDATA);
        if (app.stageDone(interpStage)) {
            if (!app.stageDone(refDataStage)) {
                refDataStage.statusCode = 'active';
            }
        }
        else {
            refDataStage.statusCode = 'inactive';
        }

        // Symbol Rectification
        var rectifyStage = app.getPhaseInfo(PhaseConsts.RECTIFICATION);
        if (app.stageDone(refDataStage)) {
            if (!app.stageDone(rectifyStage)) {
                rectifyStage.statusCode = 'active';
            }
        }
        else {
            rectifyStage.statusCode = 'inactive';
        }

        // Finalization
        var finalizeStage = app.getPhaseInfo(PhaseConsts.FINALIZE);
        if (app.stageDone(rectifyStage)) {
            if (finalizeStage.finalized) {
                finalizeStage.statusCode = 'complete';
            }
            else if (!app.stageDone(finalizeStage)) {
                finalizeStage.finalized = undefined;
                finalizeStage.statusCode = 'active';
            }
        }
        else {
            finalizeStage.finalized = undefined;
            finalizeStage.statusCode = 'inactive';
        }

        if (params.update) {
            app.updateNavigator();
        }

        app.loadMappings();

    },

    /**
     * Update the staging navigator UI.
     */
    updateNavigator: function() {
        if (CurrentNavigator) {
            CurrentNavigator.forceUpdate();
        }
    },

    /**
     * Get the staging navigator UI.
     * @return {object} The current staging navigator object.
     */
    getNavigator: function () {
        return CurrentNavigator;
    },

    /**
     * Set the staging navigator UI.
     * @param {object} The current staging navigator object.
     */
    setNavigator: function (obj) {
        CurrentNavigator = obj;
    },

    /**
     * Get the current case's full name, eg foo-542642709842-6424765902.
     * @return {string} The current case's full name.
     */
    caseName: function() {
        return CurrentCase.name;
    },

    /**
     * Get the current case's short name, eg foo for case foo-542642709842-6424765902.
     * @return {string} The current case's short name.
     */
    caseShortName: function() {
        return CurrentCase.base;
    },

    /**
     * Get the current case object.
     * @return {object} The current case.
     */
    getCurrentCase: function () {
        return CurrentCase;
    },

    /**
     * Set the current case object.
     * @param {object} The current case.
     */
    setCurrentCase: function (obj) {
        CurrentCase = obj;
    },

    /**
     * Return the currently stored OID-code mappings.
     */
    getMappings: function () {
        return mappings;
    },

    /**
     * Update the currently stored OID-code mappings. Only make the request for
     * the mappings after the case database has been created. Before then, the
     * mappings won't exist.
     */
    loadMappings: function () {
        if (app.dbCreated()) {
            return q.jsutil.mappings({}).useData().then(data => {
                mappings = data;
            });
        }
    },

    /**
     * Create a report link
     * @param {object} An object holding info about how the link should be made.
     * @return {object} The created report link.
     */
    reportLink: function (info) {
        var link = {};

        link.params = {};
        link.params.name = app.caseName();
        link.params.report = info.report_id;

        link.query = info.query;

        return link;
    },

    /**
     * Get the display name associated with a dropdown item.
     * @param {object} item - The item to get the name for.
     * @param {bool} selected - Whether the item is selected or not.
     * @return {string} The name of the item.
     */
    ItemNameMap: function(item, selected){
        if (!item) {
            return null;
        }

        if (selected && item.selected_display) {
            return item.selected_display;
        } else if (app.getApp().NeatOptions.DatabaseNames.value) {
            return item.name || item;
        } else {
            return item.nice_name || item.name || item;
        }
    },
};

export default app;
