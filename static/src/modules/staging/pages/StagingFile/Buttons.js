import React from 'react';
import { ButtonGroup } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import TableWidget from 'common/components/TableWidget';
import ModalOverlay from 'common/components/ModalOverlay';
import AppButton from 'common/components/AppButton';

/**
 * Component for rendering the action buttons for staging a file.
 * @component
 */
const Buttons = React.createClass({

    propTypes: {
        doImport: React.PropTypes.func,
        error: React.PropTypes.node,
        item: React.PropTypes.object,
        onMount: React.PropTypes.func,
        processing: React.PropTypes.bool,
        reset: React.PropTypes.func,
    },

    getInitialState: function() {
        return {
            error: null,
        };
    },

    componentDidMount: function() {
        this.props.onMount(this);
    },

    render: function() {
        var guard = this.props.guard;

        if (this.state.error) {
            guard = {
                title: 'Problems with column mappings.',
                body: this.state.error
            };
        }

        return (
            <ButtonGroup>
                <AppButton name='ProcessFile'
                    disabled={this.props.processing}
                    onClick={this.props.doImport}
                    tooltip='Process this file.'
                    guard={guard}
                />

                <AppButton name='ResetFile'
                    disabled={this.props.processing}
                    onClick={this.props.reset}
                    tooltip='Reset this file.'
                    confirm='Are you sure you want to reset the mappings for this file?'
                    guard={guard}
                />

                <ModalOverlay bsSize="large"
                    disabled={this.props.processing}
                    buttonName='ViewFile'
                    title="File viewer"
                    id="table-overlay">

                    <TableWidget
                        params={{
                            type: this.props.item.type,
                            file: this.props.item.file
                        }}
                        url={'/get_csv/' + NeatApp.caseName()}
                        options={{
                            gridHeight: '90%',
                            forceFitColumns: false
                        }}
                    />
                </ModalOverlay>
            </ButtonGroup>
        );
    },
});

export default Buttons;
