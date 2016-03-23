import React from 'react'
import 'reports/utils/CreateReports';
import { Route, RouteHandler, Navigation, State } from 'react-router';
import util from 'common/utils/util';
import q from 'common/utils/queryFactory';

import { getReportByUrl } from 'reports/utils/ReportHelper';
import PageStart from 'reports/pages/Start';
import PageAllReports from 'reports/pages/AllReports';
import PageLegacyReports from 'reports/pages/LegacyReports';
import PageDataReports from 'reports/pages/DataReports';
import PageRegulationReports from 'reports/pages/RegulationReports';

/**
 * Pass through route handler.
 * Use this handler when you want a nested route to handle rendering.
 */
const PassThrough = React.createClass({
    mixins: [Navigation, State],

    componentWillMount: function() {

        // Grab the Navigation and State functions and store them in
        // our global util function, for easy access.
        util.setTransitionTo(this.transitionTo);
        util.setReplaceWith(this.replaceWith);
        util.setRouteContext(this.context);

    },

    render: function() {
        return <RouteHandler {...this.props} />;
    }
});

const ReportHandler = React.createClass({
    /*shouldComponentUpdate: function(nextProps, nextState){
        //Todo: This will break if a report has a link to itself
        return false
    },*/

    render: function() {
        var reportUrl = this.props.params.report;
        var ReportPage = getReportByUrl(reportUrl);

        return (
            <div className="container-fluid">
                <ReportPage />
            </div>
        );
    }
});

/**
 * Routes for the single page webapp frontend.
 * @exports routes
 */
const routes = (
    <Route name="reports" handler={PassThrough}>
        <Route name="reports-start" handler={PageStart} />
        <Route name="all-reports" handler={PageAllReports} />
        <Route name="regulation-reports" handler={PageRegulationReports} />
        <Route name="data-reports" handler={PageDataReports} />
        <Route name="legacy-reports" handler={PageLegacyReports} />

        <Route name="report" path=":report" handler={ReportHandler} />
    </Route>
);

export default routes;
