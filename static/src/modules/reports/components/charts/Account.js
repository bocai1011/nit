import React from 'react';
import Link from 'reports/components/charts/Link';

/**
 * Component for rendering a Link plot widget of an account name.
 * @component
 * @exports lib\Components\Charts\Account
 */
const Account = React.createClass({
    getDefaultProps: function() {
        return {
            to:'Overview for Account',
        }
    },

    render: function() {
        return <Link {...this.props} title='account' linking_to={this.props.to} link_ref={[['account']]} link_value={[['value']]} />;
    },
});

export default Account;
