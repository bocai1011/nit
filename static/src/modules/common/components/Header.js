import React from 'react';
import NeatApp from 'app/utils/NeatApp';
import { PageHeader } from 'react-bootstrap';
import HelpBlurbs from 'common/components/HelpBlurbs';
import StagingNavigator from 'staging/components/StagingNavigator';
import keyUtils from 'common/utils/keyUtils';

/**
 * Component for rendering a page header, with a title, help blurb,
 * and a staging navigation widget.
 * @component
 * @exports lib\Components\Header
 */
const Header = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _showToggle: function(e) {
        if (!this.state.collapsable) {
            e.stopPropagation();
            return;
        }

        this.setState({
            show: !this.state.show,
        });

        e.stopPropagation();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        helpBlurb: React.PropTypes.oneOf([
            'StagingProcess',
            'FilePicker',
            'ColumnMapping',
            'Interpretation',
            'CreateDataBase',
            'RefData',
            'Symbols',
            'Finalize',
            'Share',
            'Restore',
            'Reports',
            'LegacyReports',
            'DataReports',
            'RegulationReports',
        ]),
        isStaging: React.PropTypes.bool,
    },

    getDefaultProps: function () {
        return {
            isStaging: true,
        };
    },

    getInitialState: function() {
        var app = NeatApp.getApp();
        var removeNotes = app.NeatOptions.RemoveNotes.value;

        return {
            show: !removeNotes,
            collapsable: removeNotes,
        }
    },

    render: function() {
        var headerStyle = this.state.collapsable ?
                              {cursor:'pointer'} :
                              null;

        var header = (
            <PageHeader>
                <span style={headerStyle} ref="toggleSpan" tabIndex="0"
                    onClick={this._showToggle}
                    onKeyPress={keyUtils.returnEnterKeyListener()}
                >
                    {this.props.children}
                </span>
            </PageHeader>
        );

        return (
            <div className='staging-header'>
                {header}
                { this.props.isStaging && <StagingNavigator /> }
                {this.state.show ?
                    <div
                        className="instructionsPanel"
                        tabIndex="0"
                        aria-role="note"
                        aria-describedby="instructions"
                    >
                        <span className="hide508">
                            Instructions for the {this.props.helpBlurb} Page
                        </span>
                        { HelpBlurbs[this.props.helpBlurb]() }
                    </div>
                : null}
            </div>
        );
    }
});

export default Header;
