import React from 'react';
import { Link } from 'react-router';
import { Panel } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';

const { StatusLookup } = NeatApp;

/**
 * Component for displaying information about a specific
 * stage in the staging process.
 * @component
 */
const StagingPhase = React.createClass({

    propTypes: {
        info: React.PropTypes.shape({
            link: React.PropTypes.string,
            name: React.PropTypes.string,
            stage: React.PropTypes.number,
            title: React.PropTypes.string,
        }),
        phase: React.PropTypes.shape({
            statusCode: React.PropTypes.string,
        }),
    },

    render: function() {
        var caseName = NeatApp.getCurrentCase().name;
        var { name, link, title } = this.props.info;

        var { statusCode } = this.props.phase;
        if (NeatApp.isLocked()) {
            statusCode = 'locked';
        }

        var status = StatusLookup[statusCode];
        if (name === 'Share') {
            status = {
                bsStyle: 'success',
                glyph: 'share',
                label: 'Ready for sharing.',
            };
        } else if ( name === 'Export') {
            if (NeatApp.isLocked())
            {
                status = {
                    bsStyle: 'success',
                    glyph: 'download',
                    label: 'Ready for exporting.'
                };
            } else {
                status = {
                    bsStyle: 'default',
                    glyph: 'square',
                    label: 'Unavailable. Complete earlier phases first.'
                };
                statusCode = 'inactive';
            }
        }

        var _class = `staging-icon ${statusCode} fa fa-lg fa-${status.glyph}`;
        var glyph = (<i className={_class} />);

        var header = (
            <Link to={link}
                params={{name: caseName}}>
                { glyph }<span>{ title }</span>
            </Link>
        );

        if (statusCode === 'inactive') {
            var header = (
                <div>
                    { glyph }<span>{ title }</span>
                </div>
            );
        }

        return (
            <Panel header={header}
                bsStyle={status.bsStyle}>
                {this.props.phase.status}
                {status.label}
            </Panel>
        );
    },
});

export default StagingPhase;
