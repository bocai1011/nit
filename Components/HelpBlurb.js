/** @jsx React.DOM */

var HelpBlurb = React.createClass({

    getInitialState: function() {
        return {
            show: true,
        }
    },

    showToggle: function(e) {
        this.setState({
            show: !this.state.show,
        });
    },

    render: function() {
        //console.log(this.props.source);
        
        if (this.state.show){
            return (
                <div>
                    {this.props.value}
                    
                    <button className="textlike" onClick={this.showToggle}><i className="fa fa-caret-up">&nbsp;hide</i></button>
                </div>
            );            
        }
        else{
            return (
                <div>
                    <button className="textlike" onClick={this.showToggle}><i className="fa fa-caret-right">&nbsp;show overview</i></button>
                </div>
            );
        }
    }
});
