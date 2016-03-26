/** @jsx React.DOM */

var PageStagingUnfinished = React.createClass({
  
    render: function() {
        return (
            <div>
                <div className="content">
                    <h1 className="content-subhead">Staging incomplete</h1>
                    <p>
                        Please finish <Link to="staging" params={{hash:"a4b8e11c"}}>staging</Link> before proceeding.
                    </p>
                </div>
            </div>
        );
    }
});
