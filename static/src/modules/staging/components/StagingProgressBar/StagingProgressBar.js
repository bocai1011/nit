import _ from 'lodash';
import React from 'react';
import { State } from 'react-router';
import NeatApp from 'app/utils/NeatApp';
import StagingProgressBarBlock from 'staging/components/StagingProgressBar/StagingProgressBarBlock';

const { PhaseInfo } = NeatApp;

/**
 * Component for rendering the staging progress bar.
 * @component
 * @exports lib\Components\Staging\StagingProgressBar
 */
const StagingProgressBar = React.createClass({
    mixins: [ State ],

    propTypes: {
        mini: React.PropTypes.bool,
    },

    render: function() {
        var self = this;
        var phases = NeatApp.getCurrentCase().stagingPhases;

        return (
            <span className={this.props.mini && 'staging-progress-mini'}>
                {_.map(phases, function(phase, i) {
                    return (
                        <StagingProgressBarBlock mini={self.props.mini}
                            phase={phase}
                            info={PhaseInfo[i]}
                            key={i} />
                    );
                })}
            </span>
        );
    }
});

export default StagingProgressBar;
