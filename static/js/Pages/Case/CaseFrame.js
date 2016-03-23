/** @jsx React.DOM */

var CaseFrame = React.createClass({
  
    render: function() {
        return (
            <div id="layout">
                <SideBar/>
                <div id="main">
                    <this.props.activeRouteHandler/>
                </div>
            </div>
        );
    }
});
