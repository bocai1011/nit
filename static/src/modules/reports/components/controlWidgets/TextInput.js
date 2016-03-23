import React from 'react';
import { Panel, Input, ButtonInput } from 'react-bootstrap';
import LoadingIcon from 'common/components/LoadingIcon';
import MailtoError from 'common/components/MailtoError';
import Transform from 'reports/utils/transform';

const TextInput = React.createClass({
    displayName: "TextInput",

    getDefaultProps: function() {
        return {
            preventNull: true,
            map: {}
        }
    },

    getInitialState: function() {
        var self = this;

        if (self.transform == null) {
            self.transform = new Transform(self.props);
            self.transform.subscribe(self);
        }

        self.transform.useData().then((results) => {
            var data = results.data;
            var errs = results.errs;

            if (errs.text && !data.text) {
                self.setState({error: true, errs: errs, data:data, text: "errored", loading: false});
            } else {
                if (data.text instanceof Array) {
                    data.text = data.text.join(' ');
                }
                self.setState({
                    error: false,
                    loading: false,
                    text: data.text,
                    args: data,
                    errs: errs
                }, function() {});
            }
        });

        return {
            loading: true,
        };
    },

    update: function () {
        this.evaluated = false;
        return true;
    },

    refresh: function () {
        this.setState(this.getInitialState());
    },

    handleChange: function() {
        var input = this.refs.myInput;
        this.props.text.setArgument('value', input.getValue());
    },

    render: function () {
        var self = this;

        if (self.state.loading) {
            return (
                <Panel header={<h3>{self.props.title}</h3>}>
                    <LoadingIcon/>
                </Panel>
            );
        } else if (self.state.error) {
            var errorMsg = <pre>{self.state.errs}</pre>;
            return (
                <Panel header={<h3>Report Error</h3>} bsStyle="danger">
                    {errorMsg}
                    <MailtoError error={errorMsg}>
                        Contact support
                    </MailtoError>
                </Panel>
            );
        } else {
            if (this.props.frameLess) {
                var textStyle = {
                    'min-height': this.props.height || '380px',
                };
                var buttonStyle = {
                    'margin-left':'1px'
                };
            } else {
                var textStyle = {
                    'min-height': this.props.height || '380px',
                };
                var buttonStyle = {
                    'margin-left':'19px'
                };
            }

            let widget = [
                <Input ref="myInput" type="textarea" style={textStyle}>
                    {self.state.text}
                </Input>,

                <div style={buttonStyle}>
                    <ButtonInput
                        value="Execute Query"
                        onClick={this.handleChange}
                    />
                </div>
            ];

            if (this.props.frameLess) {
                return (
                    <div style={{'margin-top':'3px'}}>
                        {widget}
                    </div>
                );
            } else {
                return (
                    <div className="chart-wrapper panel panel-default">
                        <div className="chart-title panel-heading">
                            <span>{self.props.title}</span>
                        </div>

                        {widget}
                    </div>
                );
            }
        }
    },
});

export default TextInput;
