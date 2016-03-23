import React from 'react';
import { Navigation } from 'react-router';
import $ from 'jquery';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import LoadingIcon from 'common/components/LoadingIcon';

/**
 * Route handler for rendering the OpenCase page.
 * This page requests a case from the server and
 * redirects once the request has succeeded.
 * @component
 * @exports Pages\Dashboard\Case\OpenCase
 */
const PageOpenCase = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Get the current case's state from the server.
     * On success navigate back to the last page.
     */
    _getCase: function() {

        let { name } = this.props.params;

        util.get(`/get_case/${name}`)
            .fail(() => this.transitionTo('case_not_found', { name }))
            .then(NeatApp.setCurrentCase)
            .then(this.goBack)
            .then(NeatApp.loadMappings);

    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [Navigation],

    componentWillMount: function () {
        this._getCase();
    },

    render: function() {
        return (
            <div className="text-center open-case-loading">
                <LoadingIcon />
            </div>
        );
    },

});

export default PageOpenCase;
