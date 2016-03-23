import _ from 'lodash';
import React from 'react';
import { Table } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import ConfigurationOption from 'app/pages/Configure/ConfigurationOption';

/**
 * Route handler for rendering the configure page.
 * @component
 * @exports Pages\Dashboard\Configure
 */
const PageConfigure = React.createClass({

    render: function() {
        var app = NeatApp.getApp();
        var appOptions = app.NeatOptions;

        var checkOptions = _.map(appOptions, function(option, index) {
            if (option.input === 'checkbox') {
                return (
                    <ConfigurationOption option={option}
                        index={index}
                        key={index} />
                );
            }
        });

        return (
            <div className='splash-container-absolute'>
                <div className='splash-top'>
                    <div className='splash-head'>
                        <h2>Configure</h2>
                    </div>
                    <Table className='configureTable'>
                        <caption className='hide508'>
                            Options and preferences for the applications&#39;s user to configure.
                        </caption>
                        <thead className='splash-subhead'>
                            <tr>
                                <th>Enabled</th>
                                <th>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkOptions}
                        </tbody>
                    </Table>
               </div>
            </div>
        );
    }
});

export default PageConfigure;
