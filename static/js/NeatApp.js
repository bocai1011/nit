/** @jsx React.DOM */

var recentProj = [
    { name:"Wemake Dahmoney Investments", },
    { name:"Gottakech Emall Partners", },
    { name:"Wallabalooza Bank", },
    { name:"Maken Amesup Izhard", },
];

var mappables = {
    direction : ["BUYS", "SELLS", "BUYL", "SELLL"],
    currency : ["Dollars", "Pounds"],
};

var mappableOptions = {
    direction : [ {name: "buy"}, {name: "sell"}, {name: "buy short"}, {name: "sell short"} ],
    currency : [ {name: "USD"}, {name: "GBP"}],
};

var NeatApp = {
    CurrentCase : {
        name: "Wemake Dahmoney Investments",
        hash: "a4b8e11c",
        staging: true,
        
        stagingItems: [
            { type: "Trade Blotter", file: { path: "C:/Users/fisherj/Desktop/NEAT3 Wireframe/wolf/test_data/BIM_trade_blotter_equities.csv" }, columns: null },
            { type: "Initial Position", file: { path: null }, },
            { type: "Employee Blotter", file: { path: null }, },
            { type: "Restricted List", file: { path: null }, },
            { type: "Returns List", file: { path: null }, },
        ],

    },
};

var PassThrough = React.createClass({
  
    render: function() {
        return (
            <this.props.activeRouteHandler/>
        );
    }
});

var routes = (
    <Routes>
        <Route name="dashboard" path="/" handler={DashboardFrame}>
            <Route name="about" handler={PageLanding}/>
            <Route name="status" handler={PageLanding}/>
            <Route name="configure" handler={PageLanding}/>
            <DefaultRoute handler={PageLanding}/>
        </Route>
        <Route name="case" path="/case/:hash"  handler={CaseFrame}>
            <Redirect path="staging" to="overview"/>
            <Route name="staging" handler={PassThrough}>
                <Route name="overview" handler={PageStagingOverview}/>
                <Route path=":index" handler={PassThrough}>
                    <Route name="stage-file" path=":stage" handler={PageStagingFile}/>
                </Route>
            </Route>
            <Route name="reports" handler={PageStagingUnfinished}/>
            <Route name="upload" handler={PageStagingUnfinished}/>
            <DefaultRoute handler={PageStagingUnfinished}/>
        </Route>
        <Route name="manual" handler={PageManual}/>
    </Routes>
);

React.renderComponent(routes, document.body);
