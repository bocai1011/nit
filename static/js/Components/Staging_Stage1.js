/** @jsx React.DOM */

var StagingNavigator = React.createClass({
  
    render: function() {
        var previous, next;
        
        if (this.props.stage - 1 <= 0) {
            previous = <Link to="overview" params={{hash:NeatApp.CurrentCase.hash}}><i className="fa fa-arrow-circle-o-left"></i></Link>;
        }
        else {
            previous = <Link to="stage-file" params={{hash:NeatApp.CurrentCase.hash, index:0, stage:this.props.stage-1}}><i className="fa fa-arrow-circle-o-left"></i></Link>
        }
        
        next = <Link to="stage-file" params={{hash:NeatApp.CurrentCase.hash, index:0, stage:this.props.stage+1}}><i className="fa fa-arrow-circle-o-right"></i></Link>
        
        return (
            <span>
            &nbsp;
            &nbsp;
            {previous}
            &nbsp;
            {next}
            </span>
        );
    }
});

var Staging_Stage1 = React.createClass({

    requestData: function() {
        self = this;
        
        Request
            .get("/CsvConfig/path=" + this.props.item.file.path)
            .end(function(res){
                var columns = JSON.parse(res.text);
                self.props.item.columns = columns;
                self.setState({loading: false, columns: columns});
            });
    },

    getInitialState: function() {
        if (this.props.item.columns) {
            return {
                loading: false,
                columns: this.props.item.columns
            };
        }
        else {
            this.requestData();
            
            return {
                loading: true,
                columns: null,
            };
        }
    },

    doImport: function() {
        Request
            .post("/CsvConfig/path=" + this.props.item.file.path)
            .send(this.state.columns)
            .end(function(res){
            
            });
    },
  
    render: function() {
        var body;
        if (this.state.loading) {
            body = <LoadingIcon/>
        }
        else {
            body = 
            <div>
                <h3>
                <div>
                    Status: Ready to import!
                    &nbsp;&nbsp;
                    <button onClick={this.doImport} className="pure-button pure-button-primary">Import Data</button>
                </div>
                </h3>

                <ColumnNameWidget columns={this.state.columns}/>
            </div>
        }

        return (
            <div>
                <h2 className="content-subhead">Column Names, Step 1<StagingNavigator index={this.props.index} stage={1}/></h2>
                
                <HelpBlurb value={HelpBlurbs.Staging_Step1()}/>
                
                {body}
            </div>
        );
    }
});
