import React from 'react'
import { Link } from 'react-router'

export default React.createClass({
  
    render: function() {
        return (
            <div>
                <div className="home-menu pure-menu pure-menu-open pure-menu-horizontal pure-menu-fixed">
                    <Link className="pure-menu-heading" to="dashboard">NEAT3</Link>
                    <ul>
                        <li className="pure-menu-selected"><Link to="about">About NEAT3</Link></li>
                        <li><Link to="status">Status</Link></li>
                        <li><Link to="configure">Configure</Link></li>
                    </ul>
                </div>
            </div>
        );
    }
});
