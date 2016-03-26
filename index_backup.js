import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'

var routes = (
    <Router history={browserHistory}>
        <Route path="/" component={DashboardFrame}>
            <Route path="/about" component={PageLanding}/>
            <Route path="/status" component={PageLanding}/>
            <Route path="/configure" component={PageLanding}/>
            <DefaultRoute component={PageLanding}/>
        </Route>
        <Route path="/case" path="/case/:hash"  component={CaseFrame}>
            <Redirect path="/staging" to="/overview"/>
            <Route path="/staging" component={PassThrough}>
                <Route path="/overview" component={PageStagingOverview}/>
                <Route path="/:index" component={PassThrough}>
                    <Route path="/stage-file" path="/:stage" component={PageStagingFile}/>
                </Route>
            </Route>
            <Route path="/reports" component={PageStagingUnfinished}/>
            <Route path="/upload" component={PageStagingUnfinished}/>
            <DefaultRoute component={PageStagingUnfinished}/>
        </Route>
        <Route path="/manual" component={PageManual}/>
    </Router>
);

render(routes, document.getElementById("app"));
