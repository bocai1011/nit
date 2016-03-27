import React from "react"
const StagingFile = React.createClass({

    render: function() {

        return (
            <div>
                <div className="content">
                    <StagingFile params={this.props.params}/>
                </div>
            </div>
        );
    }
});

export default StagingFile;
