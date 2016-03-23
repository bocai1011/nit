/** @jsx React.DOM */

var MappableValueSelector = React.createClass({

    render: function() {
        return (
            <tr>
                <td><a href="#" onclick="return false;" title="The data in this column looks like a number." className="tooltip"><span title=""><i className="fa fa-exclamation-triangle"></i></span></a></td>
                <td>{this.props.name}</td>
                <td><DropdownBox options={this.props.options}/></td>
            </tr>
        );
    }
});

var MappableWidget = React.createClass({

    render: function() {
        var selectors = this.props.values.map(function(value, i) {
            return (
                <MappableValueSelector name={value} options={this.props.options} key={i}/>
            );
        }.bind(this))

        return (
            <table className="pure-table pure-table-horizontal without">
                <thead className="without">
                    <tr>
                        <th></th>
                        <th>{this.props.header}</th>
                        <th>Interpret as</th>
                    </tr>
                </thead>
                <tbody className="without">
                    {selectors}
                </tbody>
            </table>
        );
    }
});
