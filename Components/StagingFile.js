/** @jsx React.DOM */

var StagingFile = React.createClass({

    getInitialState: function() {
        return {
        }
    },

  
    render: function() {
        var item = NeatApp.CurrentCase.stagingItems[this.props.params.index];
    
        var stage;
        switch (this.props.params.stage) {
            case "1": stage = <Staging_Stage1 index={this.props.params.index} item={item}/>; break;
            case "2": stage = <Staging_Stage2 index={this.props.params.index} item={item}/>; break;
        }
        
        return (
            <div>
                <h1 className="content-subhead">Staging for Trade Blotter</h1>
                
                {stage}
            </div>
        );
    }
});
