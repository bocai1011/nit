/** @jsx React.DOM */
//<li className={App.state.page === this.props.page ? "menu-item-divided pure-menu-selected" : null}>
var SideBarItem = React.createClass({
  
    render: function() {
        return (
            <li>
                <Link to={this.props.link} params={{hash:"a4b8e11c"}}>{this.props.value}</Link>
            </li>
        );
    }
});

var SideBar = React.createClass({
  
    render: function() {
        return (
            <div id="menu">
                <div className="pure-menu pure-menu-open">
                    <Link className="pure-menu-heading" to="dashboard">NEAT3</Link>

                    <ul>
                        <SideBarItem link="staging" value="Staging"/>
                        <SideBarItem link="reports" value="Reports"/>
                        <SideBarItem link="upload" value="Upload"/>
                        <SideBarItem link="manual" value="Get Help"/>
                    </ul>
                </div>
            </div>
        );
    }
});
