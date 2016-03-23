import React from 'react';
import util from 'common/utils/util';
import Table from 'common/components/Table';
import LoadingIcon from 'common/components/LoadingIcon';

/**
 * Component for an async table widget that can grab data and render it.
 * @component
 * @exports lib\Components\TableWidget
 */
const TableWidget = React.createClass({

    _getData: function() {
        var self = this;

        self.setState({
            loading: true
        });

        util.post(self.props.url, self.props.params)
        .then(function (records) {
            if (self.isMounted()) {
                self.setState({
                    data: records,
                    loading: false
                });

                if (self.props.onLoad) {
                    self.props.onLoad(records);
                }
            }
        });
    },

    propTypes: {
        url: React.PropTypes.string.isRequired,
        options: React.PropTypes.object,
        style: React.PropTypes.object,
        params: React.PropTypes.object,
        editors: React.PropTypes.object,
        caption: React.PropTypes.string,
        eventCbs: React.PropTypes.object,
        cellCssStyles: React.PropTypes.object
    },

    getDefaultProps: function () {
        return {
            url: '',
            item: {},
            style: {
                width: '100%',
            },
            options: {},
            columnOptions: {},
            cellCssStyles: {},
            params: {},
            editors: {},
            caption: '',
            eventCbs: {}
        };
    },

    getInitialState: function () {
        return {
            loading: true,
            data: {}
        };
    },

    componentDidMount: function () {
        this._getData();
    },

    render: function () {
        if (this.state.loading) {
            return <LoadingIcon />;
        } else {
            return (
                <Table data={this.state.data}
                    ref="table"
                    columnOptions={this.props.columnOptions}
                    cellCssStyles={this.props.cellCssStyles}
                    options={this.props.options}
                    style={this.props.style}
                    editors={this.props.editors}
                    caption={this.props.caption}
                    eventCbs={this.props.eventCbs} />
            );
        }
    }
});

export default TableWidget;
