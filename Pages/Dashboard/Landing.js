import React from 'react'
import { Link } from 'react-router'

export default React.createClass({
  
    render: function() {
        return (
            <div className="splash-container">
                <div className="splash">
                    <h1 className="splash-head">NEAT</h1>
                    <p className="splash-subhead">
                        Powered by the Quantitative Analytics Unit
                    </p>
                    <p>
                        <Link to="staging"  className="pure-button pure-button-primary">New Case</Link>
                        &nbsp;
                        &nbsp;
                        &nbsp;
                        &nbsp;
                        <Link to="staging"  className="pure-button pure-button-primary">Open Case</Link>
                    </p>
                </div>
            </div>
        );
    }
});
