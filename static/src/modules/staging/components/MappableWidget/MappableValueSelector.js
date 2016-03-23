import _ from 'lodash';
import React from 'react';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import DropdownBox from 'common/components/DropdownBox/DropdownBox';
import q from 'common/utils/queryFactory';
import { Table } from 'reports/components/charts/Widgets';
import ModalOverlay from 'common/components/ModalOverlay';

/**
 * Component for rendering a single row in a MappableWidget table.
 * This row provides one value to be mapped, along with a dropdown
 * for the user to select a mapped value to choose from.
 * @component
 */
const MappableValueSelector = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _onSelect: function(choice) {
        this.props.value = choice;
        this.props.row.code = choice.name;
        this.props.onSelect(choice);
        this.forceUpdate();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins:[PureRenderMixin],

    propTypes: {
        name: React.PropTypes.node,
        onSelect: React.PropTypes.func,
        row: React.PropTypes.object,
        source: React.PropTypes.oneOf([
            'trade_blotter',
            'initial_position',
            'employee_trade_blotter',
            'restricted_list',
            'returns_list',
            'bbg_security',
        ]),
        type: React.PropTypes.oneOf([
            'side',
            'sec_type',
            'currency',
        ]),
        value: React.PropTypes.object,
    },

    render: function() {
        var isDefaultValue = !this.props.name;

        var source = NeatApp.getNiceName(this.props.source);
        var type = NeatApp.getNiceName(this.props.type);

        var cell, tip, hiddenTip;

        var dropdownOptions=this.props.options.slice();

        if (isDefaultValue) {

            tip = (
                <Popover>
                    There were no {type} values provided in the {source}.
                    Please provide a default value to use here.
                </Popover>
            );

            hiddenTip = (
                'There were no ' + type +  'values provided in the ' +
                source + '. Please provide a default value to use here.'
            );

            cell = <strong>Default value</strong>;

            // Not showing Exclude option for default value
            if (dropdownOptions.length > 0 &&
                dropdownOptions[0].name === NeatApp.EXCLUDE_CODE) {
                dropdownOptions.splice(0, 1);
            }

        } else {
            tip = (
                <Popover>
                    This {type} value came from {source}.
                    Please tell NEAT what this value means in the dropdown
                    to the right.
                </Popover>
            );

            hiddenTip = (
                'A value of ' + type + ' came from ' + source +
                '. Please tell NEAT what this value means in the ' +
                'following dropdown.'
            );

            cell = this.props.name;
        }

        var className = [];
        if (!this.props.value) {
            className.push('rowErrorRequired', 'rowError');
        }
        else if (this.props.value.name === NeatApp.EXCLUDE_CODE) {
            className.push('rowError');
        }

        var records = q.stagings.get_interp_transactions({'typ':this.props.type, 'val':this.props.name, 'source':this.props.source});
        var transrow = 'Rows';
        if ((! _.isUndefined(this.props.source)) && _.includes(this.props.source, 'blotter')) {
            transrow = 'Transactions';
        }
        var titleStr = transrow + ' related to this ' + this.props.type;
        var viewButton = (
                <ModalOverlay
                    buttonName='ViewTrans'
                    title="Data Viewer"
                    id="table-overlay"
                    className="btn-block"
                >
                <Table query={records} title={titleStr} map_oids={false}/>
                </ModalOverlay>
            );
        return (
            <tr aria-role="row"
                className={className.join(' ')}>

                <td aria-role="gridcell"
                    tabIndex="0"
                    style={{width:300, cursor:'default'}}>
                    <OverlayTrigger placement="top"
                        delayShow={300}
                        delayHide={0}
                        overlay={tip}>
                        <span className={
                            util.testClassNames.hasOverlayTrigger
                        }>
                            <span>{ cell }</span>
                            <span className="hide508">{ hiddenTip }</span>
                        </span>
                    </OverlayTrigger>
                </td>

                <td aria-role="gridcell"
                    style={{width:300}}>
                    { this.props.source ? 'for ' : null }
                    { source }
                </td>

                <td>
                    <DropdownBox map={NeatApp.ItemNameMap}
                        disabled={NeatApp.isLocked()}
                        value={this.props.value}
                        options={dropdownOptions}
                        onSelect={this._onSelect}
                        preventNull={false}
                        rowName={cell} />
                </td>

                <td className='hover-to-show'>
                    {viewButton}
                </td>

                <td className='text-right'>
                    { this.props.row.count } rows
                </td>

            </tr>
        );
    }
});

export default MappableValueSelector;
