import React from 'react';
import { Route, Redirect, RouteHandler, Navigation, State } from 'react-router';
import util from 'common/utils/util';

import PageCaseOverview from 'staging/pages/CaseOverview';
import PageStagingOverview from 'staging/pages/StagingOverview/StagingOverview';
import PageStagingFiles from 'staging/pages/FilesOverview';
import PageStagingFile from 'staging/pages/StagingFile/StagingFile';
import PageStagingCreateDB from 'staging/pages/CreateDB';
import PageStagingInterpretation from 'staging/pages/Interpretation';
import PageStagingRefData from 'staging/pages/RefData';
import PageStagingSymbols from 'staging/pages/Symbols/Symbols';
import PageStagingFinalize from 'staging/pages/Finalize/Finalize';
import PageStagingExport from 'staging/pages/Export/Export';
import PageStagingShare from 'staging/pages/Share';

/**
 * Pass through route handler.
 * Use this handler when you want a nested route to handle rendering.
 */
const PassThrough = React.createClass({
    mixins: [Navigation, State],

    getInitialState: function() {
        // Grab the Navigation and State functions and store them in
        // our global util function, for easy access.
        util.setTransitionTo(this.transitionTo);
        util.setReplaceWith(this.replaceWith);
        util.setRouteContext(this.context);

        return null;
    },

    render: function() {
        return <RouteHandler {...this.props} />;
    }
});

/**
 * Routes for the single page webapp frontend.
 * @exports routes
 */
const routes = [
    <Route name="case-overview" handler={PageCaseOverview}/>,
    <Redirect path="staging" to="overview"/>,
    <Route name="staging" handler={PassThrough}>
        <Route name="overview" handler={PageStagingOverview}/>
        <Route name="files" handler={PageStagingFiles}/>
        <Route name="stage-file" path="file/:fileIndex" handler={PageStagingFile}/>
        <Route name="create_database" handler={PageStagingCreateDB}/>
        <Route name="interpretation" handler={PageStagingInterpretation}/>
        <Route name="refdata" handler={PageStagingRefData}/>
        <Route name="symbols" handler={PageStagingSymbols}/>
        <Route name="finalize" handler={PageStagingFinalize}/>
        <Route name="share" handler={PageStagingShare}/>
        <Route name="export" handler={PageStagingExport}/>
    </Route>
];

export default routes;
