import _ from 'lodash';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';

var ProgressMessages = React.createClass({
    propTypes: {
        msgList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    },

    render: function() {
        if ( this.props.msgList.length === 0 ) {
            return null;
        }

        return (
            <ul className='progressmessages'>
                {_.map(this.props.msgList, function(msg, index) {
                    if ( index === 0 ) {
                        return <li><Glyphicon glyph='cog' className='fa-spin'/> {msg}</li>
                    } else {
                        return <li className='finishedprogress'><Glyphicon glyph='ok'/> {msg}</li>
                    }
                })}
            </ul>
        );
    }
});

export default ProgressMessages;
