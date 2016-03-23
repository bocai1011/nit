/** @jsx React.DOM */

var DropdownItem = React.createClass({

    onSelect: function(e) {
        this.props.onSelect(this.props.info);
    },
    
    render: function() {
        if (this.props.info.divider === true){
            return (<li className="divider"></li>);
        }
   
        return (
            <li onClick={this.onSelect}><button className="dropdown-item"><Icon data={this.props.info}/>&nbsp;{this.props.info.name}</button></li>
        );
    },
});

var DropdownBox = React.createClass({

    getInitialState: function() {
        return {
            value: this.props.initial ? this.props.initial : this.props.options[0],
        }
    },

    onSelect: function(selectedValue) {
        this.setState({value:selectedValue});
        this.props.onSelect(selectedValue);
    },
      
    render: function() {
        var items = this.props.options.map(function(item, i) {
            return (<DropdownItem info={item} key={i} onSelect={this.onSelect}/>);
        }.bind(this))

        return (
            <div className="dropdown">
                <button style={{width:160, padding:3, textAlign:'right'}} className="pure-button" id="dLabel" role="button" data-toggle="dropdown" data-target="#">
                    {this.state.value.name}
                    &nbsp;
                    <span className="caret"></span>
                    &nbsp;
                </button>

                <ul className="dropdown-menu" role="menu" aria-labelledby="dLabel">
                    {items}
                </ul>
            </div>
        );
    }
});
