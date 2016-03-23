import _ from 'lodash';
import React from 'react';
import { Panel, Table } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import MappableValueSelector from 'staging/components/MappableWidget/MappableValueSelector';

/**
 * Component for rendering a table that allows the user to
 * map a collection of thematically related values, such as
 * currency, security type, or trade direction.
 * @component
 * @exports lib\Components\MappableWidget
 */
const MappableWidget = React.createClass({

    propTypes: {
        header: React.PropTypes.oneOf(['side', 'sec_type', 'currency']),
        onSelect: React.PropTypes.func,
        options: React.PropTypes.array,
        values: React.PropTypes.array,
    },

    render: function() {
        var self = this;
        var title = (
            <strong>{ NeatApp.getNiceName(self.props.header) }</strong>
        );

        var selectors = null, textBlurb = null;
        if (self.props.values.length === 0) {
            textBlurb = (
                <p>
                    We didn&#39;t find anything to map for { title }.
                    This probably means something went wrong while
                    creating your database.
                </p>
            );
        } else {
            selectors = [];
            var source = null;

            _.forEach(self.props.values, function(row, i) {
                // Use this to annotate source for every row.
                source = row.source;

                // Suppress initial position trade sides (xref #906)
                if ( self.props.header === 'side' && source === 'initial_position' ) {
                    return;
                }

                var value = _.find(self.props.options, function(option) {
                    return option.name === row.code;
                });

                selectors.push(
                    <MappableValueSelector name={row.name}
                        value={value}
                        type={self.props.header}
                        row={row}
                        source={source}
                        options={self.props.options}
                        onSelect={self.props.onSelect}
                        key={i}/>
                );
            });
        }

        return (
            <Panel header={title}>
                { textBlurb }
                <Table aria-role="grid"
                    tabIndex="0"
                    className='interpretation table-no-border'
                    condensed
                    hover>
                    <caption className="hide508">
                        A table for assigning an interpreted meaning for every found column under &#34;{title}&#34;
                    </caption>
                    <tbody>
                        { selectors }
                    </tbody>
                </Table>
            </Panel>
        );
    }
});

export default MappableWidget;
