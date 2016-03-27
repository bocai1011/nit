import React from 'react'
// import SideBar from '../components/SideBar'
const CaseFrame = React.createClass({

    render: function() {
        return (
            <div id="layout">
                // <SideBar/>
                <div id="main">
                    // {this.props.children}
                    I am side bar
                </div>
            </div>
        );
    }
});

export default CaseFrame
