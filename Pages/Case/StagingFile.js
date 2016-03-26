/** @jsx React.DOM */

var PageStagingFile = React.createClass({
  
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
