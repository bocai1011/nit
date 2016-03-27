import React from 'react'
import { Link } from 'react-router'

export default React.createClass({

    render() {
        return (
            <div className="row">
                    <h1>NEAT</h1>
                    <p>
                        Powered by the Quantitative Analytics Unit
                    </p>
                    <p>
                        <Link to="staging"  className="pure-button pure-button-primary">New Case</Link>
                        &nbsp;
                        <Link to="staging"  className="pure-button pure-button-primary">Open Case</Link>
                    </p>
            </div>
        );
    }
});
