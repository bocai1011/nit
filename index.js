import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory, IndexRoute } from 'react-router'

import DashboardFrame from './Pages/Dashboard/DashboardFrame'
import PageLanding from './Pages/Dashboard/Landing'

const router = (
    <Router history={browserHistory}>
        <Route path="/" component={DashboardFrame}>
            <IndexRoute component={PageLanding}/>
            <Route path="/about" component={PageLanding}/>
            <Route path="/status" component={PageLanding}/>
            <Route path="/configure" component={PageLanding}/>      
        </Route>
    </Router>
);

render(router, document.getElementById("app"));
