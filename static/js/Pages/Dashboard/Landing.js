/** @jsx React.DOM */

var PageLanding = React.createClass({
  
    render: function() {
        return (
            <div className="splash-container">
                <div className="splash">
                    <h1 className="splash-head">NEAT3</h1>
                    <p className="splash-subhead">
                        Powered by the Quantitative Analytics Unit
                    </p>
                    <p>
                        <Link to="staging" params={{hash:NeatApp.CurrentCase.hash}} className="pure-button pure-button-primary">New Case</Link>
                        &nbsp;
                        <Link to="staging" params={{hash:NeatApp.CurrentCase.hash}} className="pure-button pure-button-primary">Open Case</Link>
                    </p>
                </div>
            </div>
        );
    }
});
