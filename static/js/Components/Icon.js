/** @jsx React.DOM */

var Icon = React.createClass({

    render: function() {
 
        var icon = "";
        if (this.props.data.icon === "ok"){
            icon = <i className="fa fa-check fa-fw"></i>;
        }
        else if (this.props.data.icon === "warn"){
            icon = <i className="fa fa-exclamation-triangle fa-fw"></i>;
        }
        else if (this.props.data.icon === "error"){
            icon = <i className="fa fa-exclamation-triangle fa-fw"></i>;
        }
        else if (this.props.data.icon === "skip"){
            icon = <i className="fa fa-ban fa-fw"></i>;
        }

        return (
            <a href="#" onclick="return false;" title={this.props.data.message} className="tooltip"><span>{icon}</span></a>
        );
    },
});
