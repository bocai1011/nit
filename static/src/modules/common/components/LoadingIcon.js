import React from 'react';

/**
 * Component for rendering a loading icon.
 * Pass the 'white' flag to draw a white icon, useful for when
 * the icon will render against a dark background.
 * @component
 * @exports lib\Components\LoadingIcon
 */
const LoadingIcon = React.createClass({

    propTypes: {
        text: React.PropTypes.node,
        white: React.PropTypes.bool,
    },

    getDefaultProps: function () {
        return {
            text: 'Loading...',
        };
    },

    render: function() {

        var style = null;
        if (this.props.white) {
            style = {'color':'#FFF'};
        }

        return (
            <div {...this.props} style={style}>
                <i className="fa fa-spinner fa-spin"></i>
                {' '}{ this.props.text }
            </div>
        );
    }
});

export default LoadingIcon;
