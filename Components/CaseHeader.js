/** @jsx React.DOM */

var CaseHeader = React.createClass({
  
    render: function() {
        var subheading;
        if (this.props.staging) {
            subheading = <h2>Staging in process</h2>;
        }
        else{
            subheading = <h2>Staging finished</h2>;
        }
                
        return (
            <div className="header">
                <h1>{this.props.caseName}</h1>
                {subheading}
            </div>
        );
    }
});
