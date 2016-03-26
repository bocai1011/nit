/** @jsx React.DOM */

var filenameFromPath = function(path) {
    if (path == null) return null;
    return path.replace(/^.*[\\\/]/, '');
}

var FileDialogLink = React.createClass({

    getInitialState: function() {
        return {
            fileName: filenameFromPath(this.props.file.path) || "Browse...",
        };
    },

    onClick: function(e) {
        this.refs.input.getDOMNode().click();
        return false;
    },

    onChange: function(e) {
        var file = this.refs.input.getDOMNode().files[0];
        this.props.onChange(file);
        
        this.setState({
            fileName: file.name,
        });
        
        return false;
    },

    render: function() {
        return (
            <div>
                <input type="file" ref="input" onChange={this.onChange}/>
                <a href="#" onClick={this.onClick}>
                    {this.state.fileName}
                </a>
            </div>
        );
    }
});

var StagingItem = React.createClass({

    getInitialState: function() {
        var file = this.props.item.file;
        file.fileName = filenameFromPath(file.path);
        
        return { };
    },

    onChange: function(file) {
        this.props.item.file = file;
    },
    
    render: function() {
        return (
            <tr>
                <td>{this.props.item.type}</td>
                <td><FileDialogLink file={this.props.item.file} onChange={this.onChange}/></td>
                <td>Unfinished</td>
                <td><a href="#">View</a></td>
                <td><Link to="stage-file" params={{hash:NeatApp.CurrentCase.hash, index:this.props.index, stage:1}}>Stage</Link></td>
            </tr>
        );
    }
});

var StagingOverview = React.createClass({
  
    render: function() {
        var items = NeatApp.CurrentCase.stagingItems.map(function(item, i) {
            return (<StagingItem item={item} index={i}/>);
        }.bind(this))

        return (
            <div>
                <h1 className="content-subhead">Staging process</h1>
                <HelpBlurb value={HelpBlurbs.StagingProcess()}/>
                
                <h2 className="content-subhead">Staging Status</h2>
                <table className="pure-table pure-table-horizontal">
                    <thead>
                        <tr>
                            <th>File Type</th>
                            <th>File Name</th>
                            <th>Status</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            </div>
        );
    }
});
