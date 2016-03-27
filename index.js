import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import NeatApp from './Pages/NeatApp'
import NeatBody from './Pages/NeatBody'
import CaseFrame from './Pages/CaseFrame'

const routes = (
  <Route path='/' component={NeatApp}>
    <IndexRoute component={NeatBody}/>
    <Route path="case" component={CaseFrame}/>
  </Route>
)

render( <Router routes={routes} history={browserHistory}/> , document.getElementById("app"))
