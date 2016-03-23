import _ from 'lodash';
import React from 'react';
import { Table, ModalTrigger, Glyphicon } from 'react-bootstrap';
import util from 'common/utils/util';
import keyUtils from 'common/utils/keyUtils';
import ProgressMixin from 'common/utils/ProgressMixin';
import ConfirmOrCancel from 'common/components/ConfirmOrCancel';
import FileDialogLink from 'common/components/FileDialogLink';
import LoadingIcon from 'common/components/LoadingIcon';
import AppButton from 'common/components/AppButton';
import HelpBlurbs from 'common/components/HelpBlurbs';
import CaseItem from 'app/pages/PageCases/CaseItem';

const SORTBY = {
    name: 'name',
    create: 'create',
    update: 'update',
    status: 'status',
};

/**
 * Route handler for rendering the Cases page, which
 * shows a full list of all available cases to open/delete.
 * @component
 * @exports Pages\Dashboard\Cases
 */
const PageCases = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Delete all cases, asynchronously.
     * @param {function} callback - Callback for after successful deletion.
     * @return {bool} Returns false.
     */
    _deleteAllCases: function(callback) {
        console.log('delete all cases');

        var self = this;

        util.post('/delete_all_cases/',
            null,
            function () {
                console.log('all cases deleted');
                self._getCases();

                if (callback) {
                    callback();
                }
            });

        return false;
    },

    /**
     * Get the full list of cases from the server, asynchronously,
     * and dump the result into the component state when done.
     */
    _getCases: function() {
        var self = this;

        util.get('/get_cases/',
            function (cases) {
                self.setState({loading: false, cases: cases});
            });
    },

    /**
     * Sort a list of cases by the current sort settings.
     * @param {list} cases - List of case strings.
     * @return {list} The sorted case list.
     */
    _sortCases: function(cases) {
        let { sortBy } = this.state;
        cases = _.sortBy(cases, _case => _case[sortBy]);

        if (this.state.reverseSort) {
            cases.reverse();
        }

        return cases;
    },

    /**
     * Set the case table to be sorted by the given column.
     * If the table is already sorted on the given column
     * then we will invert the sort direction.
     * @param {string} by - The column name to sort on, eg 'name' or 'created'.
     */
    _sortBy: function(by) {
        if (this.state.sortBy === by) {
            this.setState({
                reverseSort: !this.state.reverseSort,
            });
        } else {
            this.setState({
                sortBy: by,
            });
        }
    },

    /**
     * Get the glyph component for a column header in the case table
     * that indicates whether the column is being sorted on, and
     * what direction it is sorted in.
     * @param {string} col - The column name, eg 'name' or 'created'.
     * @return {component} The glyph component.
     */
    _glyphFor: function(col) {
        if (col === this.state.sortBy) {
            if (this.state.reverseSort) {
                return <Glyphicon glyph='chevron-up' />;
            } else {
                return <Glyphicon glyph='chevron-down' />;
            }
        } else {
            return null;
        }
    },

    _onFileUpload: function (files) {
        this.useFakeAsynch();
        this.beginProcessing(
            'Restore', '/restore_case/true', files.tempPath
        );
    },

    /**
     * Progress Mixin Methods
     * --------------------------------------------------------------------
     */

    onSuccessfulProcess: function () {
        this._getCases();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [ProgressMixin],

    getInitialState: function() {
        return {
            loading: true,
            cases: null,
            sortBy: SORTBY.name,
            reverseSort: false,
        };
    },

    componentDidMount: function() {
        this._getCases();
        var mountedTable = this.getDOMNode()
                               .getElementsByTagName('TABLE')[0];
        keyUtils.registerEnterKeyListener(mountedTable);
    },

    render: function() {

        var self = this;
        var cases = null;
        var footerRow = null;

        var confirmDeleteAll = (
            <ConfirmOrCancel confirm={this._deleteAllCases}>
                <div className='delete-all-cases-modal'>
                    <h1>WARNING</h1>
                    <h3>You are about to delete all cases.</h3>
                    <p>Are you sure you wish to delete all cases?</p>
                </div>
            </ConfirmOrCancel>
        );

        if (this.state.cases !== null && this.state.cases.length > 0) {
            cases = _.map(this._sortCases(this.state.cases),
                function(case_, i) {
                    return (
                        <CaseItem myCase={case_}
                            onModify={function(){ self._getCases(); }}
                            key={i} />
                    );
                }
            );

            footerRow = (
                <tr>
                    <td></td><td></td><td></td><td></td>
                    <td tabIndex='0'>
                        <ModalTrigger modal={confirmDeleteAll}>
                            <p className='linklike dashboard-item-1'>
                                <i className='fa fa-trash'></i>
                                &nbsp;&nbsp;Delete All
                            </p>
                        </ModalTrigger>
                    </td>
                </tr>
            );

        } else if (this.state.loading) {

            footerRow = (
                <tr><td><LoadingIcon text='Loading cases...' /></td></tr>
            );

        } else {
            footerRow = (<tr><td>No cases found</td></tr>);
        }

        var progress;
        if (this.state && this.state.processing) {
            progress = this.renderProgress();
        }

        return (
            <div className='splash-container-absolute'>
                {progress}
                <div className='splash-top'>
                    <div className='splash-head'>
                        <h2>Cases</h2>
                    </div>

                    <Table ref='caseSelector'
                        className='caseSelector'
                        aria-role='grid'
                        tabIndex='0'>

                        <caption tabIndex='0'
                            className='hide508'>
                            Table of cases from which to select or delete.
                        </caption>

                        <thead>
                            <tr>
                                <th scope='col' onClick={function() {
                                    self._sortBy(SORTBY.name);
                                }}>
                                    Case Name{' '}
                                    {this._glyphFor(SORTBY.name)}
                                </th>

                                <th scope='col' onClick={function() {
                                    self._sortBy(SORTBY.create);
                                }}>
                                    Date Created{' '}
                                    {this._glyphFor(SORTBY.create)}
                                </th>

                                <th scope='col' onClick={function() {
                                    self._sortBy(SORTBY.update);
                                }}>
                                    Last Finalized{' '}
                                    {this._glyphFor(SORTBY.update)}
                                </th>

                                <th scope="col" onClick={function() {
                                    self._sortBy(SORTBY.status);
                                }}>
                                    Status{' '}
                                    {this._glyphFor(SORTBY.status)}
                                </th>

                                <th scope='col' className='hide508'>
                                    Delete
                                </th>
                            </tr>
                        </thead>
                    </Table>
                    <div className='scrollable-table-container'>
                        <Table id='caseSelectorTable'
                            className='caseSelector'>
                            <tbody>
                                { cases }
                            </tbody>
                        </Table>
                    </div>
                    <Table className='caseSelector'>
                        <tfoot>
                            { footerRow }
                        </tfoot>
                    </Table>
                    <div className='restore-case'>
                        {HelpBlurbs.Restore()}
                        <FileDialogLink
                            onFileUpload={this._onFileUpload}
                            targetRoute='/upload_archive/'
                        >
                            <AppButton
                                name={
                                    this.state.processing ?
                                              'Restoring' :
                                              'Restore'
                                }
                                onClick={function(){}}
                            />
                        </FileDialogLink>
                    </div>
                </div>
            </div>
        );
    }
});

export default PageCases;
