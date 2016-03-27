import React from 'react';
const PageStagingUnfinished = React.createClass({

    render: function() {
        return (
            <div>
                <div className="content">
                    <h1 className="content-subhead">Staging incomplete</h1>
                    <p>
                        Please finish <Link to="staging">staging</Link> before proceeding.
                    </p>
                </div>
            </div>
        );
    }
});
export default PageStagingUnfinished;
