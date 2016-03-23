import React from 'react';
import { Panel } from 'react-bootstrap';
import _ from 'lodash';
import ChartMixin from 'reports/components/charts/ChartMixin';
import LoadingIcon from 'common/components/LoadingIcon';
import MailtoError from 'common/components/MailtoError';

const Deferred = React.createClass({
    mixins: [_.omit(ChartMixin, ['getDefaulProps', 'getInitialState', 'render', 'componentWillUpdate'])],
    displayName: 'Deferred',

    getDefaulProps: function() {
        return {
            query: undefined,
            page: undefined
        };
    },

    getInitialState: function (props) {
        var self = this;

        if (!this.evaluated) {
            this.props.query.children.push(this);
            return {
                loading: true,
                data: [],
            };
        }
    },

    componentWillUpdate: function() {
        var self = this;
        if (!this.evaluated) {
            this.evaluated = true;
            this.props.query.useData().then((results) => {
                var data = results.data;
                var errs = results.errs;

                if (_.some(_.values(errs))) {
                    self.setState({error: true, errorMsg: errs, loading: false});
                } else {
                    self.setState({error: false, loading: false, data: data});
                }
            });
        }
    },

    render: function () {
        var self = this;

        var recurse = function(div) {
            if (_.has(div, 'props.page')) {
                div.props.page = self.props.page;
            }
            if (_.has(div, 'props.children')) {
                div.props.children.forEach(function(x) {recurse(x);});
            }
        };

        recurse(this.state.data);
        if (this.state.loading) {
            if (this.props.loadingRender) {
                return this.props.loadingRender();
            } else return (
                <LoadingIcon />
            );
        } else if (this.state.error) {
            var errorMsg = <pre>{this.state.errorMsg}</pre>;
            return (
                <div ref="deferred">
                    <Panel header={<h3>Report Error</h3>} bsStyle="danger">
                        {errorMsg}
                        <MailtoError error={errorMsg}>
                            Contact support
                        </MailtoError>
                    </Panel>
                </div>
            );
        } else {
            return (
                this.props.query.callback(self.state.error, self.state.data)
            );
        }
    },
});

export default Deferred;
