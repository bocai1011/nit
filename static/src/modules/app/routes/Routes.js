import React from 'react';
import {
    Route,
    Redirect,
    DefaultRoute,
    RouteHandler,
    Navigation,
    State,
} from 'react-router';

import util from 'common/utils/util';
import query from 'reports/utils/query';
import transform from 'reports/utils/transform';

import BrowserGuard from 'app/components/BrowserGuard';
import CaseFrame from 'app/components/CaseFrame';
import DashboardFrame from 'app/components/DashboardFrame';
import Startup from 'app/components/Startup';
import StartupCheck from 'app/components/StartupCheck';

import PageAbout from 'app/pages/About';
import PageCases from 'app/pages/PageCases/PageCases';
import PageConfigure from 'app/pages/Configure/Configure';
import PageError from 'app/pages/Error';
import PageLanding from 'app/pages/Landing/Landing';
import PageManual from 'app/pages/Manual/Manual';
import PageOpenCase from 'app/pages/OpenCase';
import PageStatus from 'app/pages/Status';

import PageStagingUnfinished from 'staging/pages/StagingUnfinished';

import stagingRoutes from 'staging/routes/Routes';
import reportRoutes from 'reports/routes/Routes';

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
 * Pass through route handler.
 * Use this handler when you want a nested route to handle rendering.
 */
const AppHandler = React.createClass({
    mixins: [ State ],

    render: function() {
        return <RouteHandler {...this.props} />;
    }
});

/**
 * Dashboard frame that has no marketing footer.
 */
const NoMarketingFrame = React.createClass({
    render: function() {
        return <DashboardFrame marketing={false} hasAbout={false} {...this.props}/>;
    }
});

/**
 * Dashboard frame specialized for the in-app manual.
 * Has no marketing footer.
 */
const ManualFrame = React.createClass({
    render: function() {
        return <DashboardFrame marketing={false} hasAbout={false} isManual={true} {...this.props}/>;
    }
});

/**
 * Dashboard frame for creating a new case.
 * Same as the PageLanding frame, passes a flag to automatically have
 * a new case text box already open.
 */
const NewCase = React.createClass({
    render: function() {
        return <PageLanding newCaseDialogOpen={true} {...this.props}/>;
    }
});

/**
 * Dashboard frame for the About page.
 */
const AboutNeat = React.createClass({
    render: function() {
        return <AboutPage {...this.props}/>;
    }
});


const routes = (
    <Route name="app" path="/" handler={AppHandler}>
        <Route name="widget_output_csv" path="/report_output/:name/:report/:widget/csv" handler={PassThrough}/>
        <Route name="widget_output_xlsx" path="/report_output/:name/:report/:widget/xlsx" handler={PassThrough}/>
        <Route name="report_output_xlsx" path="/report_output/:name/:report/xlsx" handler={PassThrough}/>

        <Route name="startup" path="/startup" handler={Startup}/>
        <Route name="browser-guard" path="/browser-guard" handler={BrowserGuard}/>

        {/* All displayed pages are nested under the neat path.
            The neat route guarantees that StartupCheck is run,
            which grabs any needed global state before continuing.
            There are two main groups of pages: Dashboard and Case. */}
        <Route name="neat" path="/" handler={StartupCheck}>
            {/* Dashboard pages.
                All dasboard pages are case agnostic. */}

            {/* The initial landing page.
                This is the only dashboard page that has a marketing footer. */}
            <Route name="dashboard" path="/dashboard" handler={DashboardFrame}>
                <Route name="new-case" handler={NewCase} />
                <DefaultRoute handler={PageLanding}/>
            </Route>

            {/* All non-manual child dashboard pages. */}
            <Route path="/dashboard" handler={NoMarketingFrame}>
                <Route name="cases" handler={PageCases} />
                <Route name="status" handler={PageStatus} />
                <Route name="error" handler={PageError} />
                <Route name="about-neat" handler={PageAbout} />
                <Route name="configure" handler={PageConfigure} />
            </Route>

            {/* Manual dashboard pages. */}
            <Route path="/dashboard/manual" handler={ManualFrame}>
                <Route name="manual-section" path="/manual/:section" handler={PageManual} />
                <Route name="manual" path="/manual" handler={PageManual} />

                <Redirect to="table-of-contents" />
            </Route>


            {/* Case helper routes. */}

            {/* This route will open the given case and
                redirect to a relevant case page after opening.. */}
            <Route name="open" path="/open/:name" handler={PageOpenCase} />

            {/* All child dashboard pages. These are non-case related pages. */}
            <Route name="case_not_found" path="/case_not_found/:name" handler={PassThrough} />

            {/* Case pages.
                All case pages are for a particular case. */}
            <Route name="case" path="/case/:name"  handler={CaseFrame}>

                {stagingRoutes}
                {reportRoutes}

                {/* Case share. */}
                <Route name="upload" handler={PageStagingUnfinished}/>

                {/* Default case route. */}
                <DefaultRoute handler={PageStagingUnfinished}/>
            </Route>

            {/* Default route redirects to the dashboard. */}
            <Redirect from="/" to="dashboard"/>
        </Route>
    </Route>
);

export default routes;
