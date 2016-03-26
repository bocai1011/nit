/** @jsx React.DOM */

var Staging_Stage2 = React.createClass({

    getInitialState: function() {
        return {
            loading: true,
        }
    },

  
    render: function() {
        return (
            <div>
                <h2 className="content-subhead">Interpretation, Step 2<StagingNavigator index={this.props.index} stage={2}/></h2>
                <HelpBlurb value={HelpBlurbs.Staging_Step2()}/>
                <br/>
                
                <div>
                    <MappableWidget header="Direction" values={mappables.direction} options={mappableOptions.direction}/>
                    <br/>
                    <MappableWidget header="Currency" values={mappables.currency} options={mappableOptions.currency}/>
                </div>
            </div>
        );
    }
});
