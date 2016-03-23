import React from 'react';
import { Panel } from 'react-bootstrap';
import _ from 'lodash';
import LoadingIcon from 'common/components/LoadingIcon';
import Deferred from 'reports/components/charts/Deferred';
import Transform from 'reports/utils/transform';
import { materialize } from 'reports/utils/ReportHelper';

const ReportPanel = React.createClass({

    render: function() {
        var self = this;

        var query = self.props.waitFor;
        if (_.isString(query) || (query.queryMeta && (query.queryMeta.return == 'qstr'))) {
            query = materialize(query);
        }

        var defer = new Transform({query: query}, function(e, r) {
            return (
                <Panel
                    collapsible
                    expanded={self.props.open}
                    bsStyle={self.props.danger(r.query.pandas) ? 'danger' : 'success'}
                    header={self.props.header}
                >
                    {self.props.render(r.query.pandas)}
                </Panel>
            );
        });

        return (
            <Deferred
                query={defer}
                header={self.props.header}
                loadingRender={() =>
                    <Panel
                        collapsible
                        bsStyle='default'
                        header={self.props.header}
                    >
                        <LoadingIcon />
                    </Panel>
                }
            />
        );
    }
});

export default ReportPanel;
