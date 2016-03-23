/** @jsx React.DOM */

var ColumnNameSelector = React.createClass({

    getInitialState: function() {
        var choice = null;
                
        this.props.column.options.forEach(function (option) {
            if (option.name === this.props.column.mapping.name) {
                choice = option;
            }
            else if (choice === null && option.name === "skip") {
                choice = option;
            }
        }.bind(this));
    
        return {
            choice: choice,
        };
    },

    onSelect: function(choice) {
        this.props.column.mapping = choice;
        this.setState({choice: choice});
    },

    render: function() {
        vals = []
        for (i = 0; i < this.props.valsToShow; i++){
            vals.push(<td className="column-data-cell"><div>{this.props.column.values[i]}</div></td>);
        }
        
        return (
            <tr>
                <td><Icon data={this.state.choice}/></td>
                <td className="cell-no-overflow">{this.props.column.name}</td>
                <td><DropdownBox options={this.props.column.options} initial={this.state.choice} onSelect={this.onSelect}/></td>
                {vals}
            </tr>
        );
    },
});

var ColumnNameWidget = React.createClass({

    render: function() {
        var selectors = this.props.columns.map(function(column, i) {
            return (
                <ColumnNameSelector column={column} valsToShow={2} key={i}/>
            );
        }.bind(this))

        return (
            <table className="pure-table pure-table-horizontal without">
                <thead className="without">
                    <tr>
                        <th></th>
                        <th>Column</th>
                        <th>Import As</th>
                        <th>Row 1</th>
                        <th>Row 2</th>
                    </tr>
                </thead>
                <tbody className="without">
                    {selectors}
                </tbody>
            </table>
        );
    },
});
