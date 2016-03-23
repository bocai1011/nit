import React from 'react';
import katex from 'katex';

/**
 * Component for rendering a Katex blurb.
 * The Katex string should be passed in as a child component string.
 * Example: <Katex>{'\\int_0^\\infnty 1/x^2'}</Katex>.
 * Note that js strings must have backslashes escaped.
 * @component
 * @exports lib\Components\Katex
 */
const Katex = React.createClass({
    componentDidMount: function () {
        katex.render(
            '\\displaystyle{' + this.props.children + '}',
            this.refs.div.getDOMNode()
        );
    },

    render: function () {
        return <div ref='div' />;
    }
});

export default Katex;
