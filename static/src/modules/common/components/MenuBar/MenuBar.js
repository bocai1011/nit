import React from 'react';
import { State, Navigation, Link } from 'react-router';
import { Nav, NavItem, Navbar, ModalTrigger } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import MenuItem from 'common/components/MenuBar/MenuItem';
import keyboardNavItems from 'common/components/MenuBar/KeyboardNavItems';
import NotebookNotification from 'common/components/NotebookNotification';
import StagingProgressBar from 'staging/components/StagingProgressBar/StagingProgressBar';
import DropdownMenu from 'common/components/MenuBar/DropdownMenu';
import Mailto from 'common/components/Mailto';

/**
 * Simulate a click on the currently focused item.
 */
var goToFocusedItem = function() {
    var focusedItem = document.activeElement;
    if (focusedItem.className === 'dropdownMenuTopLevel'){
        focusedItem.click();
    }
};

/**
 * Component for rendering the main Neat menu bar.
 * @component
 * @exports lib\Components\MenuBar
 */
const MenuBar = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Navigate to the About Neat page, or, if this page already
     * has a marketing blurb at the bottom, scroll the window to view it.
     */
    _about: function (e) {
        if (this.props.marketing) {
            var element = document.getElementById('aboutNEAT');
            element.scrollIntoView({block: 'end', behavior: 'smooth'});
            e.preventDefault();
        }
        else {
            window.location.href='#/dashboard/about-neat';
            e.preventDefault();
        }
    },

    /**
     * Open a new tab and navigate to the dev manual.
     */
    _launchDevManual: function() {
        window.open('/devmanual/');
        return false;
    },

    /**
     * Do nothing, and prevent any default action this event might do.
     */
    _doNothing: function(e) {
        e.preventDefault();
        e.stopPropagation();
    },

    /**
     * Open a new tab and navigate to the current url.
     */
    _newTab: function() {
        var url = this.getPath();
        window.open('#' + url, '_blank');
    },

    _keyboardNav: function(e) {
        var keyChar = e.which || e.keyCode;
        if (keyboardNavItems[keyChar]) {
            if (typeof keyboardNavItems[keyChar] === 'function') {
                keyboardNavItems[keyChar]();
            } else {
                this.transitionTo(
                    keyboardNavItems[keyChar], NeatApp.getCurrentCase()
                );
            }
        }

        e.preventDefault();
    },

    _keyboardNavListener: function(e) {
        if (e.altKey) {
            this._keyboardNav(e);
        } else if (e.keyCode === 13) {
            goToFocusedItem();
        }
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [State, Navigation],

    propTypes: {
        marketing: React.PropTypes.bool,
    },

    getInitialState: function() {
        return {
            expandedMenu: null,
        };
    },

    componentDidMount: function() {
        document.body.addEventListener(
            'keydown', this._keyboardNavListener);
    },

    componentWillUnmount: function() {
        document.body.removeEventListener(
            'keydown', this._keyboardNavListener);
    },

    render: function () {
        var currentCase = NeatApp.getCurrentCase();
        var caseLink,
            powerToolLink,
            reportsLink,
            caseID,
            progress,
            shareLink,
            exportLink;

        // Create the Power Tool link, if it's available to the user.
        if (NeatApp.getApp().NeatOptions.PowerTool.value) {
            powerToolLink = (
                <ModalTrigger modal={<NotebookNotification />}>
                    <MenuItem onClick={this._doNothing}>
                        Power Tool
                    </MenuItem>
                </ModalTrigger>
            );
        } else {
            powerToolLink = null;
        }

        // If a case is open create the navigation links for the case.
        if (currentCase) {
            var params = {name: currentCase.name};

            caseID = (
                <MenuItem to='case-overview'
                    className='case-label'
                    params={params}>
                    <span>Case:</span>{' '}
                    {currentCase.base}{' '}
                    <i className={currentCase.status === 'locked' ? 'fa fa-lock' : 'fa fa-unlock'}></i>
                </MenuItem>
            );

            // Use this to create a mini-progress bar in the menu header.
            //progress = <StagingProgressBar mini />;

            caseLink = (
                <DropdownMenu to='staging'
                    params={params}
                    name='Staging'
                    quickKey='S'
                />
            );

            if (NeatApp.finalized()) {
                reportsLink = (
                    <DropdownMenu to='reports-start'
                        params={params}
                        name='Reports'
                        quickKey='R'
                    />
                );
            }

            shareLink = {
                label: 'Share Case...',
                quickKey: 'E',
                url: 'share',
                params: params,
            };

            exportLink = {
                label: 'Export Data...',
                quickKey: 'D',
                url: 'export',
                params: params,
            };

        }

        // List all submenu items with their urls,
        // giving each item either a page url or a specific onClick method.
        // If a custom component is necessary,
        // enter the full component as a 'substitute:' argument.
        var file_menuLinks = [
            {label: 'New Case...', quickKey:'N', url: 'new-case'},
            {label: 'New Tab...', quickKey:'T', onClick: this._newTab },
            {label: 'Open Case...', quickKey:'O', url: 'cases'},
            shareLink,
            exportLink,
            {label: 'Status', url: 'status'},
            {label: 'Configure...', quickKey:'C', url: 'configure'}
        ];

        var help_menuLinks = [
            {
                label: 'User Manual',
                quickKey:'M',
                url: 'manual'
            },
            {
                label: 'Development Manual',
                onClick: this._launchDevManual,
                quickKey:'V'
            },
            {
                label: 'About NEAT',
                onClick: this._about,
                url:'about-neat'
            },
        ];

        return (
            <Navbar fixedTop fluid>
                <div className='navbar-header'>
                    <Link to='dashboard' className='navbar-brand'>
                        NEAT
                        <span className='hide508'> home</span>
                    </Link>
                </div>
                <Nav>
                    {caseID}
                    {progress}
                </Nav>
                <div className='feedback-btn'>
                    <Mailto>
                        <i className='fa fa-envelope' />{' '}
                        Send Feedback
                    </Mailto>
                </div>
                <Nav right>
                    <DropdownMenu name='File'
                        quickKey='F'
                        subitems={file_menuLinks}
                        expandedMenu={this.state.expandedMenu}
                    />
                    {powerToolLink}
                    {caseLink}
                    {reportsLink}
                    <DropdownMenu name='Help'
                        quickKey='H'
                        subitems={help_menuLinks}
                        expandedMenu={this.state.expandedMenu}
                    />
                </Nav>
            </Navbar>
        );
    }
});

export default MenuBar;
